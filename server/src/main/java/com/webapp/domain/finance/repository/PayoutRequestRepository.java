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

  long countByStatus(PayoutStatus status);
}
