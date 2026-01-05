package com.webapp.domain.dashboard.dto;

import java.util.List;

import com.webapp.domain.property.dto.PropertyResponse;
import com.webapp.domain.user.dto.UserDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private String userRole;
    private List<DashboardMetric> metrics;

    // Admin & User Stats
    private Long totalUsers;
    private Long totalHouseOwners;
    private Long totalRegularUsers;
    private Long totalAdmins;
    private Long activeUsers;
    private Long pendingVerifications;

    // House Owner Stats
    private Long totalProperties;
    private Long activeBookings;
    private Long pendingBookings;
    private Long completedBookings;

    // Tenant Stats
    private Integer profileCompletion;
    private Integer unreadMessagesCount;
    private Long matchesCount;
    private Long applicationsSent;
    private Long upcomingBookings;

    // Enhanced Landlord Stats
    private List<com.webapp.domain.booking.dto.BookingResponse> recentBookings;
    private java.util.Map<String, Long> propertyStatusStats;

    // Admin Dashboard 2.0 Aggregations
    private SafetyStats safetyStats;
    private UserStats userStats;
    private ListingStats listingStats;

    // Admin Action Items
    private List<UserDto> pendingVerificationUsers;
    private List<PropertyResponse> pendingApprovalProperties;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SafetyStats {
        private long openReports;
        private long criticalAlerts; // High + Critical severity
        private double averagePlatformRating;
        private long totalReviews;
        private java.util.List<com.webapp.domain.report.dto.ReportResponse> recentReports;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long newUsersLast7Days;
        private long activeUsers24h;
        private java.util.Map<String, Long> userRoleDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingStats {
        private long totalListings;
        private long activeListings;
        private long pendingListings;
        private java.util.Map<String, Long> listingsByCity; // Top 5 cities
    }
}
