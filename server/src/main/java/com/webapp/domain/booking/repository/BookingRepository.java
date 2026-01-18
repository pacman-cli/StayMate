package com.webapp.domain.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.booking.enums.BookingStatus;
import com.webapp.domain.user.entity.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

        @EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByTenant(User tenant, Pageable pageable);

        @EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByLandlord(User landlord, Pageable pageable);

        @EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByTenantAndStatus(User tenant, BookingStatus status, Pageable pageable);

        @EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByLandlordAndStatus(User landlord, BookingStatus status, Pageable pageable);

        @Query("SELECT COUNT(b) FROM Booking b WHERE b.tenant.id = :tenantId AND b.status = :status")
        long countByTenantIdAndStatus(
                        @Param("tenantId") Long tenantId,
                        @Param("status") BookingStatus status);

        @Query("SELECT COUNT(b) FROM Booking b WHERE b.landlord.id = :landlordId AND b.status = :status")
        long countByLandlordIdAndStatus(
                        @Param("landlordId") Long landlordId,
                        @Param("status") BookingStatus status);

        @Query("SELECT COUNT(b) FROM Booking b WHERE b.tenant.id = :tenantId AND b.startDate > CURRENT_DATE AND b.status = com.webapp.domain.booking.enums.BookingStatus.CONFIRMED")
        long countUpcomingByTenantId(@Param("tenantId") Long tenantId);

        @Modifying
        @Query("DELETE FROM Booking b WHERE b.tenant.id = :userId OR b.landlord.id = :userId")
        void deleteByUserId(@Param("userId") Long userId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        List<Booking> findAllByTenantIdOrLandlordId(Long tenantId, Long landlordId);

        @Query("SELECT COUNT(b) FROM Booking b WHERE b.landlord.id = :landlordId AND b.status = :status AND b.createdAt < :date")
        long countByLandlordIdAndStatusAndCreatedAtBefore(@Param("landlordId") Long landlordId,
                        @Param("status") BookingStatus status, @Param("date") LocalDateTime date);

        @EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        List<Booking> findTop5ByLandlordIdOrderByCreatedAtDesc(Long landlordId);

        @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.tenant LEFT JOIN FETCH b.landlord ORDER BY b.createdAt DESC")
        List<Booking> findRecentBookings(Pageable pageable);

        @Query("SELECT new com.webapp.domain.admin.dto.RevenuePoint(b.startDate, SUM(p.priceAmount), CAST(COUNT(b) AS int)) "
                        +
                        "FROM Booking b JOIN b.property p " +
                        "WHERE b.status IN (com.webapp.domain.booking.enums.BookingStatus.CONFIRMED, com.webapp.domain.booking.enums.BookingStatus.COMPLETED) "
                        +
                        "GROUP BY b.startDate " +
                        "ORDER BY b.startDate ASC")
        List<com.webapp.domain.admin.dto.RevenuePoint> getRevenueStats();

        // Revenue Calculation: Sum of (days * price) for CONFIRMED bookings
        // Assuming price is per month/day? Context implies monthly usually for rentals,
        // but let's assume the price is per stay or handle logic in Service if complex.
        // For MVP: Sum of Property PriceAmount for all CONFIRMED bookings might be
        // safer if "Price" = "Monthly Rent" and bookings are leased.
        // However, for typical Airbnb style: DATEDIFF * PricePerNight.
        // Let's go with: Sum of priceAmount of properties for confirmed bookings
        // (assuming priceAmount = total booking value or monthly rent).
        // Actually, looking at Property.java: priceAmount is BigDecimal. Booking is
        // date range.
        // Let's implement a simpler PROXY for revenue: Count Confirmed Bookings *
        // Average Booking Value (or just Sum Property Price).
        // Better: Select SUM(p.priceAmount) from Booking b join b.property p where
        // b.status = 'CONFIRMED'

        @Query("SELECT SUM(p.priceAmount) FROM Booking b JOIN b.property p WHERE b.status = 'CONFIRMED'")
        java.math.BigDecimal sumTotalRevenue();

        @Query("SELECT SUM(p.priceAmount) FROM Booking b JOIN b.property p WHERE b.status = 'CONFIRMED' AND b.createdAt >= :startDate")
        java.math.BigDecimal sumRevenueSince(@Param("startDate") LocalDateTime startDate);

        @Query("SELECT FUNCTION('MONTH', b.createdAt) as month, SUM(p.priceAmount) as revenue FROM Booking b JOIN b.property p WHERE b.status = 'CONFIRMED' AND b.createdAt >= :startDate GROUP BY FUNCTION('MONTH', b.createdAt) ORDER BY month")
        List<Object[]> getMonthlyRevenue(@Param("startDate") LocalDateTime startDate);

        @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.property.id = :propertyId AND b.status IN :statuses AND b.startDate < :endDate AND b.endDate > :startDate")
        boolean existsOverlapping(@Param("propertyId") Long propertyId, @Param("statuses") List<BookingStatus> statuses,
                        @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

        @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.tenant LEFT JOIN FETCH b.property WHERE b.landlord.id = :landlordId AND b.status = 'PENDING' ORDER BY b.createdAt DESC")
        List<Booking> findIncomingRequests(@Param("landlordId") Long landlordId, Pageable pageable);

        long countByStatus(BookingStatus status);

        @Query("SELECT b FROM Booking b WHERE b.property.id = :propertyId AND b.status = 'CONFIRMED' AND b.startDate <= CURRENT_DATE AND b.endDate >= CURRENT_DATE")
        List<Booking> findActiveBookingsByPropertyId(@Param("propertyId") Long propertyId);

        @Query("SELECT b FROM Booking b WHERE b.landlord.id = :landlordId AND b.status = 'CONFIRMED' AND b.startDate <= CURRENT_DATE AND b.endDate >= CURRENT_DATE")
        List<Booking> findActiveBookingsByLandlordId(@Param("landlordId") Long landlordId);

        @Query("SELECT COUNT(DISTINCT b.property.id) FROM Booking b WHERE b.status = 'CONFIRMED' AND b.startDate <= CURRENT_DATE AND b.endDate >= CURRENT_DATE")
        long countOccupiedProperties();

        // Financial Analytics Queries

        @Query("SELECT SUM(b.refundAmount) FROM Booking b WHERE b.refundAmount IS NOT NULL")
        java.math.BigDecimal sumTotalRefunds();

        @Query("SELECT b.paymentMethod, COUNT(b) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED') AND b.paymentMethod IS NOT NULL GROUP BY b.paymentMethod")
        List<Object[]> countByPaymentMethod();

        @Query("SELECT SUM(p.priceAmount) FROM Booking b JOIN b.property p WHERE b.status IN ('CONFIRMED', 'COMPLETED') AND b.createdAt BETWEEN :startDate AND :endDate")
        java.math.BigDecimal sumRevenueBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT COUNT(b) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED') AND b.createdAt BETWEEN :startDate AND :endDate")
        long countBookingsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.property WHERE b.tenant.id = :tenantId AND b.status = com.webapp.domain.booking.enums.BookingStatus.CONFIRMED AND b.endDate >= CURRENT_DATE")
        List<Booking> findActiveBookingsByTenantId(@Param("tenantId") Long tenantId);
}
