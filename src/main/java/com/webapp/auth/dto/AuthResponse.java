package com.webapp.auth.dto;

import com.webapp.auth.entity.RoleName;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {

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
        private Set<String> roles;

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
    }

    public static AuthResponse of(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        UserDto user
    ) {
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(expiresIn)
            .user(user)
            .build();
    }

    public static UserDto mapUserToDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        String fullName,
        String phoneNumber,
        String profilePictureUrl,
        String bio,
        String address,
        String city,
        boolean emailVerified,
        boolean phoneVerified,
        Set<RoleName> roles
    ) {
        return UserDto.builder()
            .id(id)
            .email(email)
            .firstName(firstName)
            .lastName(lastName)
            .fullName(fullName)
            .phoneNumber(phoneNumber)
            .profilePictureUrl(profilePictureUrl)
            .bio(bio)
            .address(address)
            .city(city)
            .emailVerified(emailVerified)
            .phoneVerified(phoneVerified)
            .roles(
                roles != null
                    ? roles
                          .stream()
                          .map(RoleName::name)
                          .collect(Collectors.toSet())
                    : Set.of("ROLE_USER")
            )
            .build();
    }
}
