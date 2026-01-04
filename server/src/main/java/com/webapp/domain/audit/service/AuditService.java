package com.webapp.domain.audit.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.webapp.domain.audit.entity.AuditLog;
import com.webapp.domain.audit.repository.AuditLogRepository;
import com.webapp.domain.user.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for creating and querying audit logs.
 * Provides async logging to avoid impacting request performance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

  private final AuditLogRepository auditLogRepository;
  private final UserRepository userRepository;

  /**
   * Asynchronously log a user action.
   */
  @Async
  @Transactional
  public void logAction(Long userId, String action, String entityType, Long entityId, String details) {
    try {
      AuditLog.AuditLogBuilder builder = AuditLog.builder()
          .action(action)
          .entityType(entityType)
          .entityId(entityId)
          .details(details)
          .requestId(MDC.get("requestId"));

      // Get user if provided
      if (userId != null) {
        userRepository.findById(userId).ifPresent(builder::user);
      }

      // Get request details if available
      getHttpRequest().ifPresent(request -> {
        builder.ipAddress(getClientIp(request));
        builder.userAgent(request.getHeader("User-Agent"));
      });

      auditLogRepository.save(builder.build());
      log.debug("Audit log created: {} {} on {}:{}", action, userId, entityType, entityId);
    } catch (Exception e) {
      log.error("Failed to create audit log: {}", e.getMessage());
    }
  }

  /**
   * Quick log method for common actions.
   */
  @Async
  @Transactional
  public void log(Long userId, AuditAction action, String entityType, Long entityId) {
    logAction(userId, action.name(), entityType, entityId, null);
  }

  /**
   * Get audit logs for a specific user.
   */
  @Transactional(readOnly = true)
  public Page<AuditLog> getLogsForUser(Long userId, Pageable pageable) {
    return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
  }

  /**
   * Get audit logs for a specific entity.
   */
  @Transactional(readOnly = true)
  public Page<AuditLog> getLogsForEntity(String entityType, Long entityId, Pageable pageable) {
    return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
        entityType, entityId, pageable);
  }

  /**
   * Get all logs with pagination.
   */
  @Transactional(readOnly = true)
  public Page<AuditLog> getAllLogs(Pageable pageable) {
    return auditLogRepository.findAll(pageable);
  }

  /**
   * Cleanup old audit logs (retention policy).
   */
  @Transactional
  public void cleanupOldLogs(int retentionDays) {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
    auditLogRepository.deleteByCreatedAtBefore(cutoff);
    log.info("Cleaned up audit logs older than {} days", retentionDays);
  }

  private Optional<HttpServletRequest> getHttpRequest() {
    try {
      ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      return Optional.ofNullable(attrs).map(ServletRequestAttributes::getRequest);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  private String getClientIp(HttpServletRequest request) {
    String forwardedFor = request.getHeader("X-Forwarded-For");
    if (forwardedFor != null && !forwardedFor.isEmpty()) {
      return forwardedFor.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }

  /**
   * Common audit actions.
   */
  public enum AuditAction {
    // Auth
    LOGIN,
    LOGOUT,
    REGISTER,
    PASSWORD_CHANGE,

    // User
    PROFILE_UPDATE,
    ROLE_CHANGE,
    ACCOUNT_DELETE,

    // Property
    PROPERTY_CREATE,
    PROPERTY_UPDATE,
    PROPERTY_DELETE,
    PROPERTY_VIEW,

    // Booking
    BOOKING_CREATE,
    BOOKING_APPROVE,
    BOOKING_REJECT,
    BOOKING_CANCEL,

    // Messaging
    MESSAGE_SEND,
    CONVERSATION_CREATE,

    // Admin
    ADMIN_ACTION,
    USER_BAN,
    USER_UNBAN
  }
}
