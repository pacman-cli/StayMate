package com.webapp.domain.property.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
  private Long id;
  private Long propertyId;
  private LocalDate startDate;
  private LocalDate endDate;
  private String status;
  private String notes;
}
