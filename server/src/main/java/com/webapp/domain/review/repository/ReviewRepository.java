package com.webapp.domain.review.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webapp.domain.review.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

  @Query("SELECT r FROM Review r WHERE r.receiver.id = :userId")
  Page<Review> findByReceiverId(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT r FROM Review r WHERE r.property.id = :propertyId")
  Page<Review> findByPropertyId(@Param("propertyId") Long propertyId, Pageable pageable);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.receiver.id = :userId")
  Double getAverageRatingForUser(@Param("userId") Long userId);

  @Query("SELECT COUNT(r) FROM Review r WHERE r.receiver.id = :userId")
  Long countReviewsForUser(@Param("userId") Long userId);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.property.id = :propertyId")
  Double getAverageRatingForProperty(@Param("propertyId") Long propertyId);

  @Query("SELECT COUNT(r) FROM Review r WHERE r.property.id = :propertyId")
  Long countReviewsForProperty(@Param("propertyId") Long propertyId);

  @Query("SELECT AVG(r.rating) FROM Review r")
  Double getAverageRating();

  // Check if user has already reviewed this booking/property interaction if logic
  // requires
  // boolean existsByAuthorAndProperty(User author, Property property);
}
