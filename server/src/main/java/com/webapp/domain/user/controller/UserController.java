package com.webapp.domain.user.controller;

import com.webapp.domain.user.dto.PublicUserDto;
import com.webapp.domain.user.dto.UpdateProfileRequest;
import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.mapper.UserMapper;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
@Tag(name = "Users", description = "Operations related to user management")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    @Operation(summary = "Get current user profile")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved profile"),
            @ApiResponse(responseCode = "401", description = "Not authorized")
    })
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        log.info("Fetching profile for user: {}", currentUser.getEmail());
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @Operation(summary = "Update user profile")
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", currentUser.getEmail());

        User updatedUser = userService.updateUserProfile(
                currentUser.getId(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhoneNumber(),
                request.getBio(),
                request.getAddress(),
                request.getCity(),
                request.getProfilePictureUrl());

        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @Operation(summary = "Get user by ID (Admin only)")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(
            @Parameter(description = "ID of the user to retrieve") @PathVariable Long id) {
        log.info("Admin fetching user with id: {}", id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @Operation(summary = "Delete user account")
    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        log.info("Deleting account for user: {}", currentUser.getEmail());
        userService.deleteUser(currentUser.getId());
        return ResponseEntity.ok(
                Map.of("message", "Account deleted successfully."));
    }

    @Operation(summary = "Check if user has a specific role")
    @GetMapping("/has-role/{role}")
    public ResponseEntity<Map<String, Boolean>> hasRole(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Role name without prefix") @PathVariable String role) {
        boolean hasRole = currentUser
                .getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role.toUpperCase()));
        return ResponseEntity.ok(Map.of("hasRole", hasRole));
    }

    /**
     * Search for users to start a conversation with
     * Excludes the current user from results
     */
    @Operation(summary = "Search for users")
    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Search query") @RequestParam String query) {
        log.info(
                "User {} searching for users with query: {}",
                currentUser.getId(),
                query);

        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }

        List<User> users = userRepository.searchUsers(query.trim());

        // Filter out current user and map to DTOs
        List<UserDto> results = users
                .stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .limit(10) // Limit results
                .map(userMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    /**
     * Get a user's public profile (for viewing in conversations, etc.)
     */
    @Operation(summary = "Get public profile of a user")
    @GetMapping("/public/{id}")
    public ResponseEntity<PublicUserDto> getPublicProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "User ID") @PathVariable Long id) {
        log.info(
                "User {} fetching public profile for user {}",
                currentUser.getId(),
                id);
        User user = userService.getUserById(id);

        // Return only public information
        return ResponseEntity.ok(
                PublicUserDto.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                        .lastName(user.getLastName() != null ? user.getLastName() : "")
                        .fullName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                        .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "")
                        .bio(user.getBio() != null ? user.getBio() : "")
                        .city(user.getCity() != null ? user.getCity() : "")
                        .build());
    }
}
