package com.webapp.domain.dashboard.dto;

import java.util.List;

import com.webapp.domain.property.dto.PropertyResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDashboardDTO {
  private double compatibilityMatchStats; // Average match %
  private long upcomingVisitsCount;
  private long unreadNotificationsCount;

  private List<PropertyResponse> recommendedRooms;

  // Prompt asks for "Recommended Roommates" too
  private List<com.webapp.domain.ai.dto.AiMatchRecommendation> recommendedRoommates;

  // New Aggregated Stats
  private long savedItemsCount;
  private long activeSearchesCount;
  private long pendingVisitsCount;

  // Emergency / Quick Access
  private List<PropertyResponse> emergencyRooms;
}
