package com.webapp.domain.user.service;

import com.webapp.auth.dto.request.RegisterRequest;
import com.webapp.domain.user.entity.AuthProvider;
import com.webapp.domain.user.entity.RoleName;
import com.webapp.domain.user.entity.User;
import java.util.List;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface UserService extends UserDetailsService {
    @Override
    UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException;

    UserDetails loadUserById(Long id);

    User registerUser(RegisterRequest registerRequest);

    User createOrUpdateOAuth2User(
        String email,
        String firstName,
        String lastName,
        String profilePictureUrl,
        String providerId,
        AuthProvider provider
    );

    User selectRole(Long userId, String role);

    User getUserById(Long id);

    User getUserByEmail(String email);

    List<User> getAllUsers();

    List<User> getUsersByRole(RoleName role);

    List<User> getHouseOwners();

    List<User> getRegularUsers();

    List<User> getAdmins();

    void updateLastLogin(Long userId);

    User updateUserProfile(
        Long userId,
        String firstName,
        String lastName,
        String phoneNumber,
        String bio,
        String address,
        String city,
        String profilePictureUrl
    );

    User enableUser(Long userId);

    User disableUser(Long userId);

    void deleteUser(Long userId);

    boolean existsByEmail(String email);

    long countUsers();

    long countUsersByRole(RoleName role);

    long countHouseOwners();

    long countRegularUsers();

    long countAdmins();

    // Role management methods (moved from AuthService)
    User promoteToHouseOwner(Long userId);

    User promoteToAdmin(Long userId);

    User removeRole(Long userId, RoleName role);
}
