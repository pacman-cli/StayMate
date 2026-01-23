package com.webapp.domain.property.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.property.dto.AvailabilityRequest;
import com.webapp.domain.property.dto.AvailabilityResponse;
import com.webapp.domain.property.service.PropertyAvailabilityService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/properties/{propertyId}/availability")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Property Availability", description = "Property availability calendar management")
public class PropertyAvailabilityController {

  private final PropertyAvailabilityService availabilityService;
  private final UserRepository userRepository;

  @GetMapping
  @Operation(summary = "Get availability calendar for a property")
  public ResponseEntity<List<AvailabilityResponse>> getAvailability(
      @PathVariable Long propertyId) {
    return ResponseEntity.ok(availabilityService.getAvailability(propertyId));
  }

  @GetMapping("/check")
  @Operation(summary = "Check if property is available for date range")
  public ResponseEntity<Map<String, Object>> checkAvailability(
      @PathVariable Long propertyId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

    boolean available = availabilityService.isAvailable(propertyId, startDate, endDate);
    return ResponseEntity.ok(Map.of(
        "propertyId", propertyId,
        "startDate", startDate.toString(),
        "endDate", endDate.toString(),
        "available", available));
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  @Operation(summary = "Set availability for a property (owners only)")
  public ResponseEntity<AvailabilityResponse> setAvailability(
      @PathVariable Long propertyId,
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody AvailabilityRequest request) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    AvailabilityResponse response = availabilityService.setAvailability(propertyId, user.getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @DeleteMapping("/{availabilityId}")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  @Operation(summary = "Delete an availability period")
  public ResponseEntity<Void> deleteAvailability(
      @PathVariable Long propertyId,
      @PathVariable Long availabilityId,
      @AuthenticationPrincipal UserDetails userDetails) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    availabilityService.deleteAvailability(availabilityId, user.getId());
    return ResponseEntity.noContent().build();
  }
}
