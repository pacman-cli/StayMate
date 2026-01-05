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
        private final com.webapp.domain.ai.service.MatchingService matchingService;

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
                // Count ACTIVE users only (excluding BANNED, DELETED, etc.)
                long totalUsers = userRepository.countByRoleAndAccountStatus(RoleName.ROLE_USER,
                                com.webapp.domain.user.enums.AccountStatus.ACTIVE);
                // Count ACTIVE landlords only
                long totalLandlords = userRepository.countByRoleAndAccountStatus(RoleName.ROLE_HOUSE_OWNER,
                                com.webapp.domain.user.enums.AccountStatus.ACTIVE);

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

                long emergencyRoomsAvailable = propertyRepository.countByStatus("Active"); // Simplified

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
                                .totalUsers(totalUsers)
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
                                .occupancyAnalytics(java.util.Collections.emptyList())
                                .propertyGrowthStats(java.util.Collections.emptyList())
                                .propertyTypeStats(typeStats)
                                .locationOccupancyStats(locStats)
                                .build();
        }

        @Override
        public LandlordDashboardDTO getLandlordDashboard(User user) {
                long activeProperties = propertyRepository.countByOwnerIdAndStatus(user.getId(), "Active");
                long totalProperties = propertyRepository.countByOwnerId(user.getId());

                long pendingRequests = bookingRepository.countByLandlordIdAndStatus(user.getId(),
                                com.webapp.domain.booking.enums.BookingStatus.PENDING);

                java.math.BigDecimal revenue = propertyRepository.sumRevenueByOwnerId(user.getId());
                Long views = propertyRepository.sumViewsByOwnerId(user.getId());
                Long inquiries = propertyRepository.sumInquiriesByOwnerId(user.getId());

                // Occupancy: Confirmed Bookings / Total Properties
                long activeBookings = bookingRepository.countByLandlordIdAndStatus(user.getId(),
                                com.webapp.domain.booking.enums.BookingStatus.CONFIRMED);
                double occupancy = totalProperties > 0 ? ((double) activeBookings / totalProperties) * 100.0 : 0.0;

                // Incoming Tenant Requests (Real)
                List<com.webapp.domain.booking.dto.BookingResponse> incomingRequests = bookingRepository
                                .findIncomingRequests(user.getId(),
                                                org.springframework.data.domain.PageRequest.of(0, 5))
                                .stream()
                                .map(this::mapToBookingResponse)
                                .collect(Collectors.toList());

                // My Properties Overview (Real)
                List<com.webapp.domain.property.dto.PropertyResponse> myProperties = propertyRepository
                                .findTop5ByOwnerIdOrderByCreatedAtDesc(user.getId())
                                .stream()
                                .map(this::mapToPropertyResponse)
                                .collect(Collectors.toList());

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
        }

        @Override
        public UserDashboardDTO getUserDashboard(User user) {
                long upcoming = bookingRepository.countUpcomingByTenantId(user.getId());
                long unread = messageRepository.countUnreadByRecipientId(user.getId());

                List<com.webapp.domain.property.dto.PropertyResponse> recommended = propertyRepository
                                .searchProperties(user.getCity(), null, null, null, null, null)
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

                // Emergency Rooms: Find lowest price available rooms (Real)
                List<com.webapp.domain.property.dto.PropertyResponse> emergency = propertyRepository
                                .findTop5ByStatusOrderByPriceAmountAsc("Active")
                                .stream()
                                .map(this::mapToPropertyResponse)
                                .collect(Collectors.toList());

                // Calculate Average Compatibility Score if matches exist
                double avgMatchScore = 0.0;
                if (!aiMatches.isEmpty()) {
                        avgMatchScore = aiMatches.stream()
                                        .mapToInt(m -> m.getCompatibilityScore() != null ? m.getCompatibilityScore()
                                                        : 0)
                                        .average()
                                        .orElse(0.0);
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
                                .status(property.getStatus())
                                .views(property.getViews())
                                .inquiries(property.getInquiries())
                                .priceAmount(property.getPriceAmount())
                                .ownerName(property.getOwner() != null ? property.getOwner().getFullName() : "Unknown")
                                .ownerId(property.getOwner() != null ? property.getOwner().getId() : null)
                                .imageUrl(property.getImageUrl())
                                .latitude(property.getLatitude())
                                .longitude(property.getLongitude())
                                .build();
        }
}
