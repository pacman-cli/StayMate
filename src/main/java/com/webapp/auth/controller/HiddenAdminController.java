package com.webapp.auth.controller;

import com.webapp.auth.dto.AdminRegisterRequest;
import com.webapp.auth.dto.AuthResponse;
import com.webapp.auth.dto.LoginRequest;
import com.webapp.auth.dto.UserDto;
import com.webapp.auth.entity.AuthProvider;
import com.webapp.auth.entity.RoleName;
import com.webapp.auth.entity.User;
import com.webapp.auth.exception.UserAlreadyExistsException;
import com.webapp.auth.repository.UserRepository;
import com.webapp.auth.security.JwtTokenProvider;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.auth.service.UserService;
import jakarta.validation.Valid;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Hidden Admin Controller - Secret endpoints for admin access
 * These endpoints are not documented and require a secret key
 *
 * Endpoints:
 * - POST /api/v1/internal/sudo/register - Register a new admin
 * - POST /api/v1/internal/sudo/login - Login as admin (validates admin role)
 * - POST /api/v1/internal/sudo/promote/{userId} - Promote existing user to admin
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/internal/sudo")
@RequiredArgsConstructor
public class HiddenAdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    // Secret key from environment variable or application properties
    // Default is for development only - MUST be changed in production
    @Value("${app.admin.secret-key:RENTMATE_SUPER_SECRET_ADMIN_KEY_2024}")
    private String adminSecretKey;

    /**
     * Register a new admin account
     * Requires the admin secret key
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(
        @Valid @RequestBody AdminRegisterRequest request
    ) {
        log.warn("Admin registration attempt for email: {}", request.getEmail());

        // Validate secret key
        if (!adminSecretKey.equals(request.getAdminSecretKey())) {
            log.error("Invalid admin secret key used for registration attempt: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("error", "Access denied", "message", "Invalid credentials")
            );
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Admin registration failed - email already exists: {}", request.getEmail());
            throw new UserAlreadyExistsException("Email address is already registered");
        }

        // Create admin user with ROLE_ADMIN
        Set<RoleName> roles = new HashSet<>();
        roles.add(RoleName.ROLE_ADMIN);

        User adminUser = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .authProvider(AuthProvider.LOCAL)
            .emailVerified(true) // Admin is auto-verified
            .phoneVerified(false)
            .enabled(true)
            .roleSelected(true) // Admin doesn't need role selection
            .roles(roles)
            .build();

        User savedUser = userRepository.save(adminUser);
        log.info("New ADMIN registered: {}", savedUser.getEmail());

        // Generate tokens
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String accessToken = jwtTokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userPrincipal);

        UserDto userDto = userService.convertToDto(savedUser);

        AuthResponse response = AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
            .user(AuthResponse.UserDto.builder()
                .id(userDto.getId())
                .email(userDto.getEmail())
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .fullName(userDto.getFullName())
                .phoneNumber(userDto.getPhoneNumber())
                .profilePictureUrl(userDto.getProfilePictureUrl())
                .bio(userDto.getBio())
                .address(userDto.getAddress())
                .city(userDto.getCity())
                .emailVerified(userDto.isEmailVerified())
                .phoneVerified(userDto.isPhoneVerified())
                .roles(userDto.getRoles())
                .build())
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Admin login - validates that the user has admin role
     * Requires the admin secret key in header
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(
        @RequestHeader(value = "X-Admin-Secret", required = false) String secretHeader,
        @Valid @RequestBody LoginRequest request
    ) {
        log.warn("Admin login attempt for email: {}", request.getEmail());

        // Validate secret key from header
        if (secretHeader == null || !adminSecretKey.equals(secretHeader)) {
            log.error("Invalid admin secret key in header for login attempt: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("error", "Access denied", "message", "Invalid credentials")
            );
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            // Check if user has admin role
            User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

            if (user == null || !user.isAdmin()) {
                log.warn("Admin login failed - user is not an admin: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of("error", "Access denied", "message", "Not authorized for admin access")
                );
            }

            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(userPrincipal);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userPrincipal);

            UserDto userDto = userService.convertToDto(user);

            log.info("Admin login successful: {}", request.getEmail());

            AuthResponse response = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .user(AuthResponse.UserDto.builder()
                    .id(userDto.getId())
                    .email(userDto.getEmail())
                    .firstName(userDto.getFirstName())
                    .lastName(userDto.getLastName())
                    .fullName(userDto.getFullName())
                    .phoneNumber(userDto.getPhoneNumber())
                    .profilePictureUrl(userDto.getProfilePictureUrl())
                    .bio(userDto.getBio())
                    .address(userDto.getAddress())
                    .city(userDto.getCity())
                    .emailVerified(userDto.isEmailVerified())
                    .phoneVerified(userDto.isPhoneVerified())
                    .roles(userDto.getRoles())
                    .build())
                .build();

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            log.error("Admin login failed - invalid credentials: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Authentication failed", "message", "Invalid email or password")
            );
        }
    }

    /**
     * Promote an existing user to admin
     * Requires admin secret key
     */
    @PostMapping("/promote/{userId}")
    public ResponseEntity<?> promoteToAdmin(
        @RequestHeader(value = "X-Admin-Secret", required = false) String secretHeader,
        @PathVariable Long userId
    ) {
        log.warn("Admin promotion attempt for user ID: {}", userId);

        // Validate secret key from header
        if (secretHeader == null || !adminSecretKey.equals(secretHeader)) {
            log.error("Invalid admin secret key in header for promotion attempt");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("error", "Access denied", "message", "Invalid credentials")
            );
        }

        try {
            User user = userService.getUserById(userId);

            if (user.isAdmin()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Already admin", "message", "User is already an admin")
                );
            }

            // Add admin role
            user.getRoles().add(RoleName.ROLE_ADMIN);
            User updatedUser = userRepository.save(user);

            log.info("User promoted to ADMIN: {}", updatedUser.getEmail());

            return ResponseEntity.ok(userService.convertToDto(updatedUser));

        } catch (Exception e) {
            log.error("Failed to promote user to admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Promotion failed", "message", e.getMessage())
            );
        }
    }

    /**
     * Demote an admin to regular user
     * Requires admin secret key
     */
    @PostMapping("/demote/{userId}")
    public ResponseEntity<?> demoteFromAdmin(
        @RequestHeader(value = "X-Admin-Secret", required = false) String secretHeader,
        @PathVariable Long userId
    ) {
        log.warn("Admin demotion attempt for user ID: {}", userId);

        // Validate secret key from header
        if (secretHeader == null || !adminSecretKey.equals(secretHeader)) {
            log.error("Invalid admin secret key in header for demotion attempt");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("error", "Access denied", "message", "Invalid credentials")
            );
        }

        try {
            User user = userService.getUserById(userId);

            if (!user.isAdmin()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Not admin", "message", "User is not an admin")
                );
            }

            // Remove admin role
            user.getRoles().remove(RoleName.ROLE_ADMIN);

            // Ensure user has at least one role
            if (user.getRoles().isEmpty()) {
                user.getRoles().add(RoleName.ROLE_USER);
            }

            User updatedUser = userRepository.save(user);

            log.info("User demoted from ADMIN: {}", updatedUser.getEmail());

            return ResponseEntity.ok(userService.convertToDto(updatedUser));

        } catch (Exception e) {
            log.error("Failed to demote user from admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Demotion failed", "message", e.getMessage())
            );
        }
    }
}
