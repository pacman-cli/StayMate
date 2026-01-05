package com.webapp.domain.dashboard.dto;

import java.util.List;

import com.webapp.domain.report.dto.ReportResponse;
import com.webapp.domain.user.dto.UserDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardDTO {
  private long totalUsers;
  private long totalLandlords;
  private long totalListings;

  // "verifiedListings" requested in prompt "Verified Listings"
  private long verifiedListingsCount;

  private long pendingVerificationsCount;

  // "seatOccupancyRate (aggregated average)"
  private double seatOccupancyRate;

  // "recentFraudAlerts" (mapped from Reports)
  private List<ReportResponse> recentFraudAlerts;

  // Additional helpful data for the UI
  private List<UserDto> pendingVerificationUsers;

  // New Phase 6 Metrics
  private long openMaintenanceRequests;
  private long todayAuditLogs;
  private long totalBookings;
  private long confirmedBookings;
  private long cancelledBookings;

  private long pendingRoommatePostsCount;
  private long activeRoommatePostsCount;

  private long bannedUsersCount;
  private long warningUsersCount; // Users with recent warnings or specific status

  private long totalEmergencyRoomsAvailable; // Count of properties defined as "Emergency" or just generic "Active" low
                                             // price? Requirement says "Emergency Rooms: Real-time availability"

  private List<java.util.Map<String, Object>> occupancyAnalytics; // For the chart
  private List<java.util.Map<String, Object>> propertyGrowthStats; // For Line chart

  // Real data for PropertyInsights
  private List<java.util.Map<String, Object>> propertyTypeStats;
  private List<java.util.Map<String, Object>> locationOccupancyStats;
}
