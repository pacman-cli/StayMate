package com.webapp.domain.property.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.property.dto.SeatDto;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.entity.Seat;
import com.webapp.domain.property.enums.SeatStatus;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.property.repository.SeatRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/properties/{propertyId}/seats")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Seats", description = "Property seat/bed management")
public class SeatController {

  private final SeatRepository seatRepository;
  private final PropertyRepository propertyRepository;
  private final UserRepository userRepository;

  @GetMapping
  @Operation(summary = "Get all seats for a property")
  public ResponseEntity<List<SeatDto>> getSeats(@PathVariable Long propertyId) {
    List<Seat> seats = seatRepository.findByPropertyId(propertyId);
    List<SeatDto> dtos = seats.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  @Operation(summary = "Add a seat to a property")
  public ResponseEntity<SeatDto> addSeat(
      @PathVariable Long propertyId,
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody SeatDto request) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Property property = propertyRepository.findById(propertyId)
        .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

    if (!property.getOwner().getId().equals(user.getId())) {
      throw new SecurityException("Not authorized to modify this property");
    }

    Seat seat = Seat.builder()
        .property(property)
        .label(request.getLabel())
        .status(request.getStatus() != null ? request.getStatus() : SeatStatus.AVAILABLE)
        .build();

    Seat saved = seatRepository.save(seat);
    log.info("Added seat {} to property {}", saved.getId(), propertyId);

    return ResponseEntity.ok(toDto(saved));
  }

  @PatchMapping("/{seatId}/status")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  @Operation(summary = "Update seat status")
  public ResponseEntity<SeatDto> updateSeatStatus(
      @PathVariable Long propertyId,
      @PathVariable Long seatId,
      @RequestParam SeatStatus status,
      @AuthenticationPrincipal UserDetails userDetails) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Seat seat = seatRepository.findById(seatId)
        .orElseThrow(() -> new ResourceNotFoundException("Seat not found"));

    if (!seat.getProperty().getId().equals(propertyId)) {
      throw new IllegalArgumentException("Seat does not belong to this property");
    }

    if (!seat.getProperty().getOwner().getId().equals(user.getId())) {
      throw new SecurityException("Not authorized to modify this seat");
    }

    seat.setStatus(status);
    Seat updated = seatRepository.save(seat);
    log.info("Updated seat {} status to {}", seatId, status);

    return ResponseEntity.ok(toDto(updated));
  }

  private SeatDto toDto(Seat seat) {
    return SeatDto.builder()
        .id(seat.getId())
        .propertyId(seat.getProperty().getId())
        .label(seat.getLabel())
        .status(seat.getStatus())
        .lastVacatedAt(seat.getLastVacatedAt())
        .build();
  }
}
