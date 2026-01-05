package com.webapp.domain.review.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.webapp.domain.review.dto.ReviewRequest;
import com.webapp.domain.review.dto.ReviewResponse;

public interface ReviewService {

  ReviewResponse createReview(Long authorId, ReviewRequest request);

  Page<ReviewResponse> getReviewsForUser(Long userId, Pageable pageable);

  Page<ReviewResponse> getReviewsForProperty(Long propertyId, Pageable pageable);

  // Aggregations
  Double getAverageRatingForUser(Long userId);

  Double getAverageRatingForProperty(Long propertyId);

  void deleteReview(Long userId, Long reviewId);
}
