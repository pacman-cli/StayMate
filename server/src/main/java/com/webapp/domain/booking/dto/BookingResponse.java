package com.webapp.domain.booking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.webapp.domain.booking.enums.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;

    private Long tenantId;
    private String tenantName;
    private String tenantProfilePictureUrl;

    private Long landlordId;
    private String landlordName;
    private String landlordProfilePictureUrl;

    private Long propertyId;
    private String propertyTitle;
    private String propertyLocation;
    private String propertyImageUrl;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    private BookingStatus status;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
