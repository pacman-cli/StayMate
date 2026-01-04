package com.webapp.domain.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private String message;
}
