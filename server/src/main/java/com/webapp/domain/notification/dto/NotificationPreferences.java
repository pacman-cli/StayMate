package com.webapp.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferences {
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean messageNotifications;
    private boolean bookingNotifications;
    private boolean propertyNotifications;
    private boolean reviewNotifications;
    private boolean systemNotifications;
    private boolean marketingNotifications;
}
