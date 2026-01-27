package com.webapp.domain.finance.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDashboardData {
  private List<Object> userGrowth;
  private List<Object> revenueTrends;
  private List<Object> dailyRevenue;
  private Double totalRevenue;
  private Integer activeListings;
  private Double occupancyRate;
}
