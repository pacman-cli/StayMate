package com.webapp.auth.service;

import com.webapp.auth.dto.AuthResponse;
import com.webapp.auth.dto.LoginRequest;
import com.webapp.auth.dto.RegisterRequest;
import com.webapp.auth.dto.TokenRefreshRequest;
import com.webapp.auth.entity.AuthProvider;
import com.webapp.auth.entity.RoleName;
import com.webapp.auth.entity.User;
import com.webapp.auth.exception.BadRequestException;
import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.auth.exception.UserAlreadyExistsException;
import com.webapp.auth.repository.UserRepository;
import com.webapp.auth.security.JwtTokenProvider;
import com.webapp.auth.security.UserPrincipal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(
        UserRepository userRepository,
        @Lazy PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider,
        @Lazy AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info(
            "Attempting to register user with email: {}",
            request.getEmail()
        );

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                "User with email " + request.getEmail() + " already exists"
            );
        }

        // Determine role based on request
        Set<RoleName> roles = new HashSet<>();
        String requestedRole = request.getRole();

        if (
            requestedRole != null &&
            requestedRole.equalsIgnoreCase("HOUSE_OWNER")
        ) {
            roles.add(RoleName.ROLE_HOUSE_OWNER);
            log.info("Registering user as HOUSE_OWNER: {}", request.getEmail());
        } else {
            roles.add(RoleName.ROLE_USER);
            log.info("Registering user as USER: {}", request.getEmail());
        }

        // Create new user
        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .bio(request.getBio())
            .address(request.getAddress())
            .city(request.getCity())
            .authProvider(AuthProvider.LOCAL)
            .emailVerified(false)
            .phoneVerified(false)
            .enabled(true)
            .roles(roles)
            .build();

        User savedUser = userRepository.save(user);
        log.info(
            "User registered successfully with id: {} and role: {}",
            savedUser.getId(),
            roles
        );

        // Generate tokens
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String accessToken = jwtTokenProvider.generateAccessToken(
            userPrincipal
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(
            userPrincipal
        );

        return buildAuthResponse(accessToken, refreshToken, savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal =
            (UserPrincipal) authentication.getPrincipal();

        // Update last login time
        User user = userRepository
            .findById(userPrincipal.getId())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "User",
                    "id",
                    userPrincipal.getId()
                )
            );
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(
            authentication
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(
            authentication
        );

        log.info(
            "User logged in successfully: {} with roles: {}",
            request.getEmail(),
            user.getRoles()
        );

        return buildAuthResponse(accessToken, refreshToken, user);
    }

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
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "id", userId)
            );

        if (!user.isEnabled()) {
            throw new BadRequestException("User account is disabled");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(
            userPrincipal
        );
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
            userPrincipal
        );

        log.info("Token refreshed for user: {}", user.getEmail());

        return buildAuthResponse(newAccessToken, newRefreshToken, user);
    }

    public User getCurrentUser() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No authenticated user found");
        }

        UserPrincipal userPrincipal =
            (UserPrincipal) authentication.getPrincipal();

        return userRepository
            .findById(userPrincipal.getId())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "User",
                    "id",
                    userPrincipal.getId()
                )
            );
    }

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

    private AuthResponse buildAuthResponse(
        String accessToken,
        String refreshToken,
        User user
    ) {
        AuthResponse.UserDto userDto = AuthResponse.mapUserToDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getFullName(),
            user.getPhoneNumber(),
            user.getProfilePictureUrl(),
            user.getBio(),
            user.getAddress(),
            user.getCity(),
            user.isEmailVerified(),
            user.isPhoneVerified(),
            user.getRoles()
        );

        return AuthResponse.of(
            accessToken,
            refreshToken,
            jwtTokenProvider.getAccessTokenExpirationMs() / 1000,
            userDto
        );
    }
}
