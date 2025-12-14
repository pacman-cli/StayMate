package com.webapp.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSelectionRequest {

    @NotBlank(message = "Role is required")
    @Pattern(
        regexp = "^(USER|HOUSE_OWNER|ROLE_USER|ROLE_HOUSE_OWNER)$",
        flags = Pattern.Flag.CASE_INSENSITIVE,
        message = "Role must be either USER or HOUSE_OWNER"
    )
    private String role;
}
