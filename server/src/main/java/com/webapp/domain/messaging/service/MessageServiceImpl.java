package com.webapp.domain.messaging.service;

import com.webapp.domain.messaging.dto.*;
import com.webapp.domain.messaging.entity.Conversation;
import com.webapp.domain.messaging.entity.Message;
import com.webapp.domain.messaging.entity.Message.MessageType;
import com.webapp.domain.messaging.repository.ConversationRepository;
import com.webapp.domain.messaging.repository.MessageRepository;
import com.webapp.domain.notification.entity.Notification;
import com.webapp.domain.notification.repository.NotificationRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.auth.exception.BadRequestException;
import com.webapp.auth.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

        private final MessageRepository messageRepository;
        private final ConversationRepository conversationRepository;
        private final UserRepository userRepository;
        private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
        private final NotificationRepository notificationRepository;

        @Transactional(readOnly = true)
        public ConversationListResponse getConversations(
                        Long userId,
                        int page,
                        int size,
                        String search) {
                Pageable pageable = PageRequest.of(page, size);
                Page<Conversation> conversationPage;

                if (search != null && !search.trim().isEmpty()) {
                        conversationPage = conversationRepository.searchConversations(
                                        userId,
                                        search.trim(),
                                        pageable);
                } else {
                        conversationPage = conversationRepository.findByUserId(
                                        userId,
                                        pageable);
                }

                List<ConversationResponse> conversations = conversationPage
                                .getContent()
                                .stream()
                                .map(c -> mapToConversationResponse(c, userId))
                                .collect(Collectors.toList());

                int totalUnreadCount = conversationRepository.getTotalUnreadCount(
                                userId);

                return ConversationListResponse.builder()
                                .conversations(conversations)
                                .totalUnreadCount(totalUnreadCount)
                                .page(page)
                                .size(size)
                                .totalElements(conversationPage.getTotalElements())
                                .totalPages(conversationPage.getTotalPages())
                                .build();
        }

        @Transactional(readOnly = true)
        public ConversationResponse getConversation(
                        Long conversationId,
                        Long userId) {
                Conversation conversation = conversationRepository
                                .findByIdAndUserId(conversationId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
                return mapToConversationResponse(conversation, userId);
        }

        @Transactional(readOnly = true)
        public MessageListResponse getMessages(
                        Long conversationId,
                        Long userId,
                        int page,
                        int size) {
                Conversation conversation = conversationRepository
                                .findByIdAndUserId(conversationId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

                Pageable pageable = PageRequest.of(page, size);
                Page<Message> messagePage = messageRepository.findByConversationIdAndUserId(
                                conversationId,
                                userId,
                                pageable);

                List<MessageResponse> messages = messagePage
                                .getContent()
                                .stream()
                                .map(m -> mapToMessageResponse(m, userId))
                                .collect(Collectors.toList());

                // Reverse to show oldest first in chat view
                java.util.Collections.reverse(messages);

                return MessageListResponse.builder()
                                .messages(messages)
                                .conversation(mapToConversationResponse(conversation, userId))
                                .page(page)
                                .size(size)
                                .totalElements(messagePage.getTotalElements())
                                .totalPages(messagePage.getTotalPages())
                                .build();
        }

        @Transactional
        public ConversationResponse createConversation(
                        Long userId,
                        CreateConversationRequest request) {
                if (userId == null) {
                        throw new BadRequestException("User ID is required");
                }

                Long recipientId = request.getRecipientId();
                if (recipientId == null) {
                        throw new BadRequestException("Recipient ID is required");
                }

                if (recipientId.equals(userId)) {
                        throw new BadRequestException(
                                        "Cannot start a conversation with yourself");
                }

                User sender = userRepository
                                .findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                User recipient = userRepository
                                .findById(recipientId)
                                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

                // Check if conversation already exists
                Conversation existingConversation;
                if (request.getPropertyId() != null) {
                        existingConversation = conversationRepository
                                        .findByParticipantsAndPropertyId(
                                                        userId,
                                                        recipientId,
                                                        request.getPropertyId())
                                        .orElse(null);
                } else {
                        existingConversation = conversationRepository
                                        .findByParticipants(userId, recipientId)
                                        .orElse(null);
                }

                if (existingConversation != null) {
                        // Restore if deleted for this user
                        existingConversation.setDeletedForUser(userId, false);
                        conversationRepository.save(existingConversation);

                        // If there's an initial message, send it
                        if (request.getInitialMessage() != null &&
                                        !request.getInitialMessage().trim().isEmpty()) {
                                sendMessageToConversation(
                                                existingConversation,
                                                sender,
                                                recipient,
                                                request.getInitialMessage());
                        }

                        return mapToConversationResponse(existingConversation, userId);
                }

                // Create new conversation
                Conversation conversation = Conversation.builder()
                                .participantOne(sender)
                                .participantTwo(recipient)
                                .subject(request.getSubject())
                                .propertyId(request.getPropertyId())
                                .propertyTitle(request.getPropertyTitle())
                                .build();

                conversation = conversationRepository.save(conversation);

                // Send initial message if provided
                if (request.getInitialMessage() != null &&
                                !request.getInitialMessage().trim().isEmpty()) {
                        sendMessageToConversation(
                                        conversation,
                                        sender,
                                        recipient,
                                        request.getInitialMessage());
                }

                log.info(
                                "Created new conversation {} between users {} and {}",
                                conversation.getId(),
                                userId,
                                request.getRecipientId());

                return mapToConversationResponse(conversation, userId);
        }

        @Transactional
        public MessageResponse sendMessage(
                        Long userId,
                        SendMessageRequest request) {
                if (userId == null) {
                        throw new BadRequestException("User ID is required");
                }

                User sender = userRepository
                                .findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Conversation conversation;
                User recipient;

                if (request.getConversationId() != null) {
                        // Sending to existing conversation
                        conversation = conversationRepository
                                        .findByIdAndUserId(request.getConversationId(), userId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
                        recipient = conversation.getOtherParticipant(userId);
                } else if (request.getRecipientId() != null) {
                        // Create or get conversation
                        Long recipientId = request.getRecipientId();
                        recipient = userRepository
                                        .findById(recipientId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

                        if (recipientId.equals(userId)) {
                                throw new BadRequestException(
                                                "Cannot send message to yourself");
                        }

                        conversation = conversationRepository
                                        .findByParticipants(userId, request.getRecipientId())
                                        .orElseGet(() -> {
                                                Conversation newConv = Conversation.builder()
                                                                .participantOne(sender)
                                                                .participantTwo(recipient)
                                                                .subject(request.getSubject())
                                                                .propertyId(request.getPropertyId())
                                                                .propertyTitle(request.getPropertyTitle())
                                                                .build();
                                                return conversationRepository.save(newConv);
                                        });
                } else {
                        throw new BadRequestException(
                                        "Either conversationId or recipientId is required");
                }

                if (request.getContent() == null ||
                                request.getContent().trim().isEmpty()) {
                        throw new BadRequestException("Message content is required");
                }

                Message message = sendMessageToConversation(
                                conversation,
                                sender,
                                recipient,
                                request.getContent());

                // Set attachment if provided
                if (request.getAttachmentUrl() != null) {
                        message.setAttachmentUrl(request.getAttachmentUrl());
                        message.setAttachmentName(request.getAttachmentName());
                        message.setMessageType(
                                        request.getMessageType() != null
                                                        ? request.getMessageType()
                                                        : MessageType.FILE);
                        messageRepository.save(message);
                }

                return mapToMessageResponse(message, userId);
        }

        private Message sendMessageToConversation(
                        Conversation conversation,
                        User sender,
                        User recipient,
                        String content) {
                Message message = Message.builder()
                                .conversation(conversation)
                                .sender(sender)
                                .recipient(recipient)
                                .content(content)
                                .messageType(MessageType.TEXT)
                                .build();

                message = messageRepository.save(message);

                // Update conversation
                conversation.updateLastMessage(content);
                conversation.incrementUnreadCount(recipient.getId());

                // Restore conversation for recipient if they deleted it
                conversation.setDeletedForUser(recipient.getId(), false);

                conversationRepository.save(conversation);

                // Create notification for recipient
                createMessageNotification(
                                recipient,
                                sender,
                                conversation.getId(),
                                content);

                // Broadcast message to recipient via WebSocket
                try {
                        MessageResponse response = mapToMessageResponse(message, recipient.getId());
                        messagingTemplate.convertAndSendToUser(
                                        String.valueOf(recipient.getId()),
                                        "/queue/messages",
                                        response);
                } catch (Exception e) {
                        log.warn("Failed to send WebSocket message to user {}: {}", recipient.getId(), e.getMessage());
                }

                log.info(
                                "Message {} sent in conversation {} from user {} to user {}",
                                message.getId(),
                                conversation.getId(),
                                sender.getId(),
                                recipient.getId());

                return message;
        }

        /**
         * Create a notification for a new message
         */
        private void createMessageNotification(
                        User recipient,
                        User sender,
                        Long conversationId,
                        String messageContent) {
                try {
                        String senderName = sender.getFullName() != null
                                        ? sender.getFullName()
                                        : sender.getEmail();
                        String messagePreview = messageContent.length() > 100
                                        ? messageContent.substring(0, 97) + "..."
                                        : messageContent;

                        Notification notification = Notification.builder()
                                        .user(recipient)
                                        .type(Notification.NotificationType.NEW_MESSAGE)
                                        .title("New message from " + senderName)
                                        .message(messagePreview)
                                        .actionUrl("/messages?conversation=" + conversationId)
                                        .icon("message-square")
                                        .iconColor("blue")
                                        .senderId(sender.getId())
                                        .senderName(senderName)
                                        .senderAvatar(sender.getProfilePictureUrl())
                                        .conversationId(conversationId)
                                        .build();

                        notificationRepository.save(notification);
                        log.debug(
                                        "Created message notification for user {}",
                                        recipient.getId());
                } catch (Exception e) {
                        log.warn(
                                        "Failed to create message notification: {}",
                                        e.getMessage());
                        // Don't fail the message send if notification creation fails
                }
        }

        @Transactional
        public void markAsRead(Long userId, MarkAsReadRequest request) {
                if (request.getConversationId() != null) {
                        Conversation conversation = conversationRepository
                                        .findByIdAndUserId(request.getConversationId(), userId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

                        int updated = messageRepository.markAllAsReadInConversation(
                                        request.getConversationId(),
                                        userId);
                        conversation.resetUnreadCount(userId);
                        conversationRepository.save(conversation);

                        log.info(
                                        "Marked {} messages as read in conversation {} for user {}",
                                        updated,
                                        request.getConversationId(),
                                        userId);
                } else if (request.getMessageIds() != null &&
                                !request.getMessageIds().isEmpty()) {
                        int updated = messageRepository.markMessagesAsRead(
                                        request.getMessageIds(),
                                        userId);
                        log.info("Marked {} messages as read for user {}", updated, userId);
                }
        }

        @Transactional
        public void markConversationAsRead(Long conversationId, Long userId) {
                Conversation conversation = conversationRepository
                                .findByIdAndUserId(conversationId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

                messageRepository.markAllAsReadInConversation(conversationId, userId);
                conversation.resetUnreadCount(userId);
                conversationRepository.save(conversation);
        }

        @Transactional
        public void deleteConversation(Long conversationId, Long userId) {
                Conversation conversation = conversationRepository
                                .findByIdAndUserId(conversationId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

                conversation.setDeletedForUser(userId, true);
                conversationRepository.save(conversation);

                log.info("Conversation {} deleted for user {}", conversationId, userId);
        }

        @Transactional
        public void deleteMessage(Long messageId, Long userId) {
                Message message = messageRepository
                                .findById(messageId)
                                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

                if (!message.getSender().getId().equals(userId) &&
                                !message.getRecipient().getId().equals(userId)) {
                        throw new BadRequestException("You cannot delete this message");
                }

                message.deleteForUser(userId);
                messageRepository.save(message);

                log.info("Message {} deleted for user {}", messageId, userId);
        }

        @Transactional(readOnly = true)
        public UnreadCountResponse getUnreadCount(Long userId) {
                int totalUnread = conversationRepository.getTotalUnreadCount(userId);

                List<Object[]> unreadByConversation = messageRepository.countUnreadGroupedByConversation(userId);
                Map<Long, Integer> unreadMap = new HashMap<>();
                for (Object[] row : unreadByConversation) {
                        Long conversationId = (Long) row[0];
                        Long count = (Long) row[1];
                        unreadMap.put(conversationId, count.intValue());
                }

                return UnreadCountResponse.builder()
                                .totalUnreadCount(totalUnread)
                                .unreadByConversation(unreadMap)
                                .build();
        }

        @Transactional(readOnly = true)
        public List<ConversationResponse> getAllConversations(Long userId) {
                List<Conversation> conversations = conversationRepository.findAllByUserId(userId);
                return conversations
                                .stream()
                                .map(c -> mapToConversationResponse(c, userId))
                                .collect(Collectors.toList());
        }

        private ConversationResponse mapToConversationResponse(
                        Conversation conversation,
                        Long userId) {
                User otherParticipant = conversation.getOtherParticipant(userId);

                return ConversationResponse.builder()
                                .id(conversation.getId())
                                .otherParticipantId(otherParticipant.getId())
                                .otherParticipantName(
                                                otherParticipant.getFullName() != null
                                                                ? otherParticipant.getFullName()
                                                                : otherParticipant.getEmail())
                                .otherParticipantProfilePicture(
                                                otherParticipant.getProfilePictureUrl())
                                .otherParticipantOnline(false) // Can be enhanced with real-time presence
                                .subject(conversation.getSubject())
                                .propertyId(conversation.getPropertyId())
                                .propertyTitle(conversation.getPropertyTitle())
                                .lastMessage(conversation.getLastMessagePreview())
                                .lastMessageAt(conversation.getLastMessageAt())
                                .unreadCount(conversation.getUnreadCountForUser(userId))
                                .createdAt(conversation.getCreatedAt())
                                .build();
        }

        private MessageResponse mapToMessageResponse(Message message, Long userId) {
                User sender = message.getSender();
                User recipient = message.getRecipient();

                return MessageResponse.builder()
                                .id(message.getId())
                                .conversationId(message.getConversation().getId())
                                .senderId(sender.getId())
                                .senderName(
                                                sender.getFullName() != null
                                                                ? sender.getFullName()
                                                                : sender.getEmail())
                                .senderProfilePicture(sender.getProfilePictureUrl())
                                .recipientId(recipient.getId())
                                .recipientName(
                                                recipient.getFullName() != null
                                                                ? recipient.getFullName()
                                                                : recipient.getEmail())
                                .content(message.getContent())
                                .messageType(message.getMessageType())
                                .attachmentUrl(message.getAttachmentUrl())
                                .attachmentName(message.getAttachmentName())
                                .read(message.isRead())
                                .readAt(message.getReadAt())
                                .createdAt(message.getCreatedAt())
                                .isOwnMessage(sender.getId().equals(userId))
                                .build();
        }
}
