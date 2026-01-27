package com.webapp.domain.user.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.file.service.FileStorageService;
import com.webapp.domain.user.dto.PublicUserDto;
import com.webapp.domain.user.dto.UpdateProfileRequest;
import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.mapper.UserMapper;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Operations related to user management")
public class UserController {

        private final UserService userService;
        private final UserMapper userMapper;
        private final UserRepository userRepository;
        private final FileStorageService fileStorageService;
        private final com.webapp.domain.user.service.UserDeletionService userDeletionService;

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

        @Operation(summary = "Upload profile picture")
        @PostMapping("/photo")
        public ResponseEntity<UserDto> uploadProfilePicture(
                        @RequestParam("file") MultipartFile file,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
                // storeFile now returns the full MinIO URL
                String fileUrl = fileStorageService.storeFile(file);
                User updatedUser = userService.updateProfilePicture(currentUser.getId(), fileUrl);
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

        @Operation(summary = "Delete user account (Self)")
        @DeleteMapping("/profile")
        public ResponseEntity<Map<String, String>> deleteAccount(
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
                log.info("Initiating deletion for user: {}", currentUser.getEmail());
                userDeletionService.initiateDeletion(currentUser.getId(), null, "User requested deletion");
                return ResponseEntity.ok(
                                Map.of("message", "Account scheduled for deletion. It will be permanent in 3 days."));
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
                                                .fullName(user.getFullName() != null ? user.getFullName()
                                                                : user.getEmail())
                                                .profilePictureUrl(user.getProfilePictureUrl() != null
                                                                ? user.getProfilePictureUrl()
                                                                : "")
                                                .bio(user.getBio() != null ? user.getBio() : "")
                                                .city(user.getCity() != null ? user.getCity() : "")
                                                .build());
        }

        @Operation(summary = "Get all users (Admin only)")
        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<org.springframework.data.domain.Page<UserDto>> getAllUsers(
                        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
                        @Parameter(description = "Search query") @RequestParam(required = false) String search,
                        @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
                        @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

                Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size, sort);
                org.springframework.data.domain.Page<User> userPage;

                if (search != null && !search.trim().isEmpty()) {
                        userPage = userService.searchUsers(search.trim(), pageable);
                } else {
                        userPage = userService.getAllUsers(pageable);
                }

                log.info("Admin fetching users: found {} users (page {}/{} using size {})",
                                userPage.getTotalElements(),
                                userPage.getNumber(),
                                userPage.getTotalPages(),
                                userPage.getSize());

                return ResponseEntity.ok(userPage.map(userMapper::toDto));
        }

        @Operation(summary = "Create user (Admin only)")
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserDto> createUser(
                        @Valid @RequestBody com.webapp.domain.user.dto.UserCreateDto request) {
                User user = userService.createUser(request);
                return ResponseEntity.ok(userMapper.toDto(user));
        }

        @Operation(summary = "Update user (Admin only)")
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserDto> updateUser(
                        @PathVariable Long id,
                        @RequestBody com.webapp.domain.user.dto.UserUpdateDto request) {
                User user = userService.updateUser(id, request);
                return ResponseEntity.ok(userMapper.toDto(user));
        }

        @Operation(summary = "Change password")
        @PostMapping("/password")
        public ResponseEntity<Map<String, String>> changePassword(
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
                        @RequestBody com.webapp.domain.user.dto.PasswordChangeRequest request) {
                userService.changePassword(currentUser.getId(), request.getOldPassword(), request.getNewPassword());
                return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        }

        @Operation(summary = "Update notification settings")
        @PostMapping("/settings")
        public ResponseEntity<UserDto> updateSettings(
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
                        @RequestBody com.webapp.domain.user.dto.NotificationSettingRequest request) {
                User user = userService.toggleNotificationPreference(currentUser.getId(), request.getType(),
                                request.isEnabled());
                return ResponseEntity.ok(userMapper.toDto(user));
        }

        @Operation(summary = "Delete user (Admin only)")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> deleteUser(
                        @PathVariable Long id,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
                User user = userService.getUserById(id);
                // Directly execute deletion for admins
                userDeletionService.executeDeletion(user);
                return ResponseEntity.noContent().build();
        }
}
