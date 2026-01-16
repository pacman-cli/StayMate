package com.webapp.domain.admin.controller;

import java.util.Map;

import com.webapp.auth.security.*;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.user.service.UserDeletionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserDeletionService userDeletionService;

    @PostMapping("/{userId}/delete-request")
    public ResponseEntity<?> initiateDeletion(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            @RequestBody Map<String, String> request) {

        String reason = request.get("reason");
        userDeletionService.initiateDeletion(userId, adminPrincipal.getId(), reason);
        return ResponseEntity.ok().body(Map.of("message", "User scheduled for deletion in 72 hours"));
    }

    @PostMapping("/{userId}/cancel-delete")
    public ResponseEntity<?> cancelDeletion(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        userDeletionService.cancelDeletion(userId, adminPrincipal.getId());
        return ResponseEntity.ok().body(Map.of("message", "User deletion cancelled. Account restored to ACTIVE."));
    }
}
