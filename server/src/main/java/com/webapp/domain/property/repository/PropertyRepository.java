package com.webapp.domain.property.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.domain.property.entity.Property;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        List<Property> findAllByOwnerId(Long ownerId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        Page<Property> findAllByOwnerIdNot(Long userId, Pageable pageable);

        long countByOwnerId(Long ownerId);

        long countByOwnerIdAndCreatedAtBefore(Long ownerId, LocalDateTime date);

        long countByOwnerIdAndStatus(Long ownerId, String status);

        long countByStatus(String status);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "owner" })
        List<Property> findByStatus(String status);

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
                        "p.status = 'Active'")
        List<Property> searchProperties(String location, BigDecimal minPrice, BigDecimal maxPrice, Integer minBeds,
                        Integer minBaths, String propertyType);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.priceAmount) FROM Property p WHERE p.owner.id = :ownerId AND p.status = 'Rented'")
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
        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.beds) FROM Property p WHERE p.status = 'Rented'")
        Long sumRentedBeds();

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.beds) FROM Property p")
        Long sumTotalBeds();
}
