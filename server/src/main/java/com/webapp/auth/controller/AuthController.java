package com.webapp.auth.controller;

import com.webapp.auth.dto.request.LoginRequest;
import com.webapp.auth.dto.request.RegisterRequest;
import com.webapp.auth.dto.request.RoleSelectionRequest;
import com.webapp.auth.dto.request.TokenRefreshRequest;
import com.webapp.auth.dto.response.AuthResponse;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.auth.service.AuthService;
import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.mapper.UserMapper;
import com.webapp.domain.user.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        log.info(
            "Registration request received for email: {}",
            request.getEmail()
        );
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request
    ) {
        log.info("Login request received for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(
        @Valid @RequestBody TokenRefreshRequest request
    ) {
        log.info("Token refresh request received");
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Get current user request for: {}", userDetails.getUsername());
        User user = userService.getUserByEmail(userDetails.getUsername());
        UserDto userDto = userMapper.toDto(user);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/select-role")
    public ResponseEntity<?> selectRole(
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        @Valid @RequestBody RoleSelectionRequest request
    ) {
        if (userPrincipal == null) {
            log.error("Role selection failed: userPrincipal is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                    "error",
                    "Not authenticated",
                    "message",
                    "Please log in again"
                )
            );
        }

        log.info(
            "Role selection request for user: {} (id: {}) with role: {}",
            userPrincipal.getEmail(),
            userPrincipal.getId(),
            request.getRole()
        );

        try {
            User updatedUser = userService.selectRole(
                userPrincipal.getId(),
                request.getRole()
            );
            UserDto userDto = userMapper.toDto(updatedUser);
            log.info(
                "Role selection successful for user: {}",
                userPrincipal.getEmail()
            );
            return ResponseEntity.ok(userDto);
        } catch (IllegalStateException e) {
            log.warn(
                "Role selection failed for user {}: {}",
                userPrincipal.getEmail(),
                e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of(
                    "error",
                    "Role already selected",
                    "message",
                    e.getMessage()
                )
            );
        } catch (Exception e) {
            log.error(
                "Unexpected error during role selection for user {}: {}",
                userPrincipal.getEmail(),
                e.getMessage(),
                e
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Server error", "message", e.getMessage())
            );
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailAvailability(
        @RequestParam String email
    ) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(
            Map.of("exists", exists, "available", !exists)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails != null) {
            log.info("Logout request for user: {}", userDetails.getUsername());
        }
        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
        return ResponseEntity.ok(
            Map.of("valid", true, "email", userDetails.getUsername())
        );
    }
}
