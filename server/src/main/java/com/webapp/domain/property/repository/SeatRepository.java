package com.webapp.domain.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.property.entity.Seat;
import com.webapp.domain.property.enums.SeatStatus;

import jakarta.persistence.LockModeType;

/**
 * Repository for Seat entity with concurrency-safe operations.
 */
@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByPropertyId(Long propertyId);

    void deleteByPropertyId(Long propertyId);

    long countByStatus(SeatStatus status);

    /**
     * Count available seats for a property.
     */
    long countByPropertyIdAndStatus(Long propertyId, SeatStatus status);

    /**
     * Find first available seat with PESSIMISTIC_WRITE lock.
     * This prevents race conditions during concurrent booking approvals.
     * The lock is held until the transaction commits/rollbacks.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.property.id = :propertyId AND s.status = :status ORDER BY s.id ASC")
    Optional<Seat> findFirstByPropertyIdAndStatusWithLock(
            @Param("propertyId") Long propertyId,
            @Param("status") SeatStatus status);

    /**
     * Bulk update seat status - used for releasing seats.
     */
    @Modifying
    @Query("UPDATE Seat s SET s.status = :newStatus, s.lastVacatedAt = CURRENT_TIMESTAMP WHERE s.id = :seatId")
    int updateSeatStatus(@Param("seatId") Long seatId, @Param("newStatus") SeatStatus newStatus);
}
