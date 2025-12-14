package com.webapp.domain.notification.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationListResponse {
    private List<NotificationResponse> notifications;
    private int unreadCount;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasMore;
}
