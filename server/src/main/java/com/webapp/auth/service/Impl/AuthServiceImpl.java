package com.webapp.auth.service.Impl;

import com.webapp.auth.dto.request.LoginRequest;
import com.webapp.auth.dto.request.RegisterRequest;
import com.webapp.auth.dto.request.TokenRefreshRequest;
import com.webapp.auth.dto.response.AuthResponse;
import com.webapp.auth.exception.BadRequestException;
import com.webapp.auth.mapper.AuthResponseMapper;
import com.webapp.auth.security.JwtTokenProvider;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.auth.service.AuthService;
import com.webapp.domain.notification.enums.NotificationType;
import com.webapp.domain.notification.service.NotificationService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService.
 * Handles authentication operations: registration, login, and token management.
 *
 * User creation is delegated to UserService to avoid code duplication.
 * Notification creation is delegated to NotificationService to avoid code
 * duplication.
 * Role management has been moved to UserService.
 */
@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuthResponseMapper authResponseMapper;

    public AuthServiceImpl(
            UserRepository userRepository,
            @Lazy UserService userService,
            @Lazy NotificationService notificationService,
            JwtTokenProvider jwtTokenProvider,
            @Lazy AuthenticationManager authenticationManager,
            AuthResponseMapper authResponseMapper) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.authResponseMapper = authResponseMapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info(
                "Attempting to register user with email: {}",
                request.getEmail());

        // Delegate user creation to UserService to avoid duplicate code
        User savedUser = userService.registerUser(request);

        log.info(
                "User registered successfully with id: {} and roles: {}",
                savedUser.getId(),
                savedUser.getRoles());

        // Create welcome notification using NotificationService
        createWelcomeNotification(savedUser);

        // Generate tokens
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String accessToken = jwtTokenProvider.generateAccessToken(
                userPrincipal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                userPrincipal);

        return authResponseMapper.toAuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs() / 1000,
                savedUser);
    }

    /**
     * Create a welcome notification for newly registered users.
     * Delegates to NotificationService to avoid duplicate notification creation
     * logic.
     */
    private void createWelcomeNotification(User user) {
        try {
            String userName = user.getFirstName() != null
                    ? user.getFirstName()
                    : "there";

            String welcomeMessage = "Hi " +
                    userName +
                    "! Your account has been created successfully. " +
                    "Start exploring properties or find your perfect roommate today!";

            notificationService.createNotificationForUser(
                    user.getId(),
                    NotificationType.WELCOME,
                    "Welcome to RentMate! 🎉",
                    welcomeMessage,
                    "/dashboard");

            log.debug("Created welcome notification for user {}", user.getId());
        } catch (Exception e) {
            log.warn(
                    "Failed to create welcome notification: {}",
                    e.getMessage());
            // Don't fail registration if notification creation fails
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // Update last login time using UserService
        userService.updateLastLogin(userPrincipal.getId());

        // Get updated user
        User user = userService.getUserById(userPrincipal.getId());

        String accessToken = jwtTokenProvider.generateAccessToken(
                authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                authentication);

        log.info(
                "User logged in successfully: {} with roles: {}",
                request.getEmail(),
                user.getRoles());

        return authResponseMapper.toAuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs() / 1000,
                user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new BadRequestException("Token is not a refresh token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userService.getUserById(userId);

        if (!user.isEnabled()) {
            throw new BadRequestException("User account is disabled");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                userPrincipal);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                userPrincipal);

        log.info("Token refreshed for user: {}", user.getEmail());

        return authResponseMapper.toAuthResponse(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpirationMs() / 1000,
                user);
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No authenticated user found");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return userService.getUserById(userPrincipal.getId());
    }
}
