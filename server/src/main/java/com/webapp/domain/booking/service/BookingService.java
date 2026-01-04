package com.webapp.domain.booking.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.webapp.domain.booking.dto.BookingRequest;
import com.webapp.domain.booking.dto.BookingResponse;
import com.webapp.domain.booking.enums.BookingStatus;

public interface BookingService {

    BookingResponse createBooking(Long userId, BookingRequest request);

    BookingResponse getBookingById(Long bookingId);

    BookingResponse updateBookingStatus(Long userId, Long bookingId, BookingStatus status);

    Page<BookingResponse> getMyBookings(Long userId, Pageable pageable); // As Tenant

    Page<BookingResponse> getBookingsRequests(Long userId, Pageable pageable); // As Landlord

    void deleteBooking(Long userId, Long bookingId);

    BookingResponse checkIn(Long userId, Long bookingId);

    BookingResponse checkOut(Long userId, Long bookingId);
}
