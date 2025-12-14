package com.webapp.auth.dto;

import com.webapp.auth.entity.AuthProvider;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    // Helper methods for role checking
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
