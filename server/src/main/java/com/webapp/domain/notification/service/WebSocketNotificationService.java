package com.webapp.domain.notification.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.webapp.domain.notification.dto.NotificationResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for broadcasting real-time notifications via WebSocket.
 * Sends notifications to specific users through STOMP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

  private final SimpMessagingTemplate messagingTemplate;

  /**
   * Send a notification to a specific user via WebSocket.
   * The user subscribes to /user/{userId}/queue/notifications
   */
  @Async
  public void sendToUser(Long userId, NotificationResponse notification) {
    try {
      String destination = "/queue/notifications";
      messagingTemplate.convertAndSendToUser(
          userId.toString(),
          destination,
          notification);
      log.debug("Sent real-time notification to user {}: {}", userId, notification.getTitle());
    } catch (Exception e) {
      log.error("Failed to send WebSocket notification to user {}: {}", userId, e.getMessage());
    }
  }

  /**
   * Send a notification to a specific user about a new message.
   */
  @Async
  public void sendNewMessageNotification(Long userId, Long conversationId, String senderName, String preview) {
    try {
      NewMessageNotification notification = NewMessageNotification.builder()
          .conversationId(conversationId)
          .senderName(senderName)
          .preview(preview.length() > 100 ? preview.substring(0, 100) + "..." : preview)
          .build();

      messagingTemplate.convertAndSendToUser(
          userId.toString(),
          "/queue/messages",
          notification);
      log.debug("Sent new message notification to user {}", userId);
    } catch (Exception e) {
      log.error("Failed to send message notification to user {}: {}", userId, e.getMessage());
    }
  }

  /**
   * Send unread count update to a user.
   */
  @Async
  public void sendUnreadCountUpdate(Long userId, int unreadCount) {
    try {
      messagingTemplate.convertAndSendToUser(
          userId.toString(),
          "/queue/unread-count",
          new UnreadCountUpdate(unreadCount));
    } catch (Exception e) {
      log.error("Failed to send unread count to user {}: {}", userId, e.getMessage());
    }
  }

  /**
   * Broadcast to all connected users (admin announcements).
   */
  public void broadcast(String topic, Object message) {
    try {
      messagingTemplate.convertAndSend("/topic/" + topic, message);
      log.debug("Broadcast message to topic: {}", topic);
    } catch (Exception e) {
      log.error("Failed to broadcast to topic {}: {}", topic, e.getMessage());
    }
  }

  /**
   * DTO for new message notifications.
   */
  @lombok.Data
  @lombok.Builder
  @lombok.NoArgsConstructor
  @lombok.AllArgsConstructor
  public static class NewMessageNotification {
    private Long conversationId;
    private String senderName;
    private String preview;
  }

  /**
   * DTO for unread count updates.
   */
  @lombok.Data
  @lombok.AllArgsConstructor
  @lombok.NoArgsConstructor
  public static class UnreadCountUpdate {
    private int count;
  }
}
