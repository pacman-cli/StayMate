package com.webapp.domain.messaging.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageListResponse {
    private List<MessageResponse> messages;
    private ConversationResponse conversation;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
