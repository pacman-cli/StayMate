package com.webapp.domain.finance.repository;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.webapp.domain.finance.entity.PayoutRequest;
import com.webapp.domain.finance.enums.PayoutStatus;

@Repository
public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {
  Page<PayoutRequest> findByUserId(Long userId, Pageable pageable);

  Page<PayoutRequest> findByStatus(PayoutStatus status, Pageable pageable);

  // Admin summary queries
  @Query("SELECT SUM(p.amount) FROM PayoutRequest p WHERE p.status = :status")
  BigDecimal sumAmountByStatus(PayoutStatus status);

  @Query("SELECT SUM(p.amount) FROM PayoutRequest p WHERE p.status = :status " +
      "AND (:startDate IS NULL OR p.createdAt >= :startDate) " +
      "AND (:endDate IS NULL OR p.createdAt <= :endDate)")
  BigDecimal sumAmountByStatusAndCreatedAtBetween(PayoutStatus status, java.time.LocalDateTime startDate,
      java.time.LocalDateTime endDate);

  @Query("SELECT SUM(p.amount) FROM PayoutRequest p WHERE p.status = :status " +
      "AND (:startDate IS NULL OR p.processedAt >= :startDate) " +
      "AND (:endDate IS NULL OR p.processedAt <= :endDate)")
  BigDecimal sumAmountByStatusAndProcessedAtBetween(PayoutStatus status, java.time.LocalDateTime startDate,
      java.time.LocalDateTime endDate);

  long countByStatus(PayoutStatus status);

  @Query("SELECT COUNT(p) FROM PayoutRequest p WHERE p.status = :status " +
      "AND (:startDate IS NULL OR p.createdAt >= :startDate) " +
      "AND (:endDate IS NULL OR p.createdAt <= :endDate)")
  long countByStatusAndCreatedAtBetween(PayoutStatus status, java.time.LocalDateTime startDate,
      java.time.LocalDateTime endDate);
}
