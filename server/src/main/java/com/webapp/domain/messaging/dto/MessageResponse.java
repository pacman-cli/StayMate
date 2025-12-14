package com.webapp.domain.messaging.dto;

import com.webapp.domain.messaging.entity.Message.MessageType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderProfilePicture;
    private Long recipientId;
    private String recipientName;
    private String content;
    private MessageType messageType;
    private String attachmentUrl;
    private String attachmentName;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private boolean isOwnMessage;
}
