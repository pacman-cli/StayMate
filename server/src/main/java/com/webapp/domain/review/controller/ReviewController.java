package com.webapp.domain.review.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.review.dto.ReviewRequest;
import com.webapp.domain.review.dto.ReviewResponse;
import com.webapp.domain.review.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  @PostMapping
  public ResponseEntity<ReviewResponse> createReview(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @Valid @RequestBody ReviewRequest request) {
    return ResponseEntity.ok(reviewService.createReview(userPrincipal.getId(), request));
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<Page<ReviewResponse>> getReviewsForUser(
      @PathVariable Long userId,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(reviewService.getReviewsForUser(userId, pageable));
  }

  @GetMapping("/property/{propertyId}")
  public ResponseEntity<Page<ReviewResponse>> getReviewsForProperty(
      @PathVariable Long propertyId,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(reviewService.getReviewsForProperty(propertyId, pageable));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteReview(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable Long id) {
    reviewService.deleteReview(userPrincipal.getId(), id);
    return ResponseEntity.noContent().build();
  }
}
