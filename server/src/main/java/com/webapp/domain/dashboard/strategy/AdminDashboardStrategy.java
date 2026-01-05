package com.webapp.domain.dashboard.strategy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.webapp.domain.dashboard.dto.DashboardMetric;
import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.RoleName;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminDashboardStrategy implements DashboardStrategy {

        private final UserRepository userRepository;
        private final com.webapp.domain.property.repository.PropertyRepository propertyRepository;
        private final com.webapp.domain.booking.repository.BookingRepository bookingRepository;
        private final com.webapp.domain.review.repository.ReviewRepository reviewRepository;
        private final com.webapp.domain.report.repository.ReportRepository reportRepository;
        private final com.webapp.domain.user.mapper.UserMapper userMapper;

        @Override
        public RoleName getRole() {
                return RoleName.ROLE_ADMIN;
        }

        @Override
        public DashboardStats aggregate(User user) {
                List<DashboardMetric> metrics = new ArrayList<>();

                LocalDateTime lastMonth = LocalDateTime.now().minusDays(30);

                // 1. Total Users
                long totalUsers = userRepository.count();
                long totalUsersBefore = userRepository.countByCreatedAtBefore(lastMonth);
                metrics.add(createMetric("Total Users", totalUsers, totalUsersBefore, "users", "blue"));

                // 2. Active Users
                long activeUsers = userRepository.countByEnabledTrue();
                long activeUsersBefore = userRepository.countByEnabledTrueAndCreatedAtBefore(lastMonth);
                metrics.add(createMetric("Active Users", activeUsers, activeUsersBefore, "user-check", "emerald"));

                // 3. Pending Verifications
                long pendingVerifications = userRepository.countByEmailVerifiedFalse();
                long pendingVerificationsBefore = userRepository.countByEmailVerifiedFalseAndCreatedAtBefore(lastMonth);
                metrics.add(createMetric("Pending Verifications", pendingVerifications, pendingVerificationsBefore,
                                "shield", "amber"));

                // 4. Admins
                long totalAdmins = userRepository.countByRolesContaining(RoleName.ROLE_ADMIN);
                long totalAdminsBefore = userRepository.countByRolesContainingAndCreatedAtBefore(RoleName.ROLE_ADMIN,
                                lastMonth);
                metrics.add(createMetric("Admins", totalAdmins, totalAdminsBefore, "lock", "purple"));

                // 5. Total Revenue (Financials)
                java.math.BigDecimal totalRevenue = bookingRepository.sumTotalRevenue();
                if (totalRevenue == null)
                        totalRevenue = java.math.BigDecimal.ZERO;

                java.math.BigDecimal revenueLastMonth = bookingRepository.sumRevenueSince(lastMonth);
                if (revenueLastMonth == null)
                        revenueLastMonth = java.math.BigDecimal.ZERO;

                // Calculate "Revenue Before" conservatively (Total - Last Month)
                java.math.BigDecimal revenueBefore = totalRevenue.subtract(revenueLastMonth);

                metrics.add(createFinancialMetric("Total Revenue", totalRevenue, revenueBefore));

                // 6. Total Bookings
                long totalBookings = bookingRepository.count();
                // Simple placeholder for previous bookings count if not strictly needed or
                // calculate
                metrics.add(createMetric("Total Bookings", totalBookings, totalBookings, "bookmark", "indigo")); // Change
                                                                                                                 // 0%
                                                                                                                 // for
                                                                                                                 // now

                long totalHouseOwners = userRepository.countByRolesContaining(RoleName.ROLE_HOUSE_OWNER);
                long totalRegularUsers = userRepository.countByRolesContaining(RoleName.ROLE_USER);

                // 5. Build Complex Stats
                DashboardStats.UserStats userStats = getUserStats(totalUsers, lastMonth);
                DashboardStats.ListingStats listingStats = getListingStats();
                DashboardStats.SafetyStats safetyStats = getSafetyStats();

                // 6. Global Recent Bookings (for Admin)
                List<com.webapp.domain.booking.entity.Booking> recentBookingsEntities = bookingRepository
                                .findRecentBookings(org.springframework.data.domain.PageRequest.of(0, 5));
                List<com.webapp.domain.booking.dto.BookingResponse> recentBookings = recentBookingsEntities.stream()
                                .map(this::mapToBookingResponse)
                                .collect(java.util.stream.Collectors.toList());

                // 7. Pending Actions Lists
                List<com.webapp.domain.user.dto.UserDto> pendingUsers = userRepository.findByEmailVerifiedFalse()
                                .stream()
                                .map(userMapper::toDto)
                                .collect(java.util.stream.Collectors.toList());

                List<com.webapp.domain.property.dto.PropertyResponse> pendingProperties = propertyRepository
                                .findByStatus("Pending").stream()
                                .map(this::mapToPropertyResponse)
                                .collect(java.util.stream.Collectors.toList());

                return DashboardStats.builder()
                                .userRole(getRole().name())
                                .metrics(metrics)
                                .totalUsers(totalUsers)
                                .activeUsers(activeUsers)
                                .pendingVerifications(pendingVerifications)
                                .totalAdmins(totalAdmins)
                                .totalHouseOwners(totalHouseOwners)
                                .totalRegularUsers(totalRegularUsers)
                                .userStats(userStats)
                                .listingStats(listingStats)
                                .safetyStats(safetyStats)
                                .recentBookings(recentBookings)
                                .pendingVerificationUsers(pendingUsers)
                                .pendingApprovalProperties(pendingProperties)
                                .build();
        }

        private com.webapp.domain.booking.dto.BookingResponse mapToBookingResponse(
                        com.webapp.domain.booking.entity.Booking booking) {
                return com.webapp.domain.booking.dto.BookingResponse.builder()
                                .id(booking.getId())
                                .tenantName(booking.getTenant().getFullName())
                                .tenantProfilePictureUrl(booking.getTenant().getProfilePictureUrl())
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
                                .build();
        }

        private DashboardStats.UserStats getUserStats(long totalUsers, LocalDateTime lastMonth) {
                long newUsersLast7Days = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));
                long activeUsers24h = userRepository.countByLastLoginAtAfter(LocalDateTime.now().minusHours(24));

                java.util.Map<String, Long> roleDist = new java.util.HashMap<>();
                roleDist.put("Admin", userRepository.countByRolesContaining(RoleName.ROLE_ADMIN));
                roleDist.put("Landlord", userRepository.countByRolesContaining(RoleName.ROLE_HOUSE_OWNER));
                roleDist.put("Tenant", userRepository.countByRolesContaining(RoleName.ROLE_USER));

                return DashboardStats.UserStats.builder()
                                .totalUsers(totalUsers)
                                .newUsersLast7Days(newUsersLast7Days)
                                .activeUsers24h(activeUsers24h)
                                .userRoleDistribution(roleDist)
                                .build();
        }

        private DashboardStats.ListingStats getListingStats() {
                long totalListings = propertyRepository.count();
                long activeListings = propertyRepository.countByStatus("Active");
                long pendingListings = propertyRepository.countByStatus("Pending");

                List<Object[]> topLocationsRaw = propertyRepository
                                .findTopLocations(org.springframework.data.domain.PageRequest.of(0, 5));
                java.util.Map<String, Long> topLocations = new java.util.HashMap<>();
                for (Object[] row : topLocationsRaw) {
                        topLocations.put((String) row[0], (Long) row[1]);
                }

                return DashboardStats.ListingStats.builder()
                                .totalListings(totalListings)
                                .activeListings(activeListings)
                                .pendingListings(pendingListings)
                                .listingsByCity(topLocations)
                                .build();
        }

        private DashboardStats.SafetyStats getSafetyStats() {
                long openReports = reportRepository.countByStatus(com.webapp.domain.report.enums.ReportStatus.PENDING);
                long criticalAlerts = reportRepository.countHighRiskReports();
                Double avgRating = reviewRepository.getAverageRating();
                long totalReviews = reviewRepository.count();

                List<com.webapp.domain.report.dto.ReportResponse> recentReports = reportRepository
                                .findRecentRiskyReports(org.springframework.data.domain.PageRequest.of(0, 5))
                                .stream()
                                .map(this::mapToReportResponse)
                                .collect(java.util.stream.Collectors.toList());

                return DashboardStats.SafetyStats.builder()
                                .openReports(openReports)
                                .criticalAlerts(criticalAlerts)
                                .averagePlatformRating(avgRating != null ? avgRating : 0.0)
                                .totalReviews(totalReviews)
                                .recentReports(recentReports)
                                .build();
        }

        private com.webapp.domain.report.dto.ReportResponse mapToReportResponse(
                        com.webapp.domain.report.entity.Report report) {
                return com.webapp.domain.report.dto.ReportResponse.builder()
                                .id(report.getId())
                                .reporterName(report.getReporter() != null ? report.getReporter().getFullName()
                                                : "Unknown")
                                .reportedUserName(report.getReportedUser() != null
                                                ? report.getReportedUser().getFullName()
                                                : "Unknown")
                                .reason(report.getReason())
                                .description(report.getDescription())
                                .severity(report.getSeverity())
                                .status(report.getStatus())
                                .createdAt(report.getCreatedAt())
                                .timeAgo(calculateTimeAgo(report.getCreatedAt()))
                                .build();
        }

        private String calculateTimeAgo(java.time.LocalDateTime dateTime) {
                if (dateTime == null)
                        return "N/A";
                java.time.Duration duration = java.time.Duration.between(dateTime, java.time.LocalDateTime.now());
                long minutes = duration.toMinutes();

                if (minutes < 60)
                        return minutes + "m ago";
                long hours = duration.toHours();
                if (hours < 24)
                        return hours + "h ago";
                long days = duration.toDays();
                return days + "d ago";
        }

        private DashboardMetric createMetric(String label, long current, long previous, String icon, String color) {
                long change = current - previous;
                String trend = change >= 0 ? "up" : "down";
                if (change == 0)
                        trend = "neutral";

                String changeStr;
                if (previous == 0) {
                        changeStr = change > 0 ? "+100%" : "0%";
                } else {
                        long percent = (change * 100) / previous;
                        changeStr = (percent > 0 ? "+" : "") + percent + "%";
                }

                return DashboardMetric.builder()
                                .label(label)
                                .value(String.valueOf(current))
                                .type("count")
                                .change(changeStr)
                                .trend(trend)
                                .icon(icon)
                                .color(color)
                                .build();
        }

        private DashboardMetric createFinancialMetric(String label, java.math.BigDecimal current,
                        java.math.BigDecimal previous) {
                java.math.BigDecimal change = current.subtract(previous);
                String trend = change.compareTo(java.math.BigDecimal.ZERO) >= 0 ? "up" : "down";
                if (change.compareTo(java.math.BigDecimal.ZERO) == 0)
                        trend = "neutral";

                String changeStr;
                if (previous.compareTo(java.math.BigDecimal.ZERO) == 0) {
                        changeStr = current.compareTo(java.math.BigDecimal.ZERO) > 0 ? "+100%" : "0%";
                } else {
                        java.math.BigDecimal percent = change.multiply(new java.math.BigDecimal(100))
                                        .divide(previous, 0, java.math.RoundingMode.HALF_UP);
                        changeStr = (percent.compareTo(java.math.BigDecimal.ZERO) > 0 ? "+" : "") + percent + "%";
                }

                return DashboardMetric.builder()
                                .label(label)
                                .value("BDT " + current.toString()) // Currency hardcoded for now
                                .type("currency")
                                .change(changeStr)
                                .trend(trend)
                                .icon("dollar-sign")
                                .color("green")
                                .build();
        }
}
