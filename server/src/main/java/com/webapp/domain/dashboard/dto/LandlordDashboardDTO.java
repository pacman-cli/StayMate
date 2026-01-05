package com.webapp.domain.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

import com.webapp.domain.booking.dto.BookingResponse;
import com.webapp.domain.property.dto.PropertyResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LandlordDashboardDTO {
  private long activePropertiesCount;
  private long totalRequestsPending;
  private BigDecimal totalRevenue;

  private Long totalViews;
  private Long totalInquiries;

  // "occupancyAnalytics (booked vs. empty seats)"
  private double occupancyRate;

  private List<BookingResponse> incomingTenantRequests;
  private List<PropertyResponse> myPropertiesOverview;
}
