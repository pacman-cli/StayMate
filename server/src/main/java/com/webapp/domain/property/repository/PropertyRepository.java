package com.webapp.domain.property.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.enums.PropertyStatus;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        List<Property> findAllByOwnerId(Long ownerId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        Page<Property> findAllByOwnerIdNot(Long userId, Pageable pageable);

        long countByOwnerId(Long ownerId);

        long countByOwnerIdAndCreatedAtBefore(Long ownerId, LocalDateTime date);

        long countByOwnerIdAndStatus(Long ownerId, PropertyStatus status);

        long countByStatus(PropertyStatus status);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        List<Property> findByStatus(PropertyStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT p.location, COUNT(p) FROM Property p GROUP BY p.location ORDER BY COUNT(p) DESC")
        List<Object[]> findTopLocations(Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT p FROM Property p LEFT JOIN FETCH p.owner WHERE " +
                        "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
                        "(:minPrice IS NULL OR p.priceAmount >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.priceAmount <= :maxPrice) AND " +
                        "(:minBeds IS NULL OR p.beds >= :minBeds) AND " +
                        "(:minBaths IS NULL OR p.baths >= :minBaths) AND " +
                        "(:propertyType IS NULL OR CAST(p.propertyType as string) = :propertyType) AND "
                        +
                        "p.status IN :statuses")
        List<Property> searchProperties(
                        @org.springframework.data.repository.query.Param("location") String location,
                        @org.springframework.data.repository.query.Param("minPrice") BigDecimal minPrice,
                        @org.springframework.data.repository.query.Param("maxPrice") BigDecimal maxPrice,
                        @org.springframework.data.repository.query.Param("minBeds") Integer minBeds,
                        @org.springframework.data.repository.query.Param("minBaths") Integer minBaths,
                        @org.springframework.data.repository.query.Param("propertyType") String propertyType,
                        @org.springframework.data.repository.query.Param("statuses") List<PropertyStatus> statuses);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.priceAmount) FROM Property p WHERE p.owner.id = :ownerId AND p.status = 'RENTED'")
        BigDecimal sumRevenueByOwnerId(@org.springframework.data.repository.query.Param("ownerId") Long ownerId);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.views) FROM Property p WHERE p.owner.id = :ownerId")
        Long sumViewsByOwnerId(@org.springframework.data.repository.query.Param("ownerId") Long ownerId);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.inquiries) FROM Property p WHERE p.owner.id = :ownerId")
        Long sumInquiriesByOwnerId(@org.springframework.data.repository.query.Param("ownerId") Long ownerId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Property p WHERE p.verified = true")
        long countVerifiedProperties();

        // Simplified seat occupancy: properties rented / total properties?
        // Or if we assume 'beds' are seats.
        // Let's do: (Sum of beds in Rented properties / Sum of beds in All properties)
        // * 100
        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.beds) FROM Property p WHERE p.status = 'RENTED'")
        Long sumRentedBeds();

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        List<Property> findTop5ByOwnerIdOrderByCreatedAtDesc(Long ownerId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        List<Property> findTop5ByStatusOrderByPriceAmountAsc(PropertyStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.beds) FROM Property p")
        Long sumTotalBeds();

        @org.springframework.data.jpa.repository.Query("SELECT p.propertyType, COUNT(p) FROM Property p GROUP BY p.propertyType")
        List<Object[]> countPropertiesByType();

        @org.springframework.data.jpa.repository.Query("SELECT p.location, COUNT(b.id), " +
                        "(SELECT COUNT(p2) FROM Property p2 WHERE p2.location = p.location) " +
                        "FROM Property p LEFT JOIN Booking b ON p.id = b.property.id AND b.status = 'CONFIRMED' " +
                        "GROUP BY p.location")
        List<Object[]> findOccupancyByLocation();

        long countByEmergencyAvailableTrue();

        List<Property> findByEmergencyAvailableTrueAndStatus(PropertyStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT p.status, COUNT(p) FROM Property p GROUP BY p.status")
        List<Object[]> countByStatusGrouped();

        @org.springframework.data.jpa.repository.Query("SELECT p.owner.id, COUNT(p) FROM Property p GROUP BY p.owner.id, p.title HAVING COUNT(p) > 1")
        List<Object[]> findDuplicateTitles();

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.beds) FROM Property p WHERE p.owner.id = :ownerId")
        Long sumBedsByOwnerId(@org.springframework.data.repository.query.Param("ownerId") Long ownerId);
}
