package com.webapp.domain.property.service;

import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.property.entity.Seat;

/**
 * Service for managing seat allocation and availability.
 *
 * This service handles the critical business logic of seat blocking
 * during booking approval, ensuring atomicity and preventing overbooking.
 */
public interface SeatService {

  /**
   * Atomically block an available seat for a booking.
   *
   * This method:
   * 1. Acquires a PESSIMISTIC_WRITE lock on available seats
   * 2. Selects the first available seat
   * 3. Changes its status to OCCUPIED
   * 4. Links it to the booking
   *
   * @param booking The booking to assign a seat to
   * @return The allocated seat
   * @throws IllegalStateException if no seats are available
   */
  Seat blockSeatForBooking(Booking booking);

  /**
   * Release a seat when a booking is cancelled or checked out.
   *
   * @param seat The seat to release
   */
  void releaseSeat(Seat seat);

  /**
   * Get count of available seats for a property.
   *
   * @param propertyId The property ID
   * @return Number of available seats
   */
  long getAvailableSeatCount(Long propertyId);

  /**
   * Check if a property has at least one available seat.
   *
   * @param propertyId The property ID
   * @return true if at least one seat is available
   */
  boolean hasAvailableSeats(Long propertyId);
}
