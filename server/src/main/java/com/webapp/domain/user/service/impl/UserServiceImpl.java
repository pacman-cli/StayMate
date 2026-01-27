package com.webapp.domain.user.service.impl;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.context.annotation.Primary;
import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.auth.dto.request.RegisterRequest;
import com.webapp.auth.exception.BadRequestException;
import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.auth.exception.UserAlreadyExistsException;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.user.dto.UserCreateDto;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.AuthProvider;
import com.webapp.domain.user.enums.RoleName;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final com.webapp.domain.property.repository.PropertyRepository propertyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email));

        // Allow PENDING_DELETION users to login so they can cancel
        // if (user.getAccountStatus() ==
        // com.webapp.domain.user.enums.AccountStatus.PENDING_DELETION) {
        // throw new org.springframework.security.authentication.DisabledException(
        // "Your account is scheduled for deletion on " +
        // user.getDeletionScheduledAt());
        // }

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
                    "Email address is already registered");
        }

        // Determine role based on request
        Set<RoleName> roles = new HashSet<>();
        String requestedRole = registerRequest.getRole();

        if (requestedRole != null &&
                requestedRole.equalsIgnoreCase("HOUSE_OWNER")) {
            roles.add(RoleName.ROLE_HOUSE_OWNER);
            log.info(
                    "Registering user as HOUSE_OWNER: {}",
                    registerRequest.getEmail());
        } else {
            roles.add(RoleName.ROLE_USER);
            log.info(
                    "Registering user as USER: {}",
                    registerRequest.getEmail());
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
                roles);

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
            AuthProvider provider) {
        return userRepository
                .findByEmail(email)
                .map(existingUser -> {
                    existingUser.setFirstName(firstName);
                    existingUser.setLastName(lastName);
                    // Only overwrite profile picture if it's not a locally uploaded one
                    // Checking for both controller-based uploads and MinIO bucket uploads
                    if (existingUser.getProfilePictureUrl() == null
                            || (!existingUser.getProfilePictureUrl().contains("/api/uploads/")
                                    && !existingUser.getProfilePictureUrl().contains("staymate-uploads"))) {
                        existingUser.setProfilePictureUrl(profilePictureUrl);
                    }
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
                            provider);
                    return savedUser;
                });
    }

    @Override
    @Transactional
    public User selectRole(Long userId, String role) {
        User user = getUserById(userId);

        if (user.isRoleSelected()) {
            throw new IllegalStateException(
                    "Role has already been selected for this user");
        }

        // Clear existing roles and set the new one
        Set<RoleName> roles = new HashSet<>();
        if ("HOUSE_OWNER".equalsIgnoreCase(role) ||
                "ROLE_HOUSE_OWNER".equalsIgnoreCase(role)) {
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
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<User> getAllUsers(
            @NonNull org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<User> searchUsers(String query,
            @NonNull org.springframework.data.domain.Pageable pageable) {
        return userRepository.searchUsers(query, pageable);
    }

    @Override
    @Transactional
    public User createUser(UserCreateDto userCreateDto) {
        if (userRepository.existsByEmail(userCreateDto.getEmail())) {
            throw new UserAlreadyExistsException("Email address is already registered");
        }

        User user = User.builder()
                .email(userCreateDto.getEmail())
                .password(passwordEncoder.encode(userCreateDto.getPassword())) // Admin sets password
                .firstName(userCreateDto.getFirstName())
                .lastName(userCreateDto.getLastName())
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(true) // Admin created users are verified
                .phoneVerified(false)
                .enabled(userCreateDto.isEnabled())
                .roles(userCreateDto.getRoles() != null && !userCreateDto.getRoles().isEmpty()
                        ? userCreateDto.getRoles()
                        : Set.of(RoleName.ROLE_USER))
                .roleSelected(true)
                .build();

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Long id, com.webapp.domain.user.dto.UserUpdateDto userUpdateDto) {
        User user = getUserById(id);

        if (userUpdateDto.getFirstName() != null)
            user.setFirstName(userUpdateDto.getFirstName());
        if (userUpdateDto.getLastName() != null)
            user.setLastName(userUpdateDto.getLastName());
        if (userUpdateDto.getPhoneNumber() != null)
            user.setPhoneNumber(userUpdateDto.getPhoneNumber());
        if (userUpdateDto.getBio() != null)
            user.setBio(userUpdateDto.getBio());
        if (userUpdateDto.getAddress() != null)
            user.setAddress(userUpdateDto.getAddress());
        if (userUpdateDto.getCity() != null)
            user.setCity(userUpdateDto.getCity());

        if (userUpdateDto.getRoles() != null && !userUpdateDto.getRoles().isEmpty()) {
            user.setRoles(userUpdateDto.getRoles());
        }

        if (userUpdateDto.getEnabled() != null) {
            user.setEnabled(userUpdateDto.getEnabled());
        }

        return userRepository.save(user);
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
            String profilePictureUrl) {
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
        log.info("Starting soft deletion for user: {}", user.getEmail());

        // 1. Anonymize Personal Information
        String anonymizedEmail = "deleted_" + user.getId() + "@staymate.local";
        user.setEmail(anonymizedEmail);
        user.setFirstName("Deleted");
        user.setLastName("User");
        user.setPhoneNumber(null);
        user.setProfilePictureUrl(null);
        user.setBio(null);
        user.setAddress(null);
        user.setCity(null);

        // 2. Disable Account and Mark as Deleted
        user.setEnabled(false);
        user.setAccountStatus(com.webapp.domain.user.enums.AccountStatus.DELETED);
        user.setDeletionScheduledAt(null);
        user.setLastLoginAt(null);
        user.setPhoneOtp(null);
        user.setProviderId(null);

        // 3. Deactivate all properties owned by this user
        List<com.webapp.domain.property.entity.Property> properties = propertyRepository.findAllByOwnerId(userId);
        for (com.webapp.domain.property.entity.Property property : properties) {
            property.setStatus(com.webapp.domain.property.enums.PropertyStatus.INACTIVE);
            propertyRepository.save(property);
        }

        // 4. Save User (Soft Delete)
        userRepository.save(user);

        // Note: We DO NOT delete notifications, applications, bookings, matches, or
        // conversations
        // to preserve history and prevent foreign key measurement errors.
        // Since the user is anonymous and disabled, this data is effectively archived.

        log.info("User soft deleted successfully: {}", userId);
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

    @Override
    public long countActiveUsers() {
        return userRepository.countByEnabledTrue();
    }

    @Override
    public long countUnverifiedUsers() {
        return userRepository.countByEmailVerifiedFalse();
    }

    // ==================== Role Management Methods (moved from AuthService)
    // ====================

    /**
     * Promotes user to house owner; persists the change
     */
    @Override
    @Transactional
    public User promoteToHouseOwner(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

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
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

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
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.getRoles().contains(role)) {
            throw new BadRequestException("User does not have this role");
        }

        // Ensure user always has at least ROLE_USER
        if (role == RoleName.ROLE_USER && user.getRoles().size() == 1) {
            throw new BadRequestException(
                    "Cannot remove the only role from user");
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

    @Override
    @Transactional
    public User updateAccountStatus(Long userId, com.webapp.domain.user.enums.AccountStatus status) {
        User user = getUserById(userId);
        user.setAccountStatus(status);

        // If banned or suspended, also disable logic if needed, but keeping separate is
        // fine too.
        // Usually BANNED implies disabled access.
        if (status == com.webapp.domain.user.enums.AccountStatus.BANNED ||
                status == com.webapp.domain.user.enums.AccountStatus.SUSPENDED) {
            user.setEnabled(false);
        } else if (status == com.webapp.domain.user.enums.AccountStatus.ACTIVE) {
            user.setEnabled(true);
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public User toggleNotificationPreference(Long userId, String type, boolean enabled) {
        User user = getUserById(userId);

        if ("email".equalsIgnoreCase(type)) {
            user.setEmailNotifications(enabled);
        } else if ("push".equalsIgnoreCase(type)) {
            user.setPushNotifications(enabled);
        } else {
            throw new BadRequestException("Invalid notification type: " + type);
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateProfilePicture(Long userId, String profilePictureUrl) {
        User user = getUserById(userId);
        user.setProfilePictureUrl(profilePictureUrl);
        User savedUser = userRepository.save(user);
        userRepository.flush(); // Ensure immediate write
        return savedUser;
    }
}
