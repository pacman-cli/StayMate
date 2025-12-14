package com.webapp.domain.user.service.impl;

import com.webapp.auth.dto.request.RegisterRequest;
import com.webapp.auth.exception.BadRequestException;
import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.auth.exception.UserAlreadyExistsException;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.user.entity.AuthProvider;
import com.webapp.domain.user.entity.RoleName;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.user.service.UserService;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Primary
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
        UserRepository userRepository,
        @Lazy PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new UsernameNotFoundException(
                    "User not found with email: " + email
                )
            );

        return UserPrincipal.create(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        return UserPrincipal.create(user);
    }

    @Override
    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException(
                "Email address is already registered"
            );
        }

        // Determine role based on request
        Set<RoleName> roles = new HashSet<>();
        String requestedRole = registerRequest.getRole();

        if (
            requestedRole != null &&
            requestedRole.equalsIgnoreCase("HOUSE_OWNER")
        ) {
            roles.add(RoleName.ROLE_HOUSE_OWNER);
            log.info(
                "Registering user as HOUSE_OWNER: {}",
                registerRequest.getEmail()
            );
        } else {
            roles.add(RoleName.ROLE_USER);
            log.info(
                "Registering user as USER: {}",
                registerRequest.getEmail()
            );
        }

        User user = User.builder()
            .email(registerRequest.getEmail())
            .password(passwordEncoder.encode(registerRequest.getPassword()))
            .firstName(registerRequest.getFirstName())
            .lastName(registerRequest.getLastName())
            .phoneNumber(registerRequest.getPhoneNumber())
            .bio(registerRequest.getBio())
            .address(registerRequest.getAddress())
            .city(registerRequest.getCity())
            .authProvider(AuthProvider.LOCAL)
            .emailVerified(false)
            .phoneVerified(false)
            .enabled(true)
            .roles(roles)
            .build();

        User savedUser = userRepository.save(user);
        log.info(
            "New user registered: {} with role: {}",
            savedUser.getEmail(),
            roles
        );

        return savedUser;
    }

    @Override
    @Transactional
    public User createOrUpdateOAuth2User(
        String email,
        String firstName,
        String lastName,
        String profilePictureUrl,
        String providerId,
        AuthProvider provider
    ) {
        return userRepository
            .findByEmail(email)
            .map(existingUser -> {
                existingUser.setFirstName(firstName);
                existingUser.setLastName(lastName);
                existingUser.setProfilePictureUrl(profilePictureUrl);
                existingUser.setLastLoginAt(LocalDateTime.now());
                return userRepository.save(existingUser);
            })
            .orElseGet(() -> {
                Set<RoleName> roles = new HashSet<>();
                roles.add(RoleName.ROLE_USER);

                User newUser = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .profilePictureUrl(profilePictureUrl)
                    .authProvider(provider)
                    .providerId(providerId)
                    .emailVerified(true)
                    .phoneVerified(false)
                    .enabled(true)
                    .roleSelected(false) // New OAuth users need to select their role
                    .roles(roles)
                    .build();

                User savedUser = userRepository.save(newUser);
                log.info(
                    "New OAuth2 user registered: {} via {} (role selection pending)",
                    email,
                    provider
                );
                return savedUser;
            });
    }

    @Override
    @Transactional
    public User selectRole(Long userId, String role) {
        User user = getUserById(userId);

        if (user.isRoleSelected()) {
            throw new IllegalStateException(
                "Role has already been selected for this user"
            );
        }

        // Clear existing roles and set the new one
        Set<RoleName> roles = new HashSet<>();
        if (
            "HOUSE_OWNER".equalsIgnoreCase(role) ||
            "ROLE_HOUSE_OWNER".equalsIgnoreCase(role)
        ) {
            roles.add(RoleName.ROLE_HOUSE_OWNER);
            log.info("User {} selected role: HOUSE_OWNER", user.getEmail());
        } else {
            roles.add(RoleName.ROLE_USER);
            log.info("User {} selected role: USER", user.getEmail());
        }

        user.setRoles(roles);
        user.setRoleSelected(true);

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "email", email)
            );
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(RoleName role) {
        return userRepository.findByRolesContaining(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getHouseOwners() {
        return getUsersByRole(RoleName.ROLE_HOUSE_OWNER);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getRegularUsers() {
        return getUsersByRole(RoleName.ROLE_USER);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAdmins() {
        return getUsersByRole(RoleName.ROLE_ADMIN);
    }

    @Override
    @Transactional
    public void updateLastLogin(Long userId) {
        User user = getUserById(userId);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserProfile(
        Long userId,
        String firstName,
        String lastName,
        String phoneNumber,
        String bio,
        String address,
        String city,
        String profilePictureUrl
    ) {
        User user = getUserById(userId);

        if (firstName != null) {
            user.setFirstName(firstName);
        }
        if (lastName != null) {
            user.setLastName(lastName);
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (address != null) {
            user.setAddress(address);
        }
        if (city != null) {
            user.setCity(city);
        }
        if (profilePictureUrl != null) {
            user.setProfilePictureUrl(profilePictureUrl);
        }

        User updatedUser = userRepository.save(user);
        log.info("User profile updated: {}", user.getEmail());

        return updatedUser;
    }

    @Override
    @Transactional
    public User enableUser(Long userId) {
        User user = getUserById(userId);
        user.setEnabled(true);
        User updatedUser = userRepository.save(user);
        log.info("User enabled: {}", user.getEmail());
        return updatedUser;
    }

    @Override
    @Transactional
    public User disableUser(Long userId) {
        User user = getUserById(userId);
        user.setEnabled(false);
        User updatedUser = userRepository.save(user);
        log.info("User disabled: {}", user.getEmail());
        return updatedUser;
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public long countUsers() {
        return userRepository.count();
    }

    @Override
    public long countUsersByRole(RoleName role) {
        return userRepository.countByRolesContaining(role);
    }

    @Override
    public long countHouseOwners() {
        return countUsersByRole(RoleName.ROLE_HOUSE_OWNER);
    }

    @Override
    public long countRegularUsers() {
        return countUsersByRole(RoleName.ROLE_USER);
    }

    @Override
    public long countAdmins() {
        return countUsersByRole(RoleName.ROLE_ADMIN);
    }

    // ==================== Role Management Methods (moved from AuthService) ====================

    @Override
    @Transactional
    public User promoteToHouseOwner(Long userId) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "id", userId)
            );

        if (user.getRoles().contains(RoleName.ROLE_HOUSE_OWNER)) {
            throw new BadRequestException("User is already a house owner");
        }

        user.getRoles().add(RoleName.ROLE_HOUSE_OWNER);
        User updatedUser = userRepository.save(user);
        log.info("User {} promoted to HOUSE_OWNER", user.getEmail());

        return updatedUser;
    }

    @Override
    @Transactional
    public User promoteToAdmin(Long userId) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "id", userId)
            );

        if (user.getRoles().contains(RoleName.ROLE_ADMIN)) {
            throw new BadRequestException("User is already an admin");
        }

        user.getRoles().add(RoleName.ROLE_ADMIN);
        User updatedUser = userRepository.save(user);
        log.info("User {} promoted to ADMIN", user.getEmail());

        return updatedUser;
    }

    @Override
    @Transactional
    public User removeRole(Long userId, RoleName role) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "id", userId)
            );

        if (!user.getRoles().contains(role)) {
            throw new BadRequestException("User does not have this role");
        }

        // Ensure user always has at least ROLE_USER
        if (role == RoleName.ROLE_USER && user.getRoles().size() == 1) {
            throw new BadRequestException(
                "Cannot remove the only role from user"
            );
        }

        user.getRoles().remove(role);

        // Ensure user always has ROLE_USER as base role
        if (!user.getRoles().contains(RoleName.ROLE_USER)) {
            user.getRoles().add(RoleName.ROLE_USER);
        }

        User updatedUser = userRepository.save(user);
        log.info("Role {} removed from user {}", role, user.getEmail());

        return updatedUser;
    }
}
