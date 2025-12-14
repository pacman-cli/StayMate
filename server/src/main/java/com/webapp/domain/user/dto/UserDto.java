package com.webapp.domain.user.dto;

import com.webapp.domain.user.entity.AuthProvider;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing full user details for API responses.
 * Contains all user information including metadata and audit fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String profilePictureUrl;
    private String bio;
    private String address;
    private String city;
    private boolean emailVerified;
    private boolean phoneVerified;
    private boolean roleSelected;
    private AuthProvider authProvider;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean enabled;

    public boolean isAdmin() {
        return roles != null && roles.contains("ROLE_ADMIN");
    }

    public boolean isHouseOwner() {
        return roles != null && roles.contains("ROLE_HOUSE_OWNER");
    }

    public boolean isRegularUser() {
        return (
            roles != null &&
            roles.contains("ROLE_USER") &&
            !isAdmin() &&
            !isHouseOwner()
        );
    }

    public String getPrimaryRole() {
        if (isAdmin()) {
            return "ADMIN";
        } else if (isHouseOwner()) {
            return "HOUSE_OWNER";
        } else {
            return "USER";
        }
    }

    public boolean needsRoleSelection() {
        return !roleSelected && authProvider != AuthProvider.LOCAL;
    }
}
