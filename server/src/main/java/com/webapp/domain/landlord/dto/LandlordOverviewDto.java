package com.webapp.domain.landlord.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LandlordOverviewDto {
  private long totalProperties;
  private long totalSeats;
  private long occupiedSeats;
  private long vacantSeats;
  private long longTermVacantSeats; // > 30 days
  private double occupancyRate;
  private double averageRating;
  private int totalReviews;
  private java.math.BigDecimal totalEarnings;
  private java.math.BigDecimal pendingPayouts;
}
