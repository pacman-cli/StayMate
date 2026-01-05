package com.webapp.domain.user.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.AuthProvider;
import com.webapp.domain.user.enums.RoleName;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

        // Override findAll to ensure distinct results (avoids duplicates from eager
        // roles fetch)
        @Override
        @Query(value = "SELECT DISTINCT u FROM User u", countQuery = "SELECT COUNT(DISTINCT u) FROM User u")
        @org.springframework.lang.NonNull
        Page<User> findAll(@org.springframework.lang.NonNull Pageable pageable);

        Optional<User> findByEmail(String email);

        boolean existsByEmail(String email);

        Optional<User> findByProviderIdAndAuthProvider(String providerId, AuthProvider authProvider);

        // Find users by role
        @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r = :role")
        List<User> findByRolesContaining(@Param("role") RoleName role);

        // Count users by role
        @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role")
        long countByRolesContaining(@Param("role") RoleName role);

        // Find all enabled users
        List<User> findByEnabledTrue();

        // Find all disabled users
        List<User> findByEnabledFalse();

        // Find users by city (for roommate matching)
        List<User> findByCityIgnoreCase(String city);

        // Find users by city and role
        @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE LOWER(u.city) = LOWER(:city) AND r = :role")
        List<User> findByCityAndRole(@Param("city") String city, @Param("role") RoleName role);

        // Search users by name or email
        @Query("SELECT u FROM User u WHERE " +
                        "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
        List<User> searchUsers(@Param("search") String search);

        // Search users by name or email with pagination (Admin)
        @Query("SELECT DISTINCT u FROM User u WHERE " +
                        "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
        org.springframework.data.domain.Page<User> searchUsers(@Param("search") String search,
                        org.springframework.data.domain.Pageable pageable);

        // Find house owners in a specific city
        @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE LOWER(u.city) = LOWER(:city) AND r = com.webapp.domain.user.enums.RoleName.ROLE_HOUSE_OWNER")
        List<User> findHouseOwnersByCity(@Param("city") String city);

        // Find users looking for roommates in a specific city
        @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE LOWER(u.city) = LOWER(:city) AND r = com.webapp.domain.user.enums.RoleName.ROLE_USER")
        List<User> findRoommatesByCity(@Param("city") String city);

        // Count enabled users
        long countByEnabledTrue();

        // Count disabled users
        long countByEnabledFalse();

        // Count unverified users
        long countByEmailVerifiedFalse();

        // Find unverified users
        List<User> findByEmailVerifiedFalse();

        // Trend Analysis
        long countByCreatedAtBefore(LocalDateTime date);

        @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role AND u.createdAt < :date")
        long countByRolesContainingAndCreatedAtBefore(@Param("role") RoleName role, @Param("date") LocalDateTime date);

        long countByEnabledTrueAndCreatedAtBefore(LocalDateTime date);

        long countByEmailVerifiedFalseAndCreatedAtBefore(LocalDateTime date);

        long countByCreatedAtAfter(LocalDateTime date);

        long countByLastLoginAtAfter(LocalDateTime date);

        List<User> findByAccountStatusAndDeletionScheduledAtBefore(com.webapp.domain.user.enums.AccountStatus status,
                        LocalDateTime date);

        @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role")
        long countByRole(@Param("role") RoleName role);

        @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role AND u.accountStatus = :status")
        long countByRoleAndAccountStatus(@Param("role") RoleName role,
                        @Param("status") com.webapp.domain.user.enums.AccountStatus status);

        long countByAccountStatus(com.webapp.domain.user.enums.AccountStatus accountStatus);
}
