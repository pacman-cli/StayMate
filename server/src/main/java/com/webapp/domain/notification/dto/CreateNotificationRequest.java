package com.webapp.domain.notification.dto;

import com.webapp.domain.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private String icon;
    private String iconColor;

    // Optional related entity IDs
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private Long propertyId;
    private String propertyTitle;
    private Long conversationId;
    private Long bookingId;
    private Long reviewId;
}
