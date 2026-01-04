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
import com.webapp.domain.notification.enums.NotificationType;
import com.webapp.domain.notification.service.NotificationService;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final PropertyRepository propertyRepository;
    private final BookingMapper bookingMapper;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User tenant = userService.getUserById(userId);

        // Find Property
        com.webapp.domain.property.entity.Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        User landlord = property.getOwner();

        if (tenant.getId().equals(landlord.getId())) {
            throw new IllegalArgumentException("You cannot book your own property");
        }

        Booking booking = Booking.builder()
                .tenant(tenant)
                .landlord(landlord)
                .property(property)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Audit log
        auditService.log(userId, AuditAction.BOOKING_CREATE, "Booking", savedBooking.getId());

        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long userId, Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Similar logic: Landlord accepts/rejects, Tenant cancels
        if (status == BookingStatus.CANCELLED) {
            if (!booking.getTenant().getId().equals(userId) && !booking.getLandlord().getId().equals(userId)) {
                throw new SecurityException("Not authorized to cancel this booking");
            }
        } else if (status == BookingStatus.CONFIRMED || status == BookingStatus.REJECTED) {
            if (!booking.getLandlord().getId().equals(userId)) {
                throw new SecurityException("Only landlord can confirm/reject booking");
            }
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

        return bookingMapper.toResponse(savedBooking);
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

        Booking saved = bookingRepository.save(booking);

        auditService.log(userId, AuditAction.BOOKING_APPROVE, "Booking CheckOut", bookingId);

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
