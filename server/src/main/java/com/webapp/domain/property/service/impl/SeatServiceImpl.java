package com.webapp.domain.property.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.property.entity.Seat;
import com.webapp.domain.property.enums.SeatStatus;
import com.webapp.domain.property.repository.SeatRepository;
import com.webapp.domain.property.service.SeatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of SeatService with transactional seat management.
 *
 * CRITICAL: This service ensures atomic seat allocation to prevent overbooking.
 * Uses PESSIMISTIC_WRITE locking to handle concurrent booking approvals safely.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeatServiceImpl implements SeatService {

  private final SeatRepository seatRepository;

  /**
   * Block an available seat for a booking atomically.
   *
   * Transaction Flow:
   * 1. Query for AVAILABLE seat with PESSIMISTIC_WRITE lock
   * 2. If found, update status to OCCUPIED
   * 3. Return the seat (to be linked to booking)
   *
   * The pessimistic lock prevents race conditions by blocking other transactions
   * from selecting the same seat until this transaction completes.
   *
   * @param booking The booking requesting a seat
   * @return The allocated seat
   * @throws IllegalStateException if no seats are available
   */
  @Override
  @Transactional(propagation = Propagation.MANDATORY)
  public Seat blockSeatForBooking(Booking booking) {
    Long propertyId = booking.getProperty().getId();

    log.info("Attempting to block seat for booking {} on property {}",
        booking.getId(), propertyId);

    // Find first available seat with pessimistic lock
    // This query locks the row, preventing concurrent approvals from selecting it
    Seat seat = seatRepository.findFirstByPropertyIdAndStatusWithLock(
        propertyId, SeatStatus.AVAILABLE)
        .orElseThrow(() -> {
          log.warn("No available seats for property {} - booking {} cannot be approved",
              propertyId, booking.getId());
          return new IllegalStateException(
              "No seats available for this property. Cannot approve booking.");
        });

    // Update seat status to OCCUPIED
    seat.setStatus(SeatStatus.OCCUPIED);
    seat.setUpdatedAt(LocalDateTime.now());
    Seat savedSeat = seatRepository.save(seat);

    log.info("Successfully blocked seat {} (label: {}) for booking {} on property {}",
        savedSeat.getId(), savedSeat.getLabel(), booking.getId(), propertyId);

    return savedSeat;
  }

  /**
   * Release a seat when booking is cancelled or completed.
   *
   * @param seat The seat to release
   */
  @Override
  @Transactional(propagation = Propagation.MANDATORY)
  public void releaseSeat(Seat seat) {
    if (seat == null) {
      log.debug("Attempted to release null seat - ignoring");
      return;
    }

    log.info("Releasing seat {} (label: {}) from property {}",
        seat.getId(), seat.getLabel(), seat.getProperty().getId());

    seat.setStatus(SeatStatus.AVAILABLE);
    seat.setLastVacatedAt(LocalDateTime.now());
    seatRepository.save(seat);

    log.info("Seat {} released and now AVAILABLE", seat.getId());
  }

  /**
   * Get count of available seats for a property.
   */
  @Override
  @Transactional(readOnly = true)
  public long getAvailableSeatCount(Long propertyId) {
    return seatRepository.countByPropertyIdAndStatus(propertyId, SeatStatus.AVAILABLE);
  }

  /**
   * Check if property has at least one available seat.
   */
  @Override
  @Transactional(readOnly = true)
  public boolean hasAvailableSeats(Long propertyId) {
    return getAvailableSeatCount(propertyId) > 0;
  }
}
