package com.webapp.domain.messaging.controller;

import com.webapp.domain.messaging.dto.*;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.messaging.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    /**
     * Get all conversations for the authenticated user
     */
    @GetMapping("/conversations")
    public ResponseEntity<ConversationListResponse> getConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        log.info("Getting conversations for user {}, page: {}, size: {}, search: {}",
                userPrincipal.getId(), page, size, search);
        ConversationListResponse response = messageService.getConversations(
                userPrincipal.getId(), page, size, search);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific conversation by ID
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long conversationId) {
        log.info("Getting conversation {} for user {}", conversationId, userPrincipal.getId());
        ConversationResponse response = messageService.getConversation(conversationId, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get messages for a specific conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageListResponse> getMessages(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("Getting messages for conversation {} for user {}, page: {}, size: {}",
                conversationId, userPrincipal.getId(), page, size);
        MessageListResponse response = messageService.getMessages(
                conversationId, userPrincipal.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new conversation
     */
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateConversationRequest request) {
        log.info("Creating conversation for user {} with recipient {}",
                userPrincipal.getId(), request.getRecipientId());
        ConversationResponse response = messageService.createConversation(
                userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Send a message
     */
    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody SendMessageRequest request) {
        log.info("User {} sending message to conversation {} or recipient {}",
                userPrincipal.getId(), request.getConversationId(), request.getRecipientId());
        MessageResponse response = messageService.sendMessage(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Mark messages as read
     */
    @PostMapping("/mark-read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody MarkAsReadRequest request) {
        log.info("User {} marking messages as read for conversation {}",
                userPrincipal.getId(), request.getConversationId());
        messageService.markAsRead(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }

    /**
     * Mark all messages in a conversation as read
     */
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Map<String, String>> markConversationAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long conversationId) {
        log.info("User {} marking conversation {} as read",
                userPrincipal.getId(), conversationId);
        messageService.markConversationAsRead(conversationId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    /**
     * Delete a conversation (soft delete for user)
     */
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, String>> deleteConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long conversationId) {
        log.info("User {} deleting conversation {}", userPrincipal.getId(), conversationId);
        messageService.deleteConversation(conversationId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Conversation deleted"));
    }

    /**
     * Delete a message (soft delete for user)
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long messageId) {
        log.info("User {} deleting message {}", userPrincipal.getId(), messageId);
        messageService.deleteMessage(messageId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Message deleted"));
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Getting unread count for user {}", userPrincipal.getId());
        UnreadCountResponse response = messageService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all conversations (without pagination)
     */
    @GetMapping("/conversations/all")
    public ResponseEntity<List<ConversationResponse>> getAllConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Getting all conversations for user {}", userPrincipal.getId());
        List<ConversationResponse> conversations = messageService.getAllConversations(userPrincipal.getId());
        return ResponseEntity.ok(conversations);
    }
}
