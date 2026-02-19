package com.webapp.domain.roommate;

public enum RoommatePostStatus {
  PENDING,
  OPEN,
  APPROVED, // Deprecated, mapped to OPEN
  REJECTED,
  PENDING_MATCH,
  MATCHED,
  CLOSED
}
