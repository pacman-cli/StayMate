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
public class NotificationSummary {
    private int totalUnread;
    private int messagesUnread;
    private int bookingsUnread;
    private int propertyUnread;
    private int systemUnread;
    private List<NotificationResponse> recentNotifications;
}
