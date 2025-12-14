package com.webapp.domain.notification.controller;

import com.webapp.domain.notification.dto.*;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get paginated notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<NotificationListResponse> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String filter) {
        log.info("Getting notifications for user {}, page: {}, size: {}, filter: {}",
                userPrincipal.getId(), page, size, filter);
        NotificationListResponse response = notificationService.getNotifications(
                userPrincipal.getId(), page, size, filter);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a single notification
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long notificationId) {
        log.info("Getting notification {} for user {}", notificationId, userPrincipal.getId());
        NotificationResponse response = notificationService.getNotification(notificationId, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<NotificationUnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Getting unread count for user {}", userPrincipal.getId());
        NotificationUnreadCountResponse response = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get notification summary for header dropdown
     */
    @GetMapping("/summary")
    public ResponseEntity<NotificationSummary> getNotificationSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Getting notification summary for user {}", userPrincipal.getId());
        NotificationSummary summary = notificationService.getNotificationSummary(userPrincipal.getId());
        return ResponseEntity.ok(summary);
    }

    /**
     * Mark notifications as read
     */
    @PostMapping("/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody NotificationMarkAsReadRequest request) {
        log.info("User {} marking notifications as read, markAll: {}",
                userPrincipal.getId(), request.isMarkAll());
        int count = notificationService.markAsRead(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Notifications marked as read",
                "count", count));
    }

    /**
     * Mark a single notification as read
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, String>> markSingleAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long notificationId) {
        log.info("User {} marking notification {} as read", userPrincipal.getId(), notificationId);
        notificationService.markSingleAsRead(notificationId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    /**
     * Mark all notifications as read
     */
    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("User {} marking all notifications as read", userPrincipal.getId());
        NotificationMarkAsReadRequest request = NotificationMarkAsReadRequest.builder().markAll(true).build();
        int count = notificationService.markAsRead(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "count", count));
    }

    /**
     * Delete notifications
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody NotificationDeleteRequest request) {
        log.info("User {} deleting notifications, deleteAll: {}",
                userPrincipal.getId(), request.isDeleteAll());
        int count = notificationService.deleteNotifications(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Notifications deleted",
                "count", count));
    }

    /**
     * Delete a single notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteSingleNotification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long notificationId) {
        log.info("User {} deleting notification {}", userPrincipal.getId(), notificationId);
        boolean deleted = notificationService.deleteSingleNotification(notificationId, userPrincipal.getId());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification not found"));
        }
    }

    /**
     * Delete all read notifications older than 30 days
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("User {} cleaning up old notifications", userPrincipal.getId());
        NotificationDeleteRequest request = NotificationDeleteRequest.builder()
                .deleteReadOnly(true)
                .build();
        int count = notificationService.deleteNotifications(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Old notifications cleaned up",
                "count", count));
    }

    /**
     * Create a notification (for internal use or admin)
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateNotificationRequest request) {
        log.info("Creating notification for user {}", request.getUserId());
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
