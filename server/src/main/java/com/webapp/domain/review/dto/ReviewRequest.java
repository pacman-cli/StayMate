package com.webapp.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
  private Long propertyId; // Optional property link
  private Long receiverId; // Required if review is about a user
  private Integer rating;
  private String comment;
}
