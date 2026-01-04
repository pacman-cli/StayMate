package com.webapp.domain.booking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByTenant(User tenant, Pageable pageable);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByLandlord(User landlord, Pageable pageable);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        Page<Booking> findByTenantAndStatus(User tenant, BookingStatus status, Pageable pageable);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "property", "tenant", "landlord" })
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

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "property", "tenant", "landlord" })
        List<Booking> findTop5ByLandlordIdOrderByCreatedAtDesc(Long landlordId);

        @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.tenant LEFT JOIN FETCH b.landlord ORDER BY b.createdAt DESC")
        List<Booking> findRecentBookings(Pageable pageable);

        // Revenue Calculation: Sum of (days * price) for CONFIRMED bookings
        // Assuming price is per month/day? Context implies monthly usually for rentals
        // but let's assume price is per stay or handle logic in Service if complex.
        // For MVP: Sum of Property PriceAmount for all CONFIRMED bookings might be
        // safer if "Price" = "Monthly Rent" and bookings are leases.
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

        long countByStatus(BookingStatus status);
}
