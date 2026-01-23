package com.webapp.domain.booking.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.audit.service.AuditService;
import com.webapp.domain.audit.service.AuditService.AuditAction;
import com.webapp.domain.booking.dto.BookingRequest;
import com.webapp.domain.booking.dto.BookingResponse;
import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.booking.enums.BookingStatus;
import com.webapp.domain.booking.mapper.BookingMapper;
import com.webapp.domain.booking.repository.BookingRepository;
import com.webapp.domain.booking.service.BookingService;
import com.webapp.domain.finance.service.FinanceService;
import com.webapp.domain.notification.enums.NotificationType;
import com.webapp.domain.notification.service.NotificationService;
import com.webapp.domain.property.entity.Seat;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.property.service.SeatService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;
import com.webapp.domain.verification.service.VerificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Booking service implementation with atomic seat management.
 *
 * CRITICAL: When a booking is CONFIRMED, a seat is atomically blocked.
 * When a booking is CANCELLED, the seat is released.
 * This prevents overbooking and race conditions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final PropertyRepository propertyRepository;
    private final BookingMapper bookingMapper;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final VerificationService verificationService;
    private final FinanceService financeService;
    private final SeatService seatService;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        // Enforce 100% Verification
        verificationService.validateUserVerification(userId);

        User tenant = userService.getUserById(userId);

        // Find Property
        com.webapp.domain.property.entity.Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        User landlord = property.getOwner();

        if (tenant.getId().equals(landlord.getId())) {
            throw new IllegalArgumentException("You cannot book your own property");
        }

        // Check for overlapping bookings
        boolean hasOverlap = bookingRepository.existsOverlapping(
                property.getId(),
                java.util.List.of(BookingStatus.CONFIRMED),
                request.getStartDate(),
                request.getEndDate());

        if (hasOverlap) {
            throw new IllegalStateException("Property is already booked for these dates");
        }

        // Check if seats are available (pre-check, not authoritative)
        if (!seatService.hasAvailableSeats(property.getId())) {
            throw new IllegalStateException("No seats available for this property");
        }

        // Calculate Financials
        long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days < 1)
            days = 1;

        java.math.BigDecimal pricePerNight = property.getPriceAmount() != null ? property.getPriceAmount()
                : java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalPrice = pricePerNight.multiply(java.math.BigDecimal.valueOf(days));
        java.math.BigDecimal commission = totalPrice.multiply(new java.math.BigDecimal("0.05")); // 5% Platform Fee
        java.math.BigDecimal netAmount = totalPrice.subtract(commission);

        Booking booking = Booking.builder()
                .tenant(tenant)
                .landlord(landlord)
                .property(property)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .commission(commission)
                .netAmount(netAmount)
                // seat is NULL at creation - assigned on approval
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Audit log
        auditService.log(userId, AuditAction.BOOKING_CREATE, "Booking", savedBooking.getId());

        // Notify landlord about new booking request
        notificationService.createNotificationForUser(
                landlord.getId(),
                NotificationType.BOOKING_REQUEST,
                "New Booking Request",
                tenant.getFirstName() + " " + tenant.getLastName() + " wants to book your property: "
                        + property.getTitle(),
                "/dashboard/bookings");

        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return bookingMapper.toResponse(booking);
    }

    /**
     * Update booking status with atomic seat management.
     *
     * CONFIRMED: Block a seat atomically (prevents overbooking)
     * CANCELLED: Release the seat if one was assigned
     * REJECTED: No seat changes (seat was never assigned)
     */
    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long userId, Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        log.info("Updating booking {} status from {} to {} by user {}",
                bookingId, booking.getStatus(), status, userId);

        // Authorization checks
        if (status == BookingStatus.CANCELLED) {
            if (!booking.getTenant().getId().equals(userId) && !booking.getLandlord().getId().equals(userId)) {
                throw new SecurityException("Not authorized to cancel this booking");
            }
        } else if (status == BookingStatus.CONFIRMED || status == BookingStatus.REJECTED) {
            if (!booking.getLandlord().getId().equals(userId)) {
                throw new SecurityException("Only landlord can confirm/reject booking");
            }
        }

        // Handle status-specific logic
        if (status == BookingStatus.CONFIRMED) {
            handleBookingConfirmation(booking);
        } else if (status == BookingStatus.CANCELLED) {
            handleBookingCancellation(booking);
        }

        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);

        // Audit log based on status
        AuditAction action = switch (status) {
            case CONFIRMED -> AuditAction.BOOKING_APPROVE;
            case REJECTED -> AuditAction.BOOKING_REJECT;
            case CANCELLED -> AuditAction.BOOKING_CANCEL;
            default -> AuditAction.ADMIN_ACTION;
        };
        auditService.log(userId, action, "Booking", bookingId);

        // Notify relevant party
        notifyStatusChange(booking, status, userId);

        return bookingMapper.toResponse(savedBooking);
    }

    /**
     * Handle booking confirmation: block seat atomically.
     *
     * CRITICAL TRANSACTION:
     * 1. Acquire pessimistic lock on available seat
     * 2. Set seat status to OCCUPIED
     * 3. Link seat to booking
     * 4. Update property status
     *
     * If no seats available, throws exception and transaction rolls back.
     */
    private void handleBookingConfirmation(Booking booking) {
        log.info("Processing booking confirmation for booking {}", booking.getId());

        // Atomically block a seat (throws if none available)
        Seat seat = seatService.blockSeatForBooking(booking);
        booking.setSeat(seat);

        // Update property status
        com.webapp.domain.property.entity.Property property = booking.getProperty();

        // Only set to RENTED if this was the last available seat
        if (!seatService.hasAvailableSeats(property.getId())) {
            property.setStatus(com.webapp.domain.property.enums.PropertyStatus.RENTED);
            propertyRepository.save(property);
            log.info("Property {} is now fully booked, status set to RENTED", property.getId());
        }

        // Record financial transactions
        financeService.recordEarning(booking);
        financeService.recordPayment(booking);

        log.info("Booking {} confirmed with seat {} (label: {})",
                booking.getId(), seat.getId(), seat.getLabel());
    }

    /**
     * Handle booking cancellation: release seat if assigned.
     */
    private void handleBookingCancellation(Booking booking) {
        log.info("Processing booking cancellation for booking {}", booking.getId());

        Seat seat = booking.getSeat();
        if (seat != null) {
            seatService.releaseSeat(seat);
            booking.setSeat(null);

            // Check if property should be available again
            com.webapp.domain.property.entity.Property property = booking.getProperty();
            if (property.getStatus() == com.webapp.domain.property.enums.PropertyStatus.RENTED) {
                property.setStatus(com.webapp.domain.property.enums.PropertyStatus.APPROVED);
                propertyRepository.save(property);
                log.info("Property {} status restored to APPROVED after seat release", property.getId());
            }

            log.info("Seat released for cancelled booking {}", booking.getId());
        } else {
            log.debug("Booking {} had no seat assigned, nothing to release", booking.getId());
        }
    }

    private void notifyStatusChange(Booking booking, BookingStatus status, Long actorUserId) {
        Long notifyUserId = booking.getTenant().getId().equals(actorUserId)
                ? booking.getLandlord().getId()
                : booking.getTenant().getId();

        String title = "Booking " + status.name();
        String message = "Your booking for " + booking.getProperty().getTitle() + " has been "
                + status.name().toLowerCase();

        notificationService.createNotificationForUser(
                notifyUserId,
                NotificationType.GENERAL,
                title,
                message,
                "/dashboard/bookings");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(Long userId, Pageable pageable) {
        User tenant = userService.getUserById(userId);
        return bookingRepository.findByTenant(tenant, pageable).map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsRequests(Long userId, Pageable pageable) {
        User landlord = userService.getUserById(userId);
        return bookingRepository.findByLandlord(landlord, pageable).map(bookingMapper::toResponse);
    }

    @Override
    @Transactional
    public void deleteBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getTenant().getId().equals(userId) && !booking.getLandlord().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        // Release seat if assigned
        if (booking.getSeat() != null) {
            seatService.releaseSeat(booking.getSeat());
        }

        bookingRepository.delete(booking);

        // Audit log
        auditService.log(userId, AuditAction.BOOKING_CANCEL, "Booking", bookingId);
    }

    @Override
    @Transactional
    public BookingResponse checkIn(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getTenant().getId().equals(userId) && !booking.getLandlord().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Booking must be CONFIRMED to check in");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckInTime(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        auditService.log(userId, AuditAction.BOOKING_APPROVE, "Booking CheckIn", bookingId);

        // Notify other party
        Long notifyUserId = booking.getTenant().getId().equals(userId) ? booking.getLandlord().getId()
                : booking.getTenant().getId();

        notificationService.createNotificationForUser(
                notifyUserId,
                NotificationType.GENERAL,
                "Check-in Confirmed",
                "Booking #" + bookingId + " status updated to CHECKED_IN",
                "/bookings/" + bookingId);

        return bookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse checkOut(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getTenant().getId().equals(userId) && !booking.getLandlord().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("Booking must be CHECKED_IN to check out");
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setCheckOutTime(LocalDateTime.now());

        // Release seat on checkout
        if (booking.getSeat() != null) {
            seatService.releaseSeat(booking.getSeat());
            booking.setSeat(null);

            // Update property availability if needed
            com.webapp.domain.property.entity.Property property = booking.getProperty();
            if (property.getStatus() == com.webapp.domain.property.enums.PropertyStatus.RENTED) {
                property.setStatus(com.webapp.domain.property.enums.PropertyStatus.APPROVED);
                propertyRepository.save(property);
            }
        }

        Booking saved = bookingRepository.save(booking);

        auditService.log(userId, AuditAction.BOOKING_APPROVE, "Booking CheckOut", bookingId);

        // Funds become available
        financeService.markEarningAvailable(booking);

        // Notify other party
        Long notifyUserId = booking.getTenant().getId().equals(userId) ? booking.getLandlord().getId()
                : booking.getTenant().getId();

        notificationService.createNotificationForUser(
                notifyUserId,
                NotificationType.GENERAL,
                "Check-out Confirmed",
                "Booking #" + bookingId + " status updated to CHECKED_OUT",
                "/bookings/" + bookingId);

        return bookingMapper.toResponse(saved);
    }
}
