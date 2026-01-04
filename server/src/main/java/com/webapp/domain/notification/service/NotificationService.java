package com.webapp.domain.notification.service;

import com.webapp.domain.notification.dto.*;
import com.webapp.domain.notification.enums.NotificationType;
import com.webapp.domain.notification.entity.Notification;

public interface NotificationService {
        NotificationListResponse getNotifications(Long userId, int page, int size, String filter);

        NotificationUnreadCountResponse getUnreadCount(Long userId);

        NotificationSummary getNotificationSummary(Long userId);

        NotificationResponse getNotification(Long notificationId, Long userId);

        NotificationResponse createNotification(CreateNotificationRequest request);

        Notification createNotificationForUser(Long userId, NotificationType type, String title, String message,
                        String actionUrl);

        Notification createMessageNotification(Long recipientId, Long senderId, String senderName, String senderAvatar,
                        Long conversationId, String messagePreview);

        int markAsRead(Long userId, NotificationMarkAsReadRequest request);

        void markSingleAsRead(Long notificationId, Long userId);

        int deleteNotifications(Long userId, NotificationDeleteRequest request);

        boolean deleteSingleNotification(Long notificationId, Long userId);
}
