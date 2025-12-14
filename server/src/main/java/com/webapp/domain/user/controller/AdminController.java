package com.webapp.domain.user.controller;

import com.webapp.domain.user.dto.UserDto;
import com.webapp.domain.user.entity.RoleName;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.mapper.UserMapper;
import com.webapp.domain.user.service.UserService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin controller for user management operations.
 * All endpoints require ADMIN role.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final UserMapper userMapper;

    // ==================== Dashboard Stats ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Admin requesting dashboard stats");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.countUsers());
        stats.put("totalHouseOwners", userService.countHouseOwners());
        stats.put("totalRegularUsers", userService.countRegularUsers());
        stats.put("totalAdmins", userService.countAdmins());

        return ResponseEntity.ok(stats);
    }

    // ==================== User Management ====================

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        log.info("Admin requesting all users");
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(userMapper.toDtoList(users));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId) {
        log.info("Admin requesting user with id: {}", userId);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserDto>> getUsersByRole(
        @PathVariable String role
    ) {
        log.info("Admin requesting users with role: {}", role);

        RoleName roleName;
        try {
            roleName = RoleName.valueOf("ROLE_" + role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        List<User> users = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(userMapper.toDtoList(users));
    }

    @GetMapping("/users/house-owners")
    public ResponseEntity<List<UserDto>> getHouseOwners() {
        log.info("Admin requesting all house owners");
        List<User> houseOwners = userService.getHouseOwners();
        return ResponseEntity.ok(userMapper.toDtoList(houseOwners));
    }

    @GetMapping("/users/regular")
    public ResponseEntity<List<UserDto>> getRegularUsers() {
        log.info("Admin requesting all regular users");
        List<User> regularUsers = userService.getRegularUsers();
        return ResponseEntity.ok(userMapper.toDtoList(regularUsers));
    }

    // ==================== Role Management ====================

    @PostMapping("/users/{userId}/promote/house-owner")
    public ResponseEntity<UserDto> promoteToHouseOwner(
        @PathVariable Long userId
    ) {
        log.info("Admin promoting user {} to HOUSE_OWNER", userId);
        User user = userService.promoteToHouseOwner(userId);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PostMapping("/users/{userId}/promote/admin")
    public ResponseEntity<UserDto> promoteToAdmin(@PathVariable Long userId) {
        log.info("Admin promoting user {} to ADMIN", userId);
        User user = userService.promoteToAdmin(userId);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PostMapping("/users/{userId}/demote/house-owner")
    public ResponseEntity<UserDto> demoteFromHouseOwner(
        @PathVariable Long userId
    ) {
        log.info("Admin demoting user {} from HOUSE_OWNER", userId);
        User user = userService.removeRole(userId, RoleName.ROLE_HOUSE_OWNER);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PostMapping("/users/{userId}/demote/admin")
    public ResponseEntity<UserDto> demoteFromAdmin(@PathVariable Long userId) {
        log.info("Admin demoting user {} from ADMIN", userId);
        User user = userService.removeRole(userId, RoleName.ROLE_ADMIN);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    // ==================== User Status Management ====================

    @PostMapping("/users/{userId}/enable")
    public ResponseEntity<UserDto> enableUser(@PathVariable Long userId) {
        log.info("Admin enabling user {}", userId);
        User user = userService.enableUser(userId);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PostMapping("/users/{userId}/disable")
    public ResponseEntity<UserDto> disableUser(@PathVariable Long userId) {
        log.info("Admin disabling user {}", userId);
        User user = userService.disableUser(userId);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(
        @PathVariable Long userId
    ) {
        log.info("Admin deleting user {}", userId);
        userService.deleteUser(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== Search ====================

    @GetMapping("/users/search")
    public ResponseEntity<List<UserDto>> searchUsers(
        @RequestParam String query
    ) {
        log.info("Admin searching users with query: {}", query);
        List<User> users = userService
            .getAllUsers()
            .stream()
            .filter(
                u ->
                    (u.getEmail() != null &&
                        u
                            .getEmail()
                            .toLowerCase()
                            .contains(query.toLowerCase())) ||
                    (u.getFirstName() != null &&
                        u
                            .getFirstName()
                            .toLowerCase()
                            .contains(query.toLowerCase())) ||
                    (u.getLastName() != null &&
                        u
                            .getLastName()
                            .toLowerCase()
                            .contains(query.toLowerCase())) ||
                    (u.getCity() != null &&
                        u.getCity().toLowerCase().contains(query.toLowerCase()))
            )
            .toList();
        return ResponseEntity.ok(userMapper.toDtoList(users));
    }
}
