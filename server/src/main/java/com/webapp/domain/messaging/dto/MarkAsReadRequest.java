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
public class MarkAsReadRequest {
    private Long conversationId;
    private List<Long> messageIds;
}
