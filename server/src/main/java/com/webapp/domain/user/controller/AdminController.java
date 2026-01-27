package com.webapp.domain.user.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.admin.service.SystemSettingService;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    private final com.webapp.domain.property.service.PropertyService propertyService;
    private final com.webapp.domain.verification.service.VerificationService verificationService;
    private final com.webapp.domain.report.service.ReportService reportService;
    private final SystemSettingService settingService;

    // ==================== Property Management ====================

    @GetMapping("/properties")
    public ResponseEntity<List<com.webapp.domain.property.dto.PropertyResponse>> getAllProperties() {
        log.info("Admin requesting all properties");
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @PutMapping("/properties/{id}/approve")
    public ResponseEntity<com.webapp.domain.property.dto.PropertyResponse> approveProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        log.info("Admin approving property {}", id);
        return ResponseEntity.ok(propertyService.updatePropertyStatus(id, "Approved", currentUser.getId()));
    }

    @PutMapping("/properties/{id}/reject")
    public ResponseEntity<com.webapp.domain.property.dto.PropertyResponse> rejectProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        log.info("Admin rejecting property {}", id);
        return ResponseEntity.ok(propertyService.updatePropertyStatus(id, "Rejected", currentUser.getId()));
    }

    // ==================== Reports ====================

    @GetMapping("/reports")
    public ResponseEntity<List<com.webapp.domain.report.entity.Report>> getReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<com.webapp.domain.report.entity.Report> resolveReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String notes = body.get("notes");
        return ResponseEntity.ok(reportService.resolveReport(id, notes));
    }

    @PostMapping("/reports/{id}/dismiss")
    public ResponseEntity<com.webapp.domain.report.entity.Report> dismissReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String notes = body.get("notes");
        return ResponseEntity.ok(reportService.dismissReport(id, notes));
    }

    // ==================== Verifications ====================

    @GetMapping("/verifications")
    public ResponseEntity<List<com.webapp.domain.verification.entity.VerificationRequest>> getVerifications() {
        return ResponseEntity.ok(verificationService.getAllRequests());
    }

    @PutMapping("/verifications/{id}/approve")
    public ResponseEntity<com.webapp.domain.verification.entity.VerificationRequest> approveVerification(
            @PathVariable Long id) {
        return ResponseEntity.ok(verificationService.approveRequest(id));
    }

    @PutMapping("/verifications/{id}/reject")
    public ResponseEntity<com.webapp.domain.verification.entity.VerificationRequest> rejectVerification(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(verificationService.rejectRequest(id, reason));
    }

    // ==================== Settings ====================

    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, String>> updateSettings(
            @RequestBody Map<String, String> settings) {
        return ResponseEntity.ok(settingService.updateSettings(settings));
    }

    // ==================== User Management ====================

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable Long id,
            @RequestParam com.webapp.domain.user.enums.AccountStatus status) {
        userService.updateAccountStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
