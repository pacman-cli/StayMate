package com.webapp.domain.audit.service.impl;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.audit.dto.AuditLogResponse;
import com.webapp.domain.audit.entity.AuditLog;
import com.webapp.domain.audit.repository.AuditLogRepository;
import com.webapp.domain.audit.service.AuditLogService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

  private final AuditLogRepository auditLogRepository;
  private final UserRepository userRepository;

  @Override
  @Transactional(readOnly = true)
  public Page<AuditLogResponse> getAllLogs(Pageable pageable) {
    return auditLogRepository.findAll(pageable)
        .map(this::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AuditLogResponse> getLogsByUserId(Long userId, Pageable pageable) {
    return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
        .map(this::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AuditLogResponse> getLogsByAction(String action, Pageable pageable) {
    return auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable)
        .map(this::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AuditLogResponse> getLogsByEntity(String entityType, Long entityId, Pageable pageable) {
    return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable)
        .map(this::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AuditLogResponse> getLogsByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
    return auditLogRepository.findByDateRange(start, end, pageable)
        .map(this::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Map<String, Long> getActionStatistics(LocalDateTime since) {
    List<Object[]> counts = auditLogRepository.getActionCounts(since);
    Map<String, Long> stats = new LinkedHashMap<>();
    for (Object[] row : counts) {
      stats.put((String) row[0], (Long) row[1]);
    }
    return stats;
  }

  @Override
  @Transactional
  public void logAction(Long userId, String action, String entityType, Long entityId,
      String details, String ipAddress, String userAgent) {
    User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

    AuditLog log = AuditLog.builder()
        .user(user)
        .action(action)
        .entityType(entityType)
        .entityId(entityId)
        .details(details)
        .ipAddress(ipAddress)
        .userAgent(userAgent)
        .build();

    auditLogRepository.save(log);
  }

  @Override
  @Transactional
  public void cleanupOldLogs(int daysToKeep) {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
    auditLogRepository.deleteByCreatedAtBefore(cutoff);
    log.info("Deleted audit logs older than {} days", daysToKeep);
  }

  private AuditLogResponse toResponse(AuditLog log) {
    return AuditLogResponse.builder()
        .id(log.getId())
        .userId(log.getUser() != null ? log.getUser().getId() : null)
        .userName(log.getUser() != null ? log.getUser().getFirstName() + " " + log.getUser().getLastName() : "System")
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
