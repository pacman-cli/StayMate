package com.webapp.domain.application.dto;

import java.time.LocalDateTime;

import com.webapp.domain.application.enums.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderProfilePictureUrl;

    private Long receiverId;
    private String receiverName;

    private Long propertyId;
    private String propertyTitle;
    private String propertyLocation;

    private ApplicationStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
