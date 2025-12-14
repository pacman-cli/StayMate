package com.webapp.domain.messaging.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private Long otherParticipantId;
    private String otherParticipantName;
    private String otherParticipantProfilePicture;
    private boolean otherParticipantOnline;
    private String subject;
    private Long propertyId;
    private String propertyTitle;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private LocalDateTime createdAt;
}
