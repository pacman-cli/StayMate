package com.webapp.domain.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {
    private Long recipientId;
    private String subject;
    private Long propertyId;
    private String propertyTitle;
    private String initialMessage;
}
