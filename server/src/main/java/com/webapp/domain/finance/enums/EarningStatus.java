package com.webapp.domain.finance.enums;

public enum EarningStatus {
  PENDING, // Booking confirmed, stay not completed
  AVAILABLE, // Booking completed, ready for payout
  REQUESTED, // Payout requested
  PAID, // Payout done
  CANCELLED // Earning voided due to cancellation
}
