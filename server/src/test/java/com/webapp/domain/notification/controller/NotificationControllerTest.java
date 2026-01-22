package com.webapp.domain.notification.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.notification.dto.NotificationResponse;
import com.webapp.domain.notification.service.NotificationService;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationController Tests")
class NotificationControllerTest {

  @Mock
  private NotificationService notificationService;

  @Mock
  private UserPrincipal userPrincipal;

  @InjectMocks
  private NotificationController notificationController;

  private NotificationResponse testNotification;

  @BeforeEach
  void setUp() {
    when(userPrincipal.getId()).thenReturn(1L);

    testNotification = NotificationResponse.builder()
        .id(1L)
        // userId doesn't exist in Response DTO
        .type(com.webapp.domain.notification.enums.NotificationType.BOOKING_CONFIRMED)
        .title("Booking Confirmed")
        .message("Your booking has been confirmed")
        .read(false)
        .createdAt(LocalDateTime.now())
        .build();
  }

  @Test
  @DisplayName("Should get notifications for user")
  void shouldGetNotificationsForUser() {
    com.webapp.domain.notification.dto.NotificationListResponse listResponse = com.webapp.domain.notification.dto.NotificationListResponse
        .builder()
        .notifications(List.of(testNotification))
        .unreadCount(1)
        .page(0)
        .size(20)
        .totalElements(1)
        .totalPages(1)
        .build();

    when(notificationService.getNotifications(eq(1L), anyInt(), anyInt(), any()))
        .thenReturn(listResponse);

    ResponseEntity<com.webapp.domain.notification.dto.NotificationListResponse> response = notificationController
        .getNotifications(userPrincipal, 0, 20, null);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(1, response.getBody().getTotalElements());
  }

  @Test
  @DisplayName("Should get unread count")
  void shouldGetUnreadCount() {
    com.webapp.domain.notification.dto.NotificationUnreadCountResponse countResponse = com.webapp.domain.notification.dto.NotificationUnreadCountResponse
        .builder()
        .totalUnread(5)
        .build();
    when(notificationService.getUnreadCount(1L)).thenReturn(countResponse);

    ResponseEntity<com.webapp.domain.notification.dto.NotificationUnreadCountResponse> response = notificationController
        .getUnreadCount(userPrincipal);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(5, response.getBody().getTotalUnread());
  }

  @Test
  @DisplayName("Should mark notification as read")
  void shouldMarkNotificationAsRead() {
    doNothing().when(notificationService).markSingleAsRead(1L, 1L);

    ResponseEntity<java.util.Map<String, String>> response = notificationController.markSingleAsRead(userPrincipal, 1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(notificationService).markSingleAsRead(1L, 1L);
  }

  @Test
  @DisplayName("Should mark all notifications as read")
  void shouldMarkAllNotificationsAsRead() {
    when(notificationService.markAsRead(eq(1L),
        any(com.webapp.domain.notification.dto.NotificationMarkAsReadRequest.class))).thenReturn(5);

    ResponseEntity<java.util.Map<String, Object>> response = notificationController.markAllAsRead(userPrincipal);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(notificationService).markAsRead(eq(1L),
        any(com.webapp.domain.notification.dto.NotificationMarkAsReadRequest.class));
  }

  @Test
  @DisplayName("Should delete notification")
  void shouldDeleteNotification() {
    when(notificationService.deleteSingleNotification(1L, 1L)).thenReturn(true);

    ResponseEntity<java.util.Map<String, String>> response = notificationController
        .deleteSingleNotification(userPrincipal, 1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(notificationService).deleteSingleNotification(1L, 1L);
  }
}
