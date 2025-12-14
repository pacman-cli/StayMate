package com.webapp.domain.messaging.service;

import com.webapp.domain.messaging.dto.*;
import java.util.List;

public interface MessageService {
    ConversationListResponse getConversations(Long userId, int page, int size, String search);

    ConversationResponse getConversation(Long conversationId, Long userId);

    MessageListResponse getMessages(Long conversationId, Long userId, int page, int size);

    ConversationResponse createConversation(Long userId, CreateConversationRequest request);

    MessageResponse sendMessage(Long userId, SendMessageRequest request);

    void markAsRead(Long userId, MarkAsReadRequest request);

    void markConversationAsRead(Long conversationId, Long userId);

    void deleteConversation(Long conversationId, Long userId);

    void deleteMessage(Long messageId, Long userId);

    UnreadCountResponse getUnreadCount(Long userId);

    List<ConversationResponse> getAllConversations(Long userId);
}
