package com.webapp.domain.property.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.property.entity.PropertyAvailability;
import com.webapp.domain.property.entity.PropertyAvailability.AvailabilityStatus;

@Repository
public interface PropertyAvailabilityRepository extends JpaRepository<PropertyAvailability, Long> {

  List<PropertyAvailability> findByPropertyIdOrderByStartDateAsc(Long propertyId);

  List<PropertyAvailability> findByPropertyIdAndStatus(Long propertyId, AvailabilityStatus status);

  @Query("SELECT pa FROM PropertyAvailability pa WHERE pa.property.id = :propertyId " +
      "AND pa.startDate <= :endDate AND pa.endDate >= :startDate")
  List<PropertyAvailability> findOverlapping(
      @Param("propertyId") Long propertyId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query("SELECT CASE WHEN COUNT(pa) = 0 THEN true ELSE false END " +
      "FROM PropertyAvailability pa WHERE pa.property.id = :propertyId " +
      "AND pa.status IN ('BOOKED', 'BLOCKED', 'MAINTENANCE') " +
      "AND pa.startDate <= :endDate AND pa.endDate >= :startDate")
  boolean isAvailable(
      @Param("propertyId") Long propertyId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  void deleteByPropertyId(Long propertyId);
}
