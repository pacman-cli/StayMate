package com.webapp.auth.controller;

import com.webapp.auth.dto.UserDto;
import com.webapp.auth.entity.User;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.auth.service.UserService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(
        @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("Fetching profile for user: {}", currentUser.getEmail());
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(userService.convertToDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
        @AuthenticationPrincipal UserPrincipal currentUser,
        @RequestBody Map<String, String> updates
    ) {
        log.info("Updating profile for user: {}", currentUser.getEmail());

        User user = userService.getUserById(currentUser.getId());

        if (updates.containsKey("firstName")) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("profilePictureUrl")) {
            user.setProfilePictureUrl(updates.get("profilePictureUrl"));
        }

        // Note: In a real application, you'd have a dedicated update method in the service
        User updatedUser = userService.getUserById(currentUser.getId());

        return ResponseEntity.ok(userService.convertToDto(updatedUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.info("Admin fetching user with id: {}", id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userService.convertToDto(user));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, String>> deleteAccount(
        @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("Deleting account for user: {}", currentUser.getEmail());
        // Note: Implement soft delete in UserService
        return ResponseEntity.ok(
            Map.of(
                "message",
                "Account deletion requested. This action cannot be undone."
            )
        );
    }

    @GetMapping("/has-role/{role}")
    public ResponseEntity<Map<String, Boolean>> hasRole(
        @AuthenticationPrincipal UserPrincipal currentUser,
        @PathVariable String role
    ) {
        boolean hasRole = currentUser
            .getAuthorities()
            .stream()
            .anyMatch(auth ->
                auth.getAuthority().equals("ROLE_" + role.toUpperCase())
            );
        return ResponseEntity.ok(Map.of("hasRole", hasRole));
    }
}
