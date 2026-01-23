package com.webapp.domain.property.dto;

import java.time.LocalDateTime;

import com.webapp.domain.property.enums.SeatStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {
  private Long id;
  private Long propertyId;
  private String label;
  private SeatStatus status;
  private boolean isOccupiedByBooking;
  private LocalDateTime lastVacatedAt;
}
