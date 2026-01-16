package com.webapp.domain.property.enums;

public enum PropertyStatus {
  PENDING("Pending"),
  APPROVED("Approved"),
  REJECTED("Rejected"),
  RENTED("Rented"),
  ACTIVE("Active"); // Keeping for backward compatibility migration if needed, but aim to remove

  private final String displayName;

  PropertyStatus(String displayName) {
    this.displayName = displayName;
  }

  public String getDisplayName() {
    return displayName;
  }
}
