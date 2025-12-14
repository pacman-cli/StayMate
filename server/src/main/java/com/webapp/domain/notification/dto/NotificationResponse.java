package com.webapp.domain.notification.dto;

import com.webapp.domain.notification.entity.Notification.NotificationType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String typeDisplayName;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime readAt;
    private String actionUrl;
    private String icon;
    private String iconColor;

    // Related entity info
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private Long propertyId;
    private String propertyTitle;
    private Long conversationId;
    private Long bookingId;
    private Long reviewId;

    private LocalDateTime createdAt;
    private String timeAgo;
}
