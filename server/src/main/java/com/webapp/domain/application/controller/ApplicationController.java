package com.webapp.domain.application.controller;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.application.dto.ApplicationRequest;
import com.webapp.domain.application.dto.ApplicationResponse;
import com.webapp.domain.application.enums.ApplicationStatus;
import com.webapp.domain.application.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> sendApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.ok(applicationService.sendApplication(userPrincipal.getId(), request));
    }

    @GetMapping("/sent")
    public ResponseEntity<Page<ApplicationResponse>> getSentApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getSentApplications(userPrincipal.getId(), pageable));
    }

    @GetMapping("/received")
    public ResponseEntity<Page<ApplicationResponse>> getReceivedApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getReceivedApplications(userPrincipal.getId(), pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(userPrincipal.getId(), id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        applicationService.deleteApplication(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
