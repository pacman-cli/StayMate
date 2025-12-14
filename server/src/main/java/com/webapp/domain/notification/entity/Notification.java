package com.webapp.domain.notification.entity;

import com.webapp.domain.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user_id", columnList = "user_id"),
    @Index(name = "idx_notification_read", columnList = "is_read"),
    @Index(name = "idx_notification_created_at", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "action_url")
    private String actionUrl;

    @Column(name = "icon")
    private String icon;

    @Column(name = "icon_color")
    private String iconColor;

    // Reference IDs for linking to related entities
    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_avatar")
    private String senderAvatar;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "property_title")
    private String propertyTitle;

    @Column(name = "conversation_id")
    private Long conversationId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "review_id")
    private Long reviewId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void markAsRead() {
        if (!this.read) {
            this.read = true;
            this.readAt = LocalDateTime.now();
        }
    }

    public void markAsUnread() {
        this.read = false;
        this.readAt = null;
    }

    public enum NotificationType {
        // Message notifications
        NEW_MESSAGE("New Message", "message-square", "blue"),

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
        PAYOUT_SENT("Payout Sent", "wallet", "green");

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
}
