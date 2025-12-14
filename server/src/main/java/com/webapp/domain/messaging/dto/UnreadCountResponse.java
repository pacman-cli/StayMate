package com.webapp.domain.messaging.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountResponse {
    private int totalUnreadCount;
    private Map<Long, Integer> unreadByConversation;
}
