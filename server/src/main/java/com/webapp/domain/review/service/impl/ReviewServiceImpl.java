package com.webapp.domain.review.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.review.dto.ReviewRequest;
import com.webapp.domain.review.dto.ReviewResponse;
import com.webapp.domain.review.entity.Review;
import com.webapp.domain.review.repository.ReviewRepository;
import com.webapp.domain.review.service.ReviewService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final PropertyRepository propertyRepository;

  @Override
  @Transactional
  public ReviewResponse createReview(Long authorId, ReviewRequest request) {
    User author = userRepository.findById(authorId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    if (request.getRating() < 1 || request.getRating() > 5) {
      throw new IllegalArgumentException("Rating must be between 1 and 5");
    }

    User receiver = null;
    if (request.getReceiverId() != null) {
      receiver = userRepository.findById(request.getReceiverId())
          .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
    }

    Property property = null;
    if (request.getPropertyId() != null) {
      property = propertyRepository.findById(request.getPropertyId())
          .orElseThrow(() -> new IllegalArgumentException("Property not found"));
      // If receiver not explicit, assume property owner
      if (receiver == null) {
        receiver = property.getOwner();
      }
    }

    if (receiver == null) {
      throw new IllegalArgumentException("Review must target a user or property");
    }

    // Prevent self-review
    if (author.getId().equals(receiver.getId())) {
      throw new IllegalArgumentException("You cannot review yourself");
    }

    Review review = Review.builder()
        .author(author)
        .receiver(receiver)
        .property(property)
        .rating(request.getRating())
        .comment(request.getComment())
        .build();

    Review saved = java.util.Objects.requireNonNull(reviewRepository.save(review));
    return mapToResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ReviewResponse> getReviewsForUser(Long userId, Pageable pageable) {
    return reviewRepository.findByReceiverId(userId, pageable).map(this::mapToResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ReviewResponse> getReviewsForProperty(Long propertyId, Pageable pageable) {
    return reviewRepository.findByPropertyId(propertyId, pageable).map(this::mapToResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Double getAverageRatingForUser(Long userId) {
    Double avg = reviewRepository.getAverageRatingForUser(userId);
    return avg != null ? avg : 0.0;
  }

  @Override
  @Transactional(readOnly = true)
  public Double getAverageRatingForProperty(Long propertyId) {
    Double avg = reviewRepository.getAverageRatingForProperty(propertyId);
    return avg != null ? avg : 0.0;
  }

  @Override
  @Transactional
  public void deleteReview(Long userId, Long reviewId) {
    Review review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new IllegalArgumentException("Review not found"));

    if (!review.getAuthor().getId().equals(userId)) {
      throw new SecurityException("Not authorized to delete this review");
    }

    reviewRepository.delete(review);
  }

  private ReviewResponse mapToResponse(Review review) {
    return ReviewResponse.builder()
        .id(review.getId())
        .authorId(review.getAuthor().getId())
        .authorName(review.getAuthor().getFirstName() + " " + review.getAuthor().getLastName())
        // .authorAvatar(review.getAuthor().getProfilePicture()) // Assuming this field
        // exists or similar
        .receiverId(review.getReceiver().getId())
        .propertyId(review.getProperty() != null ? review.getProperty().getId() : null)
        .rating(review.getRating())
        .comment(review.getComment())
        .createdAt(review.getCreatedAt())
        .build();
  }
}
