package com.webapp.domain.application.mapper;

import org.springframework.stereotype.Component;

import com.webapp.domain.application.dto.ApplicationResponse;
import com.webapp.domain.application.entity.Application;

@Component
public class ApplicationMapper {

    public ApplicationResponse toResponse(Application app) {
        if (app == null) {
            return null;
        }
        return ApplicationResponse.builder()
                .id(app.getId())
                .senderId(app.getSender().getId())
                .senderName(app.getSender().getFullName())
                .senderEmail(app.getSender().getEmail())
                .senderProfilePictureUrl(app.getSender().getProfilePictureUrl())
                .receiverId(app.getReceiver().getId())
                .receiverName(app.getReceiver().getFullName())
                .propertyId(app.getProperty() != null ? app.getProperty().getId() : null)
                .propertyTitle(app.getProperty() != null ? app.getProperty().getTitle() : null)
                .propertyLocation(app.getProperty() != null ? app.getProperty().getLocation() : null)
                .status(app.getStatus())
                .message(app.getMessage())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
