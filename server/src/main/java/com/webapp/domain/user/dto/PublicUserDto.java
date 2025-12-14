package com.webapp.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Public user profile information")
public class PublicUserDto {

    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "First name", example = "John")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    private String lastName;

    @Schema(description = "Full name or email if name is missing", example = "John Doe")
    private String fullName;

    @Schema(description = "Profile picture URL", example = "https://example.com/profile.jpg")
    private String profilePictureUrl;

    @Schema(description = "Short biography", example = "I am a software engineer")
    private String bio;

    @Schema(description = "City", example = "New York")
    private String city;
}
