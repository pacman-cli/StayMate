package com.webapp.domain.finance.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Admin-level financial summary for platform commissions and payouts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFinancialSummaryResponse {
  private BigDecimal totalPlatformRevenue; // Total gross bookings
  private BigDecimal totalPlatformCommission; // Total commission earned
  private BigDecimal totalOwnerEarnings; // Total net to owners
  private BigDecimal pendingPayouts; // Awaiting approval
  private BigDecimal processingPayouts; // In processing
  private BigDecimal completedPayouts; // Already paid
  private long totalPayoutRequests; // Count of all requests
  private long pendingPayoutCount; // Count pending
}
