package com.webapp.domain.audit.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.webapp.domain.audit.dto.AuditLogResponse;

public interface AuditLogService {

  Page<AuditLogResponse> getAllLogs(Pageable pageable);

  Page<AuditLogResponse> getLogsByUserId(Long userId, Pageable pageable);

  Page<AuditLogResponse> getLogsByAction(String action, Pageable pageable);

  Page<AuditLogResponse> getLogsByEntity(String entityType, Long entityId, Pageable pageable);

  Page<AuditLogResponse> getLogsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable);

  Map<String, Long> getActionStatistics(LocalDateTime since);

  void logAction(Long userId, String action, String entityType, Long entityId, String details, String ipAddress,
      String userAgent);

  void cleanupOldLogs(int daysToKeep);
}
