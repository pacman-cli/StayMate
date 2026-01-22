package com.webapp.domain.booking.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.booking.dto.BookingRequest;
import com.webapp.domain.booking.dto.BookingResponse;
import com.webapp.domain.booking.enums.BookingStatus;
import com.webapp.domain.booking.service.BookingService;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingController Tests")
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private UserPrincipal userPrincipal;

    @InjectMocks
    private BookingController bookingController;

    private BookingResponse testBookingResponse;

    @BeforeEach
    void setUp() {
        when(userPrincipal.getId()).thenReturn(1L);

        // Builds sample booking response for testing
        testBookingResponse = BookingResponse.builder()
                .id(1L)
                .tenantId(1L)
                .landlordId(2L)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Verifies booking creation returns expected response
     */
    @Test
    @DisplayName("Should create booking successfully")
    void shouldCreateBookingSuccessfully() {
        BookingRequest request = new BookingRequest();
        when(bookingService.createBooking(eq(1L), any(BookingRequest.class)))
                .thenReturn(testBookingResponse);

        ResponseEntity<BookingResponse> response = bookingController.createBooking(userPrincipal, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        verify(bookingService).createBooking(eq(1L), any(BookingRequest.class));
    }

    /**
     * Verifies retrieval of bookings returns expected page
     */
    @Test
    @DisplayName("Should get my bookings")
    void shouldGetMyBookings() {
        Page<BookingResponse> mockPage = new PageImpl<>(List.of(testBookingResponse));
        when(bookingService.getMyBookings(eq(1L), any())).thenReturn(mockPage);

        ResponseEntity<Page<BookingResponse>> response = bookingController.getMyBookings(userPrincipal,
                PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // Verifies landlord can retrieve booking requests
        assertEquals(1, response.getBody().getTotalElements());
    }

    /**
     * Verifies landlord can retrieve booking requests
     */
    @Test
    @DisplayName("Should get booking requests for landlord")
    void shouldGetBookingRequests() {
        Page<BookingResponse> mockPage = new PageImpl<>(List.of(testBookingResponse));
        when(bookingService.getBookingsRequests(eq(1L), any())).thenReturn(mockPage);

        ResponseEntity<Page<BookingResponse>> response = bookingController.getBookingRequests(userPrincipal,
                PageRequest.of(0, 20));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    /**
     * Updates booking status and verifies service interaction
     */
    @Test
    @DisplayName("Should update booking status")
    void shouldUpdateBookingStatus() {
        when(bookingService.updateBookingStatus(1L, 1L, BookingStatus.CONFIRMED))
                .thenReturn(testBookingResponse);

        ResponseEntity<BookingResponse> response = bookingController.updateStatus(userPrincipal, 1L,
                BookingStatus.CONFIRMED);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(bookingService).updateBookingStatus(1L, 1L, BookingStatus.CONFIRMED);
    }

    /**
     * Deletes booking and verifies service interaction
     */
    @Test
    @DisplayName("Should delete booking")
    void shouldDeleteBooking() {
        doNothing().when(bookingService).deleteBooking(1L, 1L);

        ResponseEntity<Void> response = bookingController.deleteBooking(userPrincipal, 1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(bookingService).deleteBooking(1L, 1L);
    }
}
