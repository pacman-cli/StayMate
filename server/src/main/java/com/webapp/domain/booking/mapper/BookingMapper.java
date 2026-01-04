package com.webapp.domain.booking.mapper;

import org.springframework.stereotype.Component;

import com.webapp.domain.booking.dto.BookingResponse;
import com.webapp.domain.booking.entity.Booking;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
        return BookingResponse.builder()
                .id(booking.getId())
                .tenantId(booking.getTenant().getId())
                .tenantName(booking.getTenant().getFullName())
                .tenantProfilePictureUrl(booking.getTenant().getProfilePictureUrl())
                .landlordId(booking.getLandlord().getId())
                .landlordName(booking.getLandlord().getFullName())
                .landlordProfilePictureUrl(booking.getLandlord().getProfilePictureUrl())
                .propertyId(booking.getProperty() != null ? booking.getProperty().getId() : null)
                .propertyTitle(booking.getProperty() != null ? booking.getProperty().getTitle() : null)
                .propertyLocation(booking.getProperty() != null ? booking.getProperty().getLocation() : null)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .checkInTime(booking.getCheckInTime())
                .checkOutTime(booking.getCheckOutTime())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
