package com.webapp.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "email_verified")
    private boolean emailVerified;

    @Column(name = "phone_verified")
    private boolean phoneVerified;

    @Column(name = "role_selected")
    @Builder.Default
    private boolean roleSelected = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    private AuthProvider authProvider;

    @Column(name = "provider_id")
    private String providerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50)
    @Builder.Default
    private Set<RoleName> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (roles == null || roles.isEmpty()) {
            roles = new HashSet<>();
            roles.add(RoleName.ROLE_USER);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        if (firstName == null && lastName == null) {
            return null;
        }
        return (
            (firstName != null ? firstName : "") +
            " " +
            (lastName != null ? lastName : "")
        ).trim();
    }

    public boolean isAdmin() {
        return roles.contains(RoleName.ROLE_ADMIN);
    }

    public boolean isHouseOwner() {
        return roles.contains(RoleName.ROLE_HOUSE_OWNER);
    }

    public boolean isRegularUser() {
        return (
            roles.contains(RoleName.ROLE_USER) && !isAdmin() && !isHouseOwner()
        );
    }

    public boolean needsRoleSelection() {
        return !roleSelected && authProvider != AuthProvider.LOCAL;
    }
}
