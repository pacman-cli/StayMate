package com.webapp.auth.repository;

import com.webapp.auth.entity.AuthProvider;
import com.webapp.auth.entity.RoleName;
import com.webapp.auth.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByProviderIdAndAuthProvider(
        String providerId,
        AuthProvider authProvider
    );

    // Find users by role
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRolesContaining(@Param("role") RoleName role);

    // Count users by role
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r = :role")
    long countByRolesContaining(@Param("role") RoleName role);

    // Find all enabled users
    List<User> findByEnabledTrue();

    // Find all disabled users
    List<User> findByEnabledFalse();

    // Find users by city (for roommate matching)
    List<User> findByCityIgnoreCase(String city);

    // Find users by city and role
    @Query(
        "SELECT u FROM User u JOIN u.roles r WHERE LOWER(u.city) = LOWER(:city) AND r = :role"
    )
    List<User> findByCityAndRole(
        @Param("city") String city,
        @Param("role") RoleName role
    );

    // Search users by name or email
    @Query(
        "SELECT u FROM User u WHERE " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))"
    )
    List<User> searchUsers(@Param("search") String search);

    // Find house owners in a specific city
    @Query(
        "SELECT u FROM User u JOIN u.roles r WHERE LOWER(u.city) = LOWER(:city) AND r = com.webapp.auth.entity.RoleName.ROLE_HOUSE_OWNER"
    )
    List<User> findHouseOwnersByCity(@Param("city") String city);

    // Find users looking for roommates in a specific city
    @Query(
        "SELECT u FROM User u JOIN u.roles r WHERE LOWER(u.city) = LOWER(:city) AND r = com.webapp.auth.entity.RoleName.ROLE_USER"
    )
    List<User> findRoommatesByCity(@Param("city") String city);

    // Count enabled users
    long countByEnabledTrue();

    // Count disabled users
    long countByEnabledFalse();
}
