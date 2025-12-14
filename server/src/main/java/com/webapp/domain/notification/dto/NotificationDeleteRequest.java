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
public class NotificationDeleteRequest {
    private List<Long> notificationIds;
    private boolean deleteAll;
    private boolean deleteReadOnly;
}
