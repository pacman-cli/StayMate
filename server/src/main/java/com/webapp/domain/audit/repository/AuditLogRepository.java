package com.webapp.domain.audit.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.audit.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

  Page<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

  Page<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
      String entityType, Long entityId, Pageable pageable);

  @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :start AND :end ORDER BY a.createdAt DESC")
  Page<AuditLog> findByDateRange(
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable);

  @Query("SELECT a.action, COUNT(a) FROM AuditLog a " +
      "WHERE a.createdAt >= :since GROUP BY a.action ORDER BY COUNT(a) DESC")
  List<Object[]> getActionCounts(@Param("since") LocalDateTime since);

  void deleteByCreatedAtBefore(LocalDateTime before);
}
