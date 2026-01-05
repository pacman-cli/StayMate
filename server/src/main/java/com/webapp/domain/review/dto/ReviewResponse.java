package com.webapp.domain.review.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
  private Long id;
  private Long authorId;
  private String authorName;
  private String authorAvatar;
  private Long receiverId;
  private Long propertyId;
  private Integer rating;
  private String comment;
  private LocalDateTime createdAt;
}
