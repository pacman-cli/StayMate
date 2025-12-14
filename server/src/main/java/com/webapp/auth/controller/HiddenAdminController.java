package com.webapp.auth.controller;

import com.webapp.auth.dto.request.AdminRegisterRequest;
import com.webapp.auth.dto.request.LoginRequest;
import com.webapp.auth.dto.response.AuthResponse;
import com.webapp.auth.exception.UserAlreadyExistsException;
import com.webapp.auth.mapper.AuthResponseMapper;
import com.webapp.auth.security.JwtTokenProvider;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.AuthProvider;
import com.webapp.domain.user.entity.RoleName;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.mapper.UserMapper;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.user.service.UserService;
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
 * Hidden Admin Controller - Secret endpoints for admin access.
 * These endpoints are not documented and require a secret key.
 *
 * Endpoints:
 * - POST /api/v1/internal/sudo/register - Register a new admin
 * - POST /api/v1/internal/sudo/login - Login as admin (validates admin role)
 * - POST /api/v1/internal/sudo/promote/{userId} - Promote existing user to admin
 * - POST /api/v1/internal/sudo/demote/{userId} - Demote admin to regular user
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/internal/sudo")
@RequiredArgsConstructor
public class HiddenAdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final AuthResponseMapper authResponseMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${app.admin.secret-key:RENTMATE_SUPER_SECRET_ADMIN_KEY_2024}")
    private String adminSecretKey;

    /**
     * Register a new admin account.
     * Requires the admin secret key in the request body.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(
        @Valid @RequestBody AdminRegisterRequest request
    ) {
        log.warn(
            "Admin registration attempt for email: {}",
            request.getEmail()
        );

        if (!adminSecretKey.equals(request.getAdminSecretKey())) {
            log.error(
                "Invalid admin secret key used for registration attempt: {}",
                request.getEmail()
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                    "error",
                    "Access denied",
                    "message",
                    "Invalid credentials"
                )
            );
        }

        if (userService.existsByEmail(request.getEmail())) {
            log.warn(
                "Admin registration failed - email already exists: {}",
                request.getEmail()
            );
            throw new UserAlreadyExistsException(
                "Email address is already registered"
            );
        }

        Set<RoleName> roles = new HashSet<>();
        roles.add(RoleName.ROLE_ADMIN);

        User adminUser = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .authProvider(AuthProvider.LOCAL)
            .emailVerified(true)
            .phoneVerified(false)
            .enabled(true)
            .roleSelected(true)
            .roles(roles)
            .build();

        User savedUser = userRepository.save(adminUser);
        log.info("New ADMIN registered: {}", savedUser.getEmail());

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String accessToken = jwtTokenProvider.generateAccessToken(
            userPrincipal
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(
            userPrincipal
        );

        AuthResponse response = authResponseMapper.toAuthResponse(
            accessToken,
            refreshToken,
            jwtTokenProvider.getAccessTokenExpirationMs(),
            savedUser
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Admin login - validates that the user has admin role.
     * Requires the admin secret key in header.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(
        @RequestHeader(
            value = "X-Admin-Secret",
            required = false
        ) String secretHeader,
        @Valid @RequestBody LoginRequest request
    ) {
        log.warn("Admin login attempt for email: {}", request.getEmail());

        if (secretHeader == null || !adminSecretKey.equals(secretHeader)) {
            log.error(
                "Invalid admin secret key in header for login attempt: {}",
                request.getEmail()
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                    "error",
                    "Access denied",
                    "message",
                    "Invalid credentials"
                )
            );
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            UserPrincipal userPrincipal =
                (UserPrincipal) authentication.getPrincipal();

            User user = userService.getUserByEmail(request.getEmail());

            if (!user.isAdmin()) {
                log.warn(
                    "Admin login failed - user is not an admin: {}",
                    request.getEmail()
                );
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of(
                        "error",
                        "Access denied",
                        "message",
                        "Not authorized for admin access"
                    )
                );
            }

            String accessToken = jwtTokenProvider.generateAccessToken(
                userPrincipal
            );
            String refreshToken = jwtTokenProvider.generateRefreshToken(
                userPrincipal
            );

            log.info("Admin login successful: {}", request.getEmail());

            AuthResponse response = authResponseMapper.toAuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs(),
                user
            );

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            log.error(
                "Admin login failed - invalid credentials: {}",
                request.getEmail()
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                    "error",
                    "Authentication failed",
                    "message",
                    "Invalid email or password"
                )
            );
        }
    }

    /**
     * Promote an existing user to admin.
     * Requires admin secret key in header.
     */
    @PostMapping("/promote/{userId}")
    public ResponseEntity<?> promoteToAdmin(
        @RequestHeader(
            value = "X-Admin-Secret",
            required = false
        ) String secretHeader,
        @PathVariable Long userId
    ) {
        log.warn("Admin promotion attempt for user ID: {}", userId);

        if (secretHeader == null || !adminSecretKey.equals(secretHeader)) {
            log.error(
                "Invalid admin secret key in header for promotion attempt"
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                    "error",
                    "Access denied",
                    "message",
                    "Invalid credentials"
                )
            );
        }

        try {
            User user = userService.getUserById(userId);

            if (user.isAdmin()) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error",
                        "Already admin",
                        "message",
                        "User is already an admin"
                    )
                );
            }

            // Use UserService for role management
            User updatedUser = userService.promoteToAdmin(userId);

            log.info("User promoted to ADMIN: {}", updatedUser.getEmail());

            return ResponseEntity.ok(userMapper.toDto(updatedUser));
        } catch (Exception e) {
            log.error("Failed to promote user to admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Promotion failed", "message", e.getMessage())
            );
        }
    }

    /**
     * Demote an admin to regular user.
     * Requires admin secret key in header.
     */
    @PostMapping("/demote/{userId}")
    public ResponseEntity<?> demoteFromAdmin(
        @RequestHeader(
            value = "X-Admin-Secret",
            required = false
        ) String secretHeader,
        @PathVariable Long userId
    ) {
        log.warn("Admin demotion attempt for user ID: {}", userId);

        if (secretHeader == null || !adminSecretKey.equals(secretHeader)) {
            log.error(
                "Invalid admin secret key in header for demotion attempt"
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                    "error",
                    "Access denied",
                    "message",
                    "Invalid credentials"
                )
            );
        }

        try {
            User user = userService.getUserById(userId);

            if (!user.isAdmin()) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error",
                        "Not admin",
                        "message",
                        "User is not an admin"
                    )
                );
            }

            // Use UserService for role management
            User updatedUser = userService.removeRole(
                userId,
                RoleName.ROLE_ADMIN
            );

            log.info("User demoted from ADMIN: {}", updatedUser.getEmail());

            return ResponseEntity.ok(userMapper.toDto(updatedUser));
        } catch (Exception e) {
            log.error("Failed to demote user from admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Demotion failed", "message", e.getMessage())
            );
        }
    }
}
