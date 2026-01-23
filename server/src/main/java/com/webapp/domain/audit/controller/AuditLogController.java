package com.webapp.domain.audit.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.audit.dto.AuditLogResponse;
import com.webapp.domain.audit.service.AuditLogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit Logs", description = "Admin endpoints for viewing system audit logs")
public class AuditLogController {

  private final AuditLogService auditLogService;

  @GetMapping
  @Operation(summary = "Get all audit logs with pagination")
  public ResponseEntity<Page<AuditLogResponse>> getAllLogs(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) Long userId,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String entityType,
      @RequestParam(required = false) Long entityId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

    Page<AuditLogResponse> logs;

    if (userId != null) {
      logs = auditLogService.getLogsByUserId(userId, pageable);
    } else if (action != null) {
      logs = auditLogService.getLogsByAction(action, pageable);
    } else if (entityType != null && entityId != null) {
      logs = auditLogService.getLogsByEntity(entityType, entityId, pageable);
    } else if (startDate != null && endDate != null) {
      logs = auditLogService.getLogsByDateRange(startDate, endDate, pageable);
    } else {
      logs = auditLogService.getAllLogs(pageable);
    }

    return ResponseEntity.ok(logs);
  }

  @GetMapping("/stats")
  @Operation(summary = "Get audit log action statistics")
  public ResponseEntity<Map<String, Long>> getActionStats(
      @RequestParam(defaultValue = "7") int days) {

    LocalDateTime since = LocalDateTime.now().minusDays(days);
    Map<String, Long> stats = auditLogService.getActionStatistics(since);
    return ResponseEntity.ok(stats);
  }
}
