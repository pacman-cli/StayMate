package com.webapp.domain.review.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.review.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

  // Landlord Dashboard specific
  List<Review> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.receiver.id = :userId")
  Double getAverageRatingByReceiverId(@Param("userId") Long userId);

  List<Review> findByPropertyIdIn(List<Long> propertyIds);

  // Legacy/Existing methods
  @Query("SELECT r FROM Review r WHERE r.receiver.id = :userId")
  Page<Review> findByReceiverId(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT r FROM Review r WHERE r.property.id = :propertyId")
  Page<Review> findByPropertyId(@Param("propertyId") Long propertyId, Pageable pageable);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.receiver.id = :userId")
  Double getAverageRatingForUser(@Param("userId") Long userId);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.property.id = :propertyId")
  Double getAverageRatingForProperty(@Param("propertyId") Long propertyId);

  @Query("SELECT AVG(r.rating) FROM Review r")
  Double getAverageRating();

  long countByPropertyId(@Param("propertyId") Long propertyId);
}
