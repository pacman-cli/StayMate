package com.webapp.domain.property.dto;

import java.time.LocalDate;

import com.webapp.domain.property.entity.PropertyAvailability.AvailabilityStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityRequest {
  @NotNull
  private LocalDate startDate;

  @NotNull
  private LocalDate endDate;

  @NotNull
  private AvailabilityStatus status;

  private String notes;
}
