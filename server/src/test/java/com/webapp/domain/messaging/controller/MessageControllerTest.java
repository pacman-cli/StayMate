package com.webapp.domain.messaging.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
import com.webapp.domain.messaging.dto.ConversationListResponse;
import com.webapp.domain.messaging.dto.ConversationResponse;
import com.webapp.domain.messaging.dto.CreateConversationRequest;
import com.webapp.domain.messaging.dto.MarkAsReadRequest;
import com.webapp.domain.messaging.dto.MessageListResponse;
import com.webapp.domain.messaging.dto.MessageResponse;
import com.webapp.domain.messaging.dto.SendMessageRequest;
import com.webapp.domain.messaging.dto.UnreadCountResponse;
import com.webapp.domain.messaging.service.MessageService;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageController Tests")
class MessageControllerTest {

  @Mock
  private MessageService messageService;

  @Mock
  private UserPrincipal userPrincipal;

  @InjectMocks
  private MessageController messageController;

  private ConversationResponse testConversation;
  private MessageResponse testMessage;

  @BeforeEach
  void setUp() {
    when(userPrincipal.getId()).thenReturn(1L);

    testConversation = ConversationResponse.builder()
        .id(1L)
        .otherParticipantId(2L)
        .otherParticipantName("John Doe")
        .unreadCount(3)
        .build();

    testMessage = MessageResponse.builder()
        .id(1L)
        .conversationId(1L)
        .senderId(1L)
        .content("Hello!")
        .createdAt(LocalDateTime.now())
        .build();
  }

  @Test
  @DisplayName("Should get conversations with pagination")
  void shouldGetConversationsWithPagination() {
    ConversationListResponse listResponse = ConversationListResponse.builder()
        .conversations(List.of(testConversation))
        .totalElements(1L)
        .totalPages(1)
        .page(0)
        .build();
    when(messageService.getConversations(eq(1L), anyInt(), anyInt(), any()))
        .thenReturn(listResponse);

    ResponseEntity<ConversationListResponse> response = messageController.getConversations(userPrincipal, 0, 20, null);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(1, response.getBody().getConversations().size());
  }

  @Test
  @DisplayName("Should get specific conversation")
  void shouldGetSpecificConversation() {
    when(messageService.getConversation(1L, 1L)).thenReturn(testConversation);

    ResponseEntity<ConversationResponse> response = messageController.getConversation(userPrincipal, 1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("John Doe", response.getBody().getOtherParticipantName());
  }

  @Test
  @DisplayName("Should get messages for conversation")
  void shouldGetMessagesForConversation() {
    MessageListResponse listResponse = MessageListResponse.builder()
        .messages(List.of(testMessage))
        .totalElements(1L)
        .totalPages(1)
        .page(0)
        .build();
    when(messageService.getMessages(1L, 1L, 0, 50)).thenReturn(listResponse);

    ResponseEntity<MessageListResponse> response = messageController.getMessages(userPrincipal, 1L, 0, 50);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(1, response.getBody().getMessages().size());
  }

  @Test
  @DisplayName("Should create conversation")
  void shouldCreateConversation() {
    CreateConversationRequest request = new CreateConversationRequest();
    request.setRecipientId(2L);
    when(messageService.createConversation(eq(1L), any(CreateConversationRequest.class)))
        .thenReturn(testConversation);

    ResponseEntity<ConversationResponse> response = messageController.createConversation(userPrincipal, request);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertNotNull(response.getBody());
  }

  @Test
  @DisplayName("Should send message")
  void shouldSendMessage() {
    SendMessageRequest request = new SendMessageRequest();
    request.setConversationId(1L);
    request.setContent("Hello!");
    when(messageService.sendMessage(eq(1L), any(SendMessageRequest.class)))
        .thenReturn(testMessage);

    ResponseEntity<MessageResponse> response = messageController.sendMessage(userPrincipal, request);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals("Hello!", response.getBody().getContent());
  }

  @Test
  @DisplayName("Should mark messages as read")
  void shouldMarkMessagesAsRead() {
    MarkAsReadRequest request = new MarkAsReadRequest();
    request.setConversationId(1L);
    doNothing().when(messageService).markAsRead(eq(1L), any(MarkAsReadRequest.class));

    ResponseEntity<Map<String, String>> response = messageController.markAsRead(userPrincipal, request);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("Messages marked as read", response.getBody().get("message"));
  }

  @Test
  @DisplayName("Should delete conversation")
  void shouldDeleteConversation() {
    doNothing().when(messageService).deleteConversation(1L, 1L);

    ResponseEntity<Map<String, String>> response = messageController.deleteConversation(userPrincipal, 1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(messageService).deleteConversation(1L, 1L);
  }

  @Test
  @DisplayName("Should get unread count")
  void shouldGetUnreadCount() {
    UnreadCountResponse unreadResponse = UnreadCountResponse.builder()
        .totalUnreadCount(5)
        .build();
    when(messageService.getUnreadCount(1L)).thenReturn(unreadResponse);

    ResponseEntity<UnreadCountResponse> response = messageController.getUnreadCount(userPrincipal);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(5, response.getBody().getTotalUnreadCount());
  }
}
