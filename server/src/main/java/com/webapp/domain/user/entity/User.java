package com.webapp.domain.user.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.webapp.domain.user.enums.AuthProvider;
import com.webapp.domain.user.enums.RoleName;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
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

    @Column(name = "gender")
    private String gender;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "phone_verified")
    @Builder.Default
    private Boolean phoneVerified = false;

    @Column(name = "phone_otp")
    private String phoneOtp;

    @Column(name = "role_selected")
    @Builder.Default
    private boolean roleSelected = false;

    @Column(name = "email_notifications")
    @Builder.Default
    private boolean emailNotifications = true;

    @Column(name = "push_notifications")
    @Builder.Default
    private boolean pushNotifications = true;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "auth_provider", nullable = false, columnDefinition = "varchar(255)")
    private AuthProvider authProvider;

    @Column(name = "provider_id")
    private String providerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "role", columnDefinition = "varchar(50)")
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

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "account_status", nullable = false, columnDefinition = "varchar(255)")
    @Builder.Default
    private com.webapp.domain.user.enums.AccountStatus accountStatus = com.webapp.domain.user.enums.AccountStatus.ACTIVE;

    @Column(name = "deletion_requested_at")
    private LocalDateTime deletionRequestedAt;

    @Column(name = "deletion_scheduled_at")
    private LocalDateTime deletionScheduledAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @Column(name = "deletion_reason")
    private String deletionReason;

    @Column(name = "seeking_mode")
    @Builder.Default
    private String seekingMode = "ROOM";

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        if (firstName == null && lastName == null) {
            return null;
        }
        return ((firstName != null ? firstName : "") +
                " " +
                (lastName != null ? lastName : "")).trim();
    }

    public boolean isAdmin() {
        return roles.contains(RoleName.ROLE_ADMIN);
    }

    public boolean isHouseOwner() {
        return roles.contains(RoleName.ROLE_HOUSE_OWNER);
    }

    public boolean isRegularUser() {
        return (roles.contains(RoleName.ROLE_USER) && !isAdmin() && !isHouseOwner());
    }

    public boolean needsRoleSelection() {
        return !roleSelected && authProvider != AuthProvider.LOCAL;
    }

    // Helper methods for boolean wrappers to maintain compatibility and handle
    // nulls
    public boolean isEmailVerified() {
        return Boolean.TRUE.equals(emailVerified);
    }

    public boolean isPhoneVerified() {
        return Boolean.TRUE.equals(phoneVerified);
    }
}
