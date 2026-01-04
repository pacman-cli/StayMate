package com.webapp.domain.notification.enums;

public enum NotificationType {
    // Message notifications
    NEW_MESSAGE("New Message", "message-square", "blue"),
    GENERAL("General", "bell", "slate"),

    // Booking notifications
    BOOKING_REQUEST("Booking Request", "calendar", "purple"),
    BOOKING_CONFIRMED("Booking Confirmed", "check-circle", "green"),
    BOOKING_CANCELLED("Booking Cancelled", "x-circle", "red"),
    BOOKING_REMINDER("Booking Reminder", "clock", "orange"),

    // Property notifications
    PROPERTY_INQUIRY("Property Inquiry", "help-circle", "cyan"),
    PROPERTY_APPROVED("Property Approved", "check", "green"),
    PROPERTY_REJECTED("Property Rejected", "x", "red"),
    PROPERTY_VIEWED("Property Viewed", "eye", "slate"),
    LISTING_SAVED("Listing Saved", "heart", "pink"),
    PRICE_DROP("Price Drop", "trending-down", "green"),

    // Review notifications
    REVIEW_RECEIVED("Review Received", "star", "yellow"),
    REVIEW_REPLY("Review Reply", "message-circle", "blue"),

    // User notifications
    PROFILE_VIEWED("Profile Viewed", "user", "slate"),
    VERIFICATION_APPROVED("Verification Approved", "shield-check", "green"),
    VERIFICATION_REQUIRED("Verification Required", "shield-alert", "orange"),

    // Roommate notifications
    ROOMMATE_MATCH("Roommate Match", "users", "purple"),
    ROOMMATE_REQUEST("Roommate Request", "user-plus", "blue"),

    // System notifications
    SYSTEM_ANNOUNCEMENT("Announcement", "megaphone", "blue"),
    WELCOME("Welcome", "sparkles", "purple"),
    ACCOUNT_UPDATE("Account Update", "settings", "slate"),
    SECURITY_ALERT("Security Alert", "alert-triangle", "red"),

    // Payment notifications
    PAYMENT_RECEIVED("Payment Received", "credit-card", "green"),
    PAYMENT_FAILED("Payment Failed", "credit-card", "red"),
    PAYOUT_SENT("Payout Sent", "wallet", "green"),

    // Application notifications
    APPLICATION_RECEIVED("Application Received", "file-text", "blue"), // Added consistent naming
    APPLICATION_ACCEPTED("Application Accepted", "check-square", "green"),
    APPLICATION_REJECTED("Application Rejected", "x-square", "red"),
    MATCH_FOUND("Match Found", "users", "purple"); // Keeping existing one if needed

    private final String displayName;
    private final String defaultIcon;
    private final String defaultColor;

    NotificationType(String displayName, String defaultIcon, String defaultColor) {
        this.displayName = displayName;
        this.defaultIcon = defaultIcon;
        this.defaultColor = defaultColor;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDefaultIcon() {
        return defaultIcon;
    }

    public String getDefaultColor() {
        return defaultColor;
    }
}
