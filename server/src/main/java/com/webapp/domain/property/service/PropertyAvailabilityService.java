package com.webapp.domain.property.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.property.dto.AvailabilityRequest;
import com.webapp.domain.property.dto.AvailabilityResponse;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.entity.PropertyAvailability;
import com.webapp.domain.property.entity.PropertyAvailability.AvailabilityStatus;
import com.webapp.domain.property.repository.PropertyAvailabilityRepository;
import com.webapp.domain.property.repository.PropertyRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyAvailabilityService {

  private final PropertyAvailabilityRepository availabilityRepository;
  private final PropertyRepository propertyRepository;

  /**
   * Check if a property is available for a date range.
   */
  @Transactional(readOnly = true)
  public boolean isAvailable(Long propertyId, LocalDate startDate, LocalDate endDate) {
    return availabilityRepository.isAvailable(propertyId, startDate, endDate);
  }

  /**
   * Get all availability periods for a property.
   */
  @Transactional(readOnly = true)
  public List<AvailabilityResponse> getAvailability(Long propertyId) {
    return availabilityRepository.findByPropertyIdOrderByStartDateAsc(propertyId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  /**
   * Add or update an availability period.
   */
  @Transactional
  public AvailabilityResponse setAvailability(Long propertyId, Long userId, AvailabilityRequest request) {
    Property property = propertyRepository.findById(propertyId)
        .orElseThrow(() -> new IllegalArgumentException("Property not found"));

    // Verify ownership
    if (!property.getOwner().getId().equals(userId)) {
      throw new SecurityException("Not authorized to modify this property");
    }

    // Check for overlapping periods
    List<PropertyAvailability> overlapping = availabilityRepository.findOverlapping(
        propertyId, request.getStartDate(), request.getEndDate());

    if (!overlapping.isEmpty()) {
      // Remove old overlapping periods (simple replacement strategy)
      availabilityRepository.deleteAll(overlapping);
    }

    PropertyAvailability availability = PropertyAvailability.builder()
        .property(property)
        .startDate(request.getStartDate())
        .endDate(request.getEndDate())
        .status(request.getStatus())
        .notes(request.getNotes())
        .build();

    return toResponse(availabilityRepository.save(availability));
  }

  /**
   * Block a period when a booking is confirmed.
   */
  @Transactional
  public void blockForBooking(Long propertyId, LocalDate startDate, LocalDate endDate, String bookingRef) {
    Property property = propertyRepository.findById(propertyId)
        .orElseThrow(() -> new IllegalArgumentException("Property not found"));

    PropertyAvailability availability = PropertyAvailability.builder()
        .property(property)
        .startDate(startDate)
        .endDate(endDate)
        .status(AvailabilityStatus.BOOKED)
        .notes("Booking: " + bookingRef)
        .build();

    availabilityRepository.save(availability);
    log.info("Blocked property {} for booking from {} to {}", propertyId, startDate, endDate);
  }

  /**
   * Delete an availability period.
   */
  @Transactional
  public void deleteAvailability(Long availabilityId, Long userId) {
    PropertyAvailability availability = availabilityRepository.findById(availabilityId)
        .orElseThrow(() -> new IllegalArgumentException("Availability not found"));

    if (!availability.getProperty().getOwner().getId().equals(userId)) {
      throw new SecurityException("Not authorized to modify this property");
    }

    availabilityRepository.delete(availability);
  }

  private AvailabilityResponse toResponse(PropertyAvailability availability) {
    return AvailabilityResponse.builder()
        .id(availability.getId())
        .propertyId(availability.getProperty().getId())
        .startDate(availability.getStartDate())
        .endDate(availability.getEndDate())
        .status(availability.getStatus().name())
        .notes(availability.getNotes())
        .build();
  }
}
