package com.webapp.domain.notification.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationUnreadCountResponse {
    private int totalUnread;
    private Map<String, Integer> countByType;
}
