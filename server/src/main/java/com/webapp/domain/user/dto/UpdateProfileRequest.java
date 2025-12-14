package com.webapp.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request object for updating user profile")
public class UpdateProfileRequest {

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "Phone number", example = "+1234567890")
    private String phoneNumber;

    @Schema(description = "Short biography", example = "I am a software engineer")
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    @Schema(description = "Residential address", example = "123 Main St")
    private String address;

    @Schema(description = "City", example = "New York")
    private String city;

    @Schema(description = "Profile picture URL", example = "https://example.com/profile.jpg")
    private String profilePictureUrl;
}
