package com.webapp.domain.landlord.dto;

import java.util.List;

import com.webapp.domain.property.dto.SeatDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PropertySeatSummaryDto {
  private Long id;
  private String title;
  private String address;
  private int totalBeds;
  private int occupiedBeds;
  private int availableBeds;
  private List<SeatDto> seats;
  private String imageUrl;
  private String status; // "Vacant" or "Booked"
  private List<com.webapp.domain.review.dto.ReviewResponse> reviews;
}
