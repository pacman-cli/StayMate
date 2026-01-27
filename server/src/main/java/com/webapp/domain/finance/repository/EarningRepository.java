package com.webapp.domain.finance.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.webapp.domain.finance.entity.Earning;
import com.webapp.domain.finance.enums.EarningStatus;

@Repository
public interface EarningRepository extends JpaRepository<Earning, Long> {
        Page<Earning> findByUserId(Long userId, Pageable pageable);

        Optional<Earning> findByBooking(com.webapp.domain.booking.entity.Booking booking);

        List<Earning> findByUserIdAndStatus(Long userId, EarningStatus status);

        @Query("SELECT SUM(e.netAmount) FROM Earning e WHERE e.user.id = :userId AND e.status = :status")
        BigDecimal sumNetAmountByUserIdAndStatus(Long userId, EarningStatus status);

        @Query("SELECT SUM(e.netAmount) FROM Earning e WHERE e.user.id = :userId")
        BigDecimal sumTotalEarningsByUserId(Long userId);

        List<Earning> findByPayoutRequestId(Long payoutRequestId);

        // Admin summary queries
        @Query("SELECT SUM(e.amount) FROM Earning e")
        BigDecimal sumTotalAmount();

        @Query("SELECT SUM(e.commission) FROM Earning e")
        BigDecimal sumTotalCommission();

        @Query("SELECT SUM(e.netAmount) FROM Earning e")
        BigDecimal sumTotalNetAmount();

        @Query("SELECT e FROM Earning e WHERE e.user.id = :userId " +
                        "AND (:startDate IS NULL OR e.createdAt >= :startDate) " +
                        "AND (:endDate IS NULL OR e.createdAt <= :endDate) " +
                        "AND (:status IS NULL OR e.status = :status)")
        Page<Earning> findByUserIdWithFilters(Long userId, java.time.LocalDateTime startDate,
                        java.time.LocalDateTime endDate, com.webapp.domain.finance.enums.EarningStatus status,
                        Pageable pageable);

        // Admin summary queries with date filters
        @Query("SELECT SUM(e.amount) FROM Earning e WHERE " +
                        "(:startDate IS NULL OR e.createdAt >= :startDate) AND " +
                        "(:endDate IS NULL OR e.createdAt <= :endDate)")
        BigDecimal sumTotalAmount(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

        @Query("SELECT SUM(e.commission) FROM Earning e WHERE " +
                        "(:startDate IS NULL OR e.createdAt >= :startDate) AND " +
                        "(:endDate IS NULL OR e.createdAt <= :endDate)")
        BigDecimal sumTotalCommission(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

        @Query("SELECT SUM(e.netAmount) FROM Earning e WHERE " +
                        "(:startDate IS NULL OR e.createdAt >= :startDate) AND " +
                        "(:endDate IS NULL OR e.createdAt <= :endDate)")
        BigDecimal sumTotalNetAmount(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

        @Query("SELECT e FROM Earning e WHERE " +
                        "(:startDate IS NULL OR e.createdAt >= :startDate) AND " +
                        "(:endDate IS NULL OR e.createdAt <= :endDate)")
        List<Earning> findAllByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
