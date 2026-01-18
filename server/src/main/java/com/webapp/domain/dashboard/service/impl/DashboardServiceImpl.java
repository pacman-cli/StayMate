package com.webapp.domain.dashboard.service.impl;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.audit.repository.AuditLogRepository;
import com.webapp.domain.booking.repository.BookingRepository;
import com.webapp.domain.dashboard.dto.AdminDashboardDTO;
import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.dashboard.dto.LandlordDashboardDTO;
import com.webapp.domain.dashboard.dto.UserDashboardDTO;
import com.webapp.domain.dashboard.service.DashboardService;
import com.webapp.domain.dashboard.strategy.DashboardStrategy;
import com.webapp.domain.maintenance.repository.MaintenanceRequestRepository;
import com.webapp.domain.messaging.repository.MessageRepository;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.report.repository.ReportRepository;
import com.webapp.domain.saved.repository.SavedPropertyRepository;
import com.webapp.domain.saved.repository.SavedRoommateRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.RoleName;
import com.webapp.domain.user.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

        private final MessageRepository messageRepository;
        private final UserRepository userRepository;
        private final PropertyRepository propertyRepository;
        private final BookingRepository bookingRepository;
        private final ReportRepository reportRepository;
        private final MaintenanceRequestRepository maintenanceRequestRepository;
        private final AuditLogRepository auditLogRepository;
        private final SavedPropertyRepository savedPropertyRepository;
        private final SavedRoommateRepository savedRoommateRepository;
        private final com.webapp.domain.roommate.RoommatePostRepository roommatePostRepository;
        private final com.webapp.domain.user.mapper.UserMapper userMapper;
        private final com.webapp.domain.notification.repository.NotificationRepository notificationRepository;

        private final com.webapp.domain.ai.service.MatchingService matchingService;
        private final com.webapp.domain.roommate.RoommateService roommateService;
        private final com.webapp.domain.verification.repository.VerificationRequestRepository verificationRequestRepository;
        private final com.webapp.domain.dashboard.repository.ExpenseRepository expenseRepository;

        // Existing strategies (keeping for legacy support)
        private final List<DashboardStrategy> strategies;
        private Map<RoleName, DashboardStrategy> strategyMap;

        @PostConstruct
        public void init() {
                strategyMap = strategies.stream()
                                .collect(Collectors.toMap(DashboardStrategy::getRole, Function.identity()));
        }

        @Override
        public DashboardStats getUserStats(User user) {
                RoleName userRole = RoleName.ROLE_USER;
                if (user.getRoles().contains(RoleName.ROLE_ADMIN)) {
                        userRole = RoleName.ROLE_ADMIN;
                } else if (user.getRoles().contains(RoleName.ROLE_HOUSE_OWNER)) {
                        userRole = RoleName.ROLE_HOUSE_OWNER;
                }

                DashboardStrategy strategy = strategyMap.get(userRole);
                if (strategy == null) {
                        // Fallback to USER if no specific strategy found (though map should have it)
                        strategy = strategyMap.get(RoleName.ROLE_USER);
                        if (strategy == null)
                                throw new IllegalArgumentException("No dashboard strategy found for role: " + userRole);
                }

                return strategy.aggregate(user);
        }

        @Override
        public AdminDashboardDTO getAdminDashboard(User user) {
                // FIXED: Use new accurate counting methods to prevent double-counting users
                // with multiple roles

                // Total Tenants (ROLE_USER excluding admins)
                long totalActiveUsers = userRepository.countNonAdminUsersByRoleAndStatus(
                                RoleName.ROLE_USER,
                                com.webapp.domain.user.enums.AccountStatus.ACTIVE);

                // Users with ROLE_HOUSE_OWNER (excluding admins)
                long totalLandlords = userRepository.countNonAdminUsersByRoleAndStatus(
                                RoleName.ROLE_HOUSE_OWNER,
                                com.webapp.domain.user.enums.AccountStatus.ACTIVE);

                // For "Total Users" display, we use totalActiveUsers (now strictly Tenants)

                long totalListings = propertyRepository.count();
                long verifiedListings = propertyRepository.countVerifiedProperties();
                long pendingVerifications = userRepository.countByEmailVerifiedFalse();

                Long rentedBeds = propertyRepository.sumRentedBeds();
                Long totalBeds = propertyRepository.sumTotalBeds();
                double occupancyRate = (totalBeds != null && totalBeds > 0 && rentedBeds != null)
                                ? ((double) rentedBeds / totalBeds) * 100.0
                                : 0.0;

                // Use the fixed query method which returns Page<Report>
                List<com.webapp.domain.report.dto.ReportResponse> alerts = reportRepository
                                .findRecentRiskyReports(org.springframework.data.domain.PageRequest.of(0, 5))
                                .getContent() // Extract list from Page
                                .stream()
                                .map(report -> com.webapp.domain.report.dto.ReportResponse.builder()
                                                .id(report.getId())
                                                .reporterName(report.getReporter() != null
                                                                ? report.getReporter().getFullName()
                                                                : "Unknown")
                                                .reportedUserName(
                                                                report.getReportedUser() != null
                                                                                ? report.getReportedUser().getFullName()
                                                                                : "Unknown")
                                                .reason(report.getReason())
                                                .description(report.getDescription())
                                                .severity(report.getSeverity())
                                                .status(report.getStatus())
                                                .createdAt(report.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());

                long openReqs = maintenanceRequestRepository.countByStatusIn(List.of(
                                com.webapp.domain.maintenance.entity.MaintenanceRequest.Status.OPEN,
                                com.webapp.domain.maintenance.entity.MaintenanceRequest.Status.IN_PROGRESS));

                long auditLogsToday = auditLogRepository.count();

                long totalBookings = bookingRepository.count();
                long confirmedBookings = bookingRepository
                                .countByStatus(com.webapp.domain.booking.enums.BookingStatus.CONFIRMED);
                long cancelledBookings = bookingRepository
                                .countByStatus(com.webapp.domain.booking.enums.BookingStatus.CANCELLED);

                long totalPendingRoommatePosts = roommatePostRepository
                                .countByStatus(com.webapp.domain.roommate.RoommatePostStatus.PENDING);
                long activeRoommatePosts = roommatePostRepository
                                .countByStatus(com.webapp.domain.roommate.RoommatePostStatus.APPROVED);

                long bannedUsers = userRepository
                                .countByAccountStatus(com.webapp.domain.user.enums.AccountStatus.BANNED);
                long warningUsers = userRepository
                                .countByAccountStatus(com.webapp.domain.user.enums.AccountStatus.WARNING);
                long suspendedUsers = userRepository
                                .countByAccountStatus(com.webapp.domain.user.enums.AccountStatus.SUSPENDED);

                long emergencyRoomsAvailable = propertyRepository
                                .countByStatus(com.webapp.domain.property.enums.PropertyStatus.ACTIVE); // Simplified

                // Real Property Type Stats
                List<java.util.Map<String, Object>> typeStats = propertyRepository.countPropertiesByType().stream()
                                .map(row -> {
                                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                                        map.put("name", row[0] != null ? row[0].toString() : "Unknown");
                                        map.put("value", row[1]);
                                        return map;
                                })
                                .collect(Collectors.toList());

                // Real Location Occupancy Stats
                List<java.util.Map<String, Object>> locStats = propertyRepository.findOccupancyByLocation().stream()
                                .map(row -> {
                                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                                        String loc = row[0] != null ? row[0].toString() : "Unknown";
                                        long rented = ((Number) row[1]).longValue();
                                        long total = ((Number) row[2]).longValue();
                                        // Calculate approx occupied/vacant % or counts
                                        // Frontend expects: { name: "Gulshan", occupied: 85, vacant: 15 } (counts or %)
                                        // Let's send counts and let frontend handle % if needed, or send %
                                        // PropertyInsights.tsx uses `occupied` and `vacant` as values in BarChart
                                        // (stacked)
                                        // Ideally normalized to 100% or absolute numbers?
                                        // The mock data used 85, 15 which sums to 100. So it expects percentages.
                                        double occupiedPct = total > 0 ? (double) rented / total * 100 : 0;
                                        double vacantPct = 100.0 - occupiedPct;

                                        map.put("name", loc);
                                        map.put("occupied", Math.round(occupiedPct));
                                        map.put("vacant", Math.round(vacantPct));
                                        return map;
                                })
                                .limit(5) // Limit to top 5 locations to avoid clutter
                                .collect(Collectors.toList());

                return AdminDashboardDTO.builder()
                                .totalUsers(totalActiveUsers) // Fixed: now uses total active users instead of
                                                              // role-based count
                                .totalLandlords(totalLandlords)
                                .totalListings(totalListings)
                                .verifiedListingsCount(verifiedListings)
                                .pendingVerificationsCount(pendingVerifications)
                                .seatOccupancyRate(occupancyRate)
                                .recentFraudAlerts(alerts)
                                .openMaintenanceRequests(openReqs)
                                .todayAuditLogs(auditLogsToday)
                                .totalBookings(totalBookings)
                                .confirmedBookings(confirmedBookings)
                                .cancelledBookings(cancelledBookings)
                                .pendingRoommatePostsCount(totalPendingRoommatePosts)
                                .activeRoommatePostsCount(activeRoommatePosts)
                                .bannedUsersCount(bannedUsers)
                                .warningUsersCount(warningUsers + suspendedUsers)
                                .totalEmergencyRoomsAvailable(emergencyRoomsAvailable)
                                .pendingVerificationUsers(userRepository.findTop5ByEmailVerifiedFalse().stream()
                                                .map(userMapper::toDto)
                                                .collect(Collectors.toList()))
                                .occupancyAnalytics(java.util.Collections.emptyList())
                                .propertyGrowthStats(java.util.Collections.emptyList())
                                .propertyTypeStats(typeStats)
                                .locationOccupancyStats(locStats)
                                .build();
        }

        @Override
        public LandlordDashboardDTO getLandlordDashboard(User user) {
                // Use CompletableFuture to run independent queries in parallel
                java.util.concurrent.CompletableFuture<Long> activePropertiesFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> propertyRepository.countByOwnerIdAndStatus(user.getId(),
                                                com.webapp.domain.property.enums.PropertyStatus.ACTIVE));

                java.util.concurrent.CompletableFuture<Long> totalPropertiesFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> propertyRepository.countByOwnerId(user.getId()));

                java.util.concurrent.CompletableFuture<Long> pendingRequestsFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> bookingRepository.countByLandlordIdAndStatus(user.getId(),
                                                com.webapp.domain.booking.enums.BookingStatus.PENDING));

                java.util.concurrent.CompletableFuture<java.math.BigDecimal> revenueFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> propertyRepository.sumRevenueByOwnerId(user.getId()));

                java.util.concurrent.CompletableFuture<Long> viewsFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> propertyRepository.sumViewsByOwnerId(user.getId()));

                java.util.concurrent.CompletableFuture<Long> inquiriesFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> propertyRepository.sumInquiriesByOwnerId(user.getId()));

                java.util.concurrent.CompletableFuture<Long> activeBookingsFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> bookingRepository.countByLandlordIdAndStatus(user.getId(),
                                                com.webapp.domain.booking.enums.BookingStatus.CONFIRMED));

                // Incoming Tenant Requests (Real)
                java.util.concurrent.CompletableFuture<List<com.webapp.domain.booking.dto.BookingResponse>> incomingRequestsFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> bookingRepository
                                                .findIncomingRequests(user.getId(),
                                                                org.springframework.data.domain.PageRequest.of(0, 5))
                                                .stream()
                                                .map(booking -> mapToBookingResponse(booking))
                                                .collect(Collectors.toList()));

                // My Properties Overview (Real)
                // Pass 'user' to mapToPropertyResponse to avoid lazy loading
                java.util.concurrent.CompletableFuture<List<com.webapp.domain.property.dto.PropertyResponse>> myPropertiesFuture = java.util.concurrent.CompletableFuture
                                .supplyAsync(() -> propertyRepository
                                                .findTop5ByOwnerIdOrderByCreatedAtDesc(user.getId())
                                                .stream()
                                                .map(property -> mapToPropertyResponse(property, user))
                                                .collect(Collectors.toList()));

                // Wait for all
                java.util.concurrent.CompletableFuture.allOf(activePropertiesFuture, totalPropertiesFuture,
                                pendingRequestsFuture, revenueFuture, viewsFuture, inquiriesFuture,
                                activeBookingsFuture, incomingRequestsFuture, myPropertiesFuture).join();

                try {
                        long activeProperties = activePropertiesFuture.get();
                        long totalProperties = totalPropertiesFuture.get();
                        long pendingRequests = pendingRequestsFuture.get();
                        java.math.BigDecimal revenue = revenueFuture.get();
                        Long views = viewsFuture.get();
                        Long inquiries = inquiriesFuture.get();
                        long activeBookings = activeBookingsFuture.get();
                        List<com.webapp.domain.booking.dto.BookingResponse> incomingRequests = incomingRequestsFuture
                                        .get();
                        List<com.webapp.domain.property.dto.PropertyResponse> myProperties = myPropertiesFuture.get();

                        // Occupancy: Confirmed Bookings / Total Properties
                        double occupancy = totalProperties > 0 ? ((double) activeBookings / totalProperties) * 100.0
                                        : 0.0;

                        return LandlordDashboardDTO.builder()
                                        .activePropertiesCount(activeProperties)
                                        .totalRequestsPending(pendingRequests)
                                        .totalRevenue(revenue != null ? revenue : java.math.BigDecimal.ZERO)
                                        .totalViews(views != null ? views : 0L)
                                        .totalInquiries(inquiries != null ? inquiries : 0L)
                                        .occupancyRate(occupancy)
                                        .incomingTenantRequests(incomingRequests)
                                        .myPropertiesOverview(myProperties)
                                        .build();
                } catch (Exception e) {
                        throw new RuntimeException("Error calculating dashboard stats", e);
                }
        }

        @Override
        public UserDashboardDTO getUserDashboard(User user) {
                long upcoming = bookingRepository.countUpcomingByTenantId(user.getId());
                long unread = notificationRepository.countUnreadByUserId(user.getId());

                List<com.webapp.domain.property.dto.PropertyResponse> recommended = propertyRepository
                                .searchProperties(user.getCity(), null, null, null, null, null,
                                                java.util.List.of(
                                                                com.webapp.domain.property.enums.PropertyStatus.APPROVED,
                                                                com.webapp.domain.property.enums.PropertyStatus.ACTIVE))
                                .stream().limit(3)
                                .map(p -> com.webapp.domain.property.dto.PropertyResponse.builder()
                                                .id(p.getId())
                                                .title(p.getTitle())
                                                .price(p.getPrice())
                                                .imageUrl(p.getImageUrl())
                                                .location(p.getLocation())
                                                .beds(p.getBeds())
                                                .baths(p.getBaths())
                                                .build())
                                .collect(Collectors.toList());

                // Phase 8: AI Matching
                List<com.webapp.domain.ai.dto.AiMatchRecommendation> aiMatches = matchingService.findMatches(user);

                // Aggregated Counts
                long savedProps = savedPropertyRepository.countByUserId(user.getId());
                long savedRoommates = savedRoommateRepository.countByUserId(user.getId());
                long pendingVisits = bookingRepository.countByTenantIdAndStatus(user.getId(),
                                com.webapp.domain.booking.enums.BookingStatus.PENDING);

                // Active Searches (Mock -> Real if possible, else 0)
                long activeSearches = 0; // Set to 0 to be honest if we don't track it yet

                // Verification Progress Calculation
                boolean emailVerified = user.isEmailVerified();
                boolean phoneVerified = user.isPhoneVerified();
                boolean profileCompleted = (user.getBio() != null && !user.getBio().isEmpty())
                                && (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty());

                // Check for ID verification (APPROVED request of type ID_CARD or PASSPORT)
                boolean idVerified = verificationRequestRepository.existsByUserIdAndStatusAndDocumentTypeIn(
                                user.getId(),
                                com.webapp.domain.verification.entity.VerificationRequest.VerificationStatus.APPROVED,
                                List.of("ID_CARD", "PASSPORT", "GOVERNMENT_ID", "DRIVER_LICENSE"));

                // Check for Reference verification (could be another document type or logic)
                boolean referenceVerified = false; // Placeholder or check other doc types

                int progress = 0;
                if (emailVerified)
                        progress += 25;
                if (phoneVerified)
                        progress += 25;
                if (profileCompleted)
                        progress += 25;
                if (idVerified)
                        progress += 25;
                // Reference verification is currently unused/placeholder
                // if (referenceVerified) progress += 20;

                UserDashboardDTO.VerificationProgress verProgress = UserDashboardDTO.VerificationProgress.builder()
                                .totalProgress(progress)
                                .emailVerified(emailVerified)
                                .phoneVerified(phoneVerified)
                                .profileCompleted(profileCompleted)
                                .idVerified(idVerified)
                                .referenceVerified(referenceVerified)
                                .build();

                // Finance Stats (Expenses)
                java.math.BigDecimal totalSpentMonth = java.math.BigDecimal.ZERO;
                List<com.webapp.domain.dashboard.entity.Expense> expenses = expenseRepository
                                .findByPayerId(user.getId());
                // Filter for current month (simplified)
                java.time.LocalDate now = java.time.LocalDate.now();
                totalSpentMonth = expenses.stream()
                                .filter(e -> e.getExpenseDate().getMonth() == now.getMonth()
                                                && e.getExpenseDate().getYear() == now.getYear())
                                .map(com.webapp.domain.dashboard.entity.Expense::getAmount)
                                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                List<java.util.Map<String, Object>> recentExpenses = expenses.stream()
                                .sorted((e1, e2) -> e2.getExpenseDate().compareTo(e1.getExpenseDate()))
                                .limit(5)
                                .map(e -> {
                                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                                        map.put("id", e.getId());
                                        map.put("title", e.getTitle());
                                        map.put("amount", e.getAmount());
                                        map.put("date", e.getExpenseDate());
                                        return map;
                                })
                                .collect(Collectors.toList());

                // Next Rent Due (Mock -> Booking end date or fixed date?)
                // Let's assume next rent is due on 1st of next month for active booking?
                // Or just show 0 if no active booking.
                // Next Rent Due - Fixed logic
                java.math.BigDecimal nextRent = java.math.BigDecimal.ZERO;
                List<com.webapp.domain.booking.entity.Booking> activeBookings = bookingRepository
                                .findActiveBookingsByTenantId(user.getId());
                if (!activeBookings.isEmpty()) {
                        // Sum up the price/rent of all active properties (usually just one)
                        nextRent = activeBookings.stream()
                                        .map(b -> b.getProperty().getPriceAmount())
                                        .filter(java.util.Objects::nonNull)
                                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                }

                UserDashboardDTO.FinanceStats finance = UserDashboardDTO.FinanceStats.builder()
                                .totalSpentMonth(totalSpentMonth)
                                .nextRentDue(nextRent)
                                .recentExpenses(recentExpenses)
                                .build();

                // Emergency Rooms: Find real emergency rooms
                List<com.webapp.domain.property.dto.PropertyResponse> emergency = propertyRepository
                                .findByEmergencyAvailableTrueAndStatus(
                                                com.webapp.domain.property.enums.PropertyStatus.ACTIVE)
                                .stream()
                                .limit(5)
                                .map(this::mapToPropertyResponse)
                                .collect(Collectors.toList());

                // Calculate Average Compatibility Score
                double avgMatchScore = 0.0;
                if (!aiMatches.isEmpty()) {
                        avgMatchScore = aiMatches.stream()
                                        .mapToInt(m -> m.getCompatibilityScore() != null ? m.getCompatibilityScore()
                                                        : 0)
                                        .average()
                                        .orElse(0.0);
                } else {
                        // Fallback: Use RoommateService scores when AI is unavailable
                        try {
                                List<com.webapp.domain.roommate.RoommatePostDto> roommateMatches = roommateService
                                                .getMatches(user.getId());
                                if (!roommateMatches.isEmpty()) {
                                        // First, try to use actual match scores
                                        List<Integer> validScores = roommateMatches.stream()
                                                        .filter(m -> m.getMatchScore() != null && m.getMatchScore() > 0)
                                                        .map(com.webapp.domain.roommate.RoommatePostDto::getMatchScore)
                                                        .collect(Collectors.toList());

                                        if (!validScores.isEmpty()) {
                                                avgMatchScore = validScores.stream()
                                                                .mapToInt(Integer::intValue)
                                                                .average()
                                                                .orElse(0.0);
                                        } else {
                                                // If no matchScores (user has no roommate post), estimate based on post
                                                // quality
                                                avgMatchScore = roommateMatches.stream()
                                                                .mapToInt(m -> {
                                                                        int score = 50; // Base score
                                                                        if (m.getBio() != null
                                                                                        && m.getBio().length() > 20)
                                                                                score += 10;
                                                                        if (m.getLocation() != null
                                                                                        && !m.getLocation().isEmpty())
                                                                                score += 10;
                                                                        if (m.getPersonalityTags() != null && !m
                                                                                        .getPersonalityTags().isEmpty())
                                                                                score += 10;
                                                                        if (m.getInterests() != null
                                                                                        && !m.getInterests().isEmpty())
                                                                                score += 10;
                                                                        return Math.min(score, 90); // Cap at 90
                                                                })
                                                                .average()
                                                                .orElse(50.0);
                                        }
                                }
                        } catch (Exception e) {
                                // Silently fail, keep avgMatchScore at 0
                        }
                }

                return UserDashboardDTO.builder()
                                .compatibilityMatchStats(avgMatchScore)
                                .upcomingVisitsCount(upcoming)
                                .unreadNotificationsCount(unread)
                                .recommendedRooms(recommended)
                                .recommendedRoommates(aiMatches)
                                .savedItemsCount(savedProps + savedRoommates)
                                .activeSearchesCount(activeSearches)
                                .pendingVisitsCount(pendingVisits)
                                .emergencyRooms(emergency)
                                .verificationProgress(verProgress)
                                .financeStats(finance)
                                .build();
        }

        private com.webapp.domain.booking.dto.BookingResponse mapToBookingResponse(
                        com.webapp.domain.booking.entity.Booking booking) {
                return com.webapp.domain.booking.dto.BookingResponse.builder()
                                .id(booking.getId())
                                .tenantName(booking.getTenant() != null ? booking.getTenant().getFullName() : "Unknown")
                                .tenantProfilePictureUrl(
                                                booking.getTenant() != null ? booking.getTenant().getProfilePictureUrl()
                                                                : null)
                                .startDate(booking.getStartDate())
                                .endDate(booking.getEndDate())
                                .status(booking.getStatus())
                                .createdAt(booking.getCreatedAt())
                                .build();
        }

        private com.webapp.domain.property.dto.PropertyResponse mapToPropertyResponse(
                        com.webapp.domain.property.entity.Property property) {
                return mapToPropertyResponse(property, property.getOwner());
        }

        private com.webapp.domain.property.dto.PropertyResponse mapToPropertyResponse(
                        com.webapp.domain.property.entity.Property property, User owner) {
                return com.webapp.domain.property.dto.PropertyResponse.builder()
                                .id(property.getId())
                                .title(property.getTitle())
                                .description(property.getDescription())
                                .location(property.getLocation())
                                .price(property.getPrice())
                                .beds(property.getBeds())
                                .baths(property.getBaths())
                                .sqft(property.getSqft())
                                .rating(property.getRating())
                                .verified(property.isVerified())
                                .status(property.getStatus().name())
                                .views(property.getViews())
                                .inquiries(property.getInquiries())
                                .priceAmount(property.getPriceAmount())
                                .ownerName(owner != null ? owner.getFullName() : "Unknown")
                                .ownerId(owner != null ? owner.getId() : null)
                                .imageUrl(property.getImageUrl())
                                .latitude(property.getLatitude())
                                .longitude(property.getLongitude())
                                .propertyType(property.getPropertyType().name())
                                .isSaved(property.isSaved())
                                .build();
        }
}
