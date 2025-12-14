package com.webapp.domain.notification.service;

import com.webapp.domain.notification.dto.*;
import com.webapp.domain.notification.entity.Notification;
import com.webapp.domain.notification.entity.Notification.NotificationType;
import com.webapp.domain.notification.repository.NotificationRepository;
import com.webapp.auth.entity.User;
import com.webapp.auth.repository.UserRepository;
import com.webapp.auth.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Get paginated notifications for a user
     */
    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications(Long userId, int page, int size, String filter) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage;

        if (filter != null && filter.equalsIgnoreCase("unread")) {
            notificationPage = notificationRepository.findUnreadByUserId(userId, pageable);
        } else if (filter != null && !filter.isEmpty()) {
            try {
                NotificationType type = NotificationType.valueOf(filter.toUpperCase());
                notificationPage = notificationRepository.findByUserIdAndType(userId, type, pageable);
            } catch (IllegalArgumentException e) {
                notificationPage = notificationRepository.findByUserId(userId, pageable);
            }
        } else {
            notificationPage = notificationRepository.findByUserId(userId, pageable);
        }

        List<NotificationResponse> notifications = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        int unreadCount = notificationRepository.countUnreadByUserId(userId);

        return NotificationListResponse.builder()
                .notifications(notifications)
                .unreadCount(unreadCount)
                .page(page)
                .size(size)
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .hasMore(notificationPage.hasNext())
                .build();
    }

    /**
     * Get unread notification count for a user
     */
    @Transactional(readOnly = true)
    public NotificationUnreadCountResponse getUnreadCount(Long userId) {
        int totalUnread = notificationRepository.countUnreadByUserId(userId);

        List<Object[]> countsByType = notificationRepository.countUnreadGroupedByType(userId);
        Map<String, Integer> countByType = new HashMap<>();
        for (Object[] row : countsByType) {
            NotificationType type = (NotificationType) row[0];
            Long count = (Long) row[1];
            countByType.put(type.name(), count.intValue());
        }

        return NotificationUnreadCountResponse.builder()
                .totalUnread(totalUnread)
                .countByType(countByType)
                .build();
    }

    /**
     * Get notification summary for header dropdown
     */
    @Transactional(readOnly = true)
    public NotificationSummary getNotificationSummary(Long userId) {
        int totalUnread = notificationRepository.countUnreadByUserId(userId);

        // Get counts by category
        List<Object[]> countsByType = notificationRepository.countUnreadGroupedByType(userId);
        int messagesUnread = 0;
        int bookingsUnread = 0;
        int propertyUnread = 0;
        int systemUnread = 0;

        for (Object[] row : countsByType) {
            NotificationType type = (NotificationType) row[0];
            int count = ((Long) row[1]).intValue();

            switch (type) {
                case NEW_MESSAGE:
                    messagesUnread += count;
                    break;
                case BOOKING_REQUEST:
                case BOOKING_CONFIRMED:
                case BOOKING_CANCELLED:
                case BOOKING_REMINDER:
                    bookingsUnread += count;
                    break;
                case PROPERTY_INQUIRY:
                case PROPERTY_APPROVED:
                case PROPERTY_REJECTED:
                case PROPERTY_VIEWED:
                case LISTING_SAVED:
                case PRICE_DROP:
                    propertyUnread += count;
                    break;
                default:
                    systemUnread += count;
                    break;
            }
        }

        // Get recent notifications (last 5)
        List<Notification> recentList = notificationRepository.findRecentByUserId(
                userId, LocalDateTime.now().minusDays(7));
        List<NotificationResponse> recent = recentList.stream()
                .limit(5)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return NotificationSummary.builder()
                .totalUnread(totalUnread)
                .messagesUnread(messagesUnread)
                .bookingsUnread(bookingsUnread)
                .propertyUnread(propertyUnread)
                .systemUnread(systemUnread)
                .recentNotifications(recent)
                .build();
    }

    /**
     * Get a single notification
     */
    @Transactional(readOnly = true)
    public NotificationResponse getNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        return mapToResponse(notification);
    }

    /**
     * Create a new notification
     */
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(request.getType())
                .title(request.getTitle() != null ? request.getTitle() : request.getType().getDisplayName())
                .message(request.getMessage())
                .actionUrl(request.getActionUrl())
                .icon(request.getIcon() != null ? request.getIcon() : request.getType().getDefaultIcon())
                .iconColor(
                        request.getIconColor() != null ? request.getIconColor() : request.getType().getDefaultColor())
                .senderId(request.getSenderId())
                .senderName(request.getSenderName())
                .senderAvatar(request.getSenderAvatar())
                .propertyId(request.getPropertyId())
                .propertyTitle(request.getPropertyTitle())
                .conversationId(request.getConversationId())
                .bookingId(request.getBookingId())
                .reviewId(request.getReviewId())
                .build();

        notification = notificationRepository.save(notification);

        log.info("Created notification {} of type {} for user {}",
                notification.getId(), notification.getType(), user.getId());

        return mapToResponse(notification);
    }

    /**
     * Create notification for a specific user (internal use)
     */
    @Transactional
    public Notification createNotificationForUser(
            Long userId,
            NotificationType type,
            String title,
            String message,
            String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title != null ? title : type.getDisplayName())
                .message(message)
                .actionUrl(actionUrl)
                .icon(type.getDefaultIcon())
                .iconColor(type.getDefaultColor())
                .build();

        notification = notificationRepository.save(notification);

        log.info("Created notification {} for user {}", notification.getId(), userId);

        return notification;
    }

    /**
     * Create message notification
     */
    @Transactional
    public Notification createMessageNotification(
            Long recipientId,
            Long senderId,
            String senderName,
            String senderAvatar,
            Long conversationId,
            String messagePreview) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(recipient)
                .type(NotificationType.NEW_MESSAGE)
                .title("New message from " + senderName)
                .message(messagePreview)
                .actionUrl("/messages?conversation=" + conversationId)
                .icon(NotificationType.NEW_MESSAGE.getDefaultIcon())
                .iconColor(NotificationType.NEW_MESSAGE.getDefaultColor())
                .senderId(senderId)
                .senderName(senderName)
                .senderAvatar(senderAvatar)
                .conversationId(conversationId)
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * Mark notifications as read
     */
    @Transactional
    public int markAsRead(Long userId, NotificationMarkAsReadRequest request) {
        if (request.isMarkAll()) {
            int count = notificationRepository.markAllAsRead(userId);
            log.info("Marked {} notifications as read for user {}", count, userId);
            return count;
        } else if (request.getNotificationIds() != null && !request.getNotificationIds().isEmpty()) {
            int count = notificationRepository.markMultipleAsRead(request.getNotificationIds(), userId);
            log.info("Marked {} notifications as read for user {}", count, userId);
            return count;
        }
        return 0;
    }

    /**
     * Mark a single notification as read
     */
    @Transactional
    public void markSingleAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated == 0) {
            log.warn("Notification {} not found or already read for user {}", notificationId, userId);
        }
    }

    /**
     * Delete notifications
     */
    @Transactional
    public int deleteNotifications(Long userId, NotificationDeleteRequest request) {
        if (request.isDeleteAll()) {
            int count = notificationRepository.deleteAllByUserId(userId);
            log.info("Deleted {} notifications for user {}", count, userId);
            return count;
        } else if (request.isDeleteReadOnly()) {
            int count = notificationRepository.deleteOldReadNotifications(
                    userId, LocalDateTime.now().minusDays(30));
            log.info("Deleted {} old read notifications for user {}", count, userId);
            return count;
        } else if (request.getNotificationIds() != null && !request.getNotificationIds().isEmpty()) {
            int count = 0;
            for (Long id : request.getNotificationIds()) {
                count += notificationRepository.deleteByIdAndUserId(id, userId);
            }
            log.info("Deleted {} notifications for user {}", count, userId);
            return count;
        }
        return 0;
    }

    /**
     * Delete a single notification
     */
    @Transactional
    public boolean deleteSingleNotification(Long notificationId, Long userId) {
        int deleted = notificationRepository.deleteByIdAndUserId(notificationId, userId);
        return deleted > 0;
    }

    /**
     * Map Notification entity to NotificationResponse DTO
     */
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .typeDisplayName(notification.getType().getDisplayName())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .readAt(notification.getReadAt())
                .actionUrl(notification.getActionUrl())
                .icon(notification.getIcon() != null ? notification.getIcon() : notification.getType().getDefaultIcon())
                .iconColor(notification.getIconColor() != null ? notification.getIconColor()
                        : notification.getType().getDefaultColor())
                .senderId(notification.getSenderId())
                .senderName(notification.getSenderName())
                .senderAvatar(notification.getSenderAvatar())
                .propertyId(notification.getPropertyId())
                .propertyTitle(notification.getPropertyTitle())
                .conversationId(notification.getConversationId())
                .bookingId(notification.getBookingId())
                .reviewId(notification.getReviewId())
                .createdAt(notification.getCreatedAt())
                .timeAgo(getTimeAgo(notification.getCreatedAt()))
                .build();
    }

    /**
     * Get human-readable time ago string
     */
    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null)
            return "";

        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 60) {
            return "Just now";
        } else if (seconds < 3600) {
            long minutes = seconds / 60;
            return minutes + (minutes == 1 ? " minute ago" : " minutes ago");
        } else if (seconds < 86400) {
            long hours = seconds / 3600;
            return hours + (hours == 1 ? " hour ago" : " hours ago");
        } else if (seconds < 604800) {
            long days = seconds / 86400;
            return days + (days == 1 ? " day ago" : " days ago");
        } else if (seconds < 2592000) {
            long weeks = seconds / 604800;
            return weeks + (weeks == 1 ? " week ago" : " weeks ago");
        } else {
            long months = seconds / 2592000;
            return months + (months == 1 ? " month ago" : " months ago");
        }
    }
}
