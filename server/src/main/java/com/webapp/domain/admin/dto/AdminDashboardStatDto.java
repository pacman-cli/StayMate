package com.webapp.domain.admin.dto;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStatDto {
  // Existing
  private VerificationStats verificationStats;
  private Map<String, Long> listingStats;
  private List<UserAcquisitionPoint> userAcquisition;
  private List<FraudEventDto> recentFraudEvents;

  // New Metrics (Matching Frontend)
  private long totalUsers;
  private long totalHouseOwners; // Renamed from totalLandlords
  private long totalRegularUsers;
  private long totalAdmins;
  private long totalListings;
  private long verifiedListingsCount;
  private long pendingVerificationsCount;
  private double seatOccupancyRate;

  // Additional Business Metrics
  private long activeUsers; // DAU (Daily Active Users)
  private long totalBookings;
  private long confirmedBookings;
  private long cancelledBookings;
  private long openMaintenanceRequests;
  private long todayAuditLogs;

  // Emergency & Safety Metrics
  private long totalEmergencyRoomsAvailable;
  private long bannedUsersCount;
  private List<FraudEventDto> recentFraudAlerts;
}
