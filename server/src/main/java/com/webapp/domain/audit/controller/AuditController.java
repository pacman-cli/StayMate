package com.webapp.domain.audit.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.audit.dto.AuditLogResponse;
import com.webapp.domain.audit.entity.AuditLog;
import com.webapp.domain.audit.service.AuditService;

import lombok.RequiredArgsConstructor;

/**
 * Admin controller for viewing audit logs.
 * Restricted to ADMIN role only.
 */
@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AuditController {

  private final AuditService auditService;

  /**
   * Get all audit logs with pagination.
   */
  @GetMapping
  public ResponseEntity<Page<AuditLogResponse>> getAllLogs(
      @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
    Page<AuditLog> logs = auditService.getAllLogs(pageable);
    return ResponseEntity.ok(logs.map(this::toResponse));
  }

  /**
   * Get audit logs for a specific user.
   */
  @GetMapping("/user/{userId}")
  public ResponseEntity<Page<AuditLogResponse>> getLogsForUser(
      @PathVariable Long userId,
      @PageableDefault(size = 50) Pageable pageable) {
    Page<AuditLog> logs = auditService.getLogsForUser(userId, pageable);
    return ResponseEntity.ok(logs.map(this::toResponse));
  }

  /**
   * Get audit logs for a specific entity.
   */
  @GetMapping("/entity/{entityType}/{entityId}")
  public ResponseEntity<Page<AuditLogResponse>> getLogsForEntity(
      @PathVariable String entityType,
      @PathVariable Long entityId,
      @PageableDefault(size = 50) Pageable pageable) {
    Page<AuditLog> logs = auditService.getLogsForEntity(entityType, entityId, pageable);
    return ResponseEntity.ok(logs.map(this::toResponse));
  }

  /**
   * Cleanup old audit logs (admin only).
   */
  @DeleteMapping("/cleanup")
  public ResponseEntity<Map<String, String>> cleanupOldLogs(
      @RequestParam(defaultValue = "90") int retentionDays) {
    auditService.cleanupOldLogs(retentionDays);
    return ResponseEntity.ok(Map.of(
        "message", "Cleaned up audit logs older than " + retentionDays + " days"));
  }

  private AuditLogResponse toResponse(AuditLog log) {
    return AuditLogResponse.builder()
        .id(log.getId())
        .userId(log.getUser() != null ? log.getUser().getId() : null)
        .userName(log.getUser() != null ? log.getUser().getFirstName() + " " + log.getUser().getLastName() : null)
        .action(log.getAction())
        .entityType(log.getEntityType())
        .entityId(log.getEntityId())
        .details(log.getDetails())
        .ipAddress(log.getIpAddress())
        .requestId(log.getRequestId())
        .createdAt(log.getCreatedAt())
        .build();
  }
}
