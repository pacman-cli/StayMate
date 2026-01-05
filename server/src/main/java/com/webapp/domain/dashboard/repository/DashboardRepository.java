package com.webapp.domain.dashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.webapp.domain.dashboard.dto.TenantDashboardStatsProjection;
import com.webapp.domain.user.entity.User;

@Repository
public interface DashboardRepository extends JpaRepository<User, Long> {

        @Query(value = """
                        SELECT
                            (SELECT COUNT(*) FROM matches m WHERE m.user1_id = :userId OR m.user2_id = :userId) as matchesCount,
                            (SELECT COUNT(*) FROM applications a WHERE a.sender_id = :userId) as applicationsSent,
                            (SELECT COUNT(*) FROM bookings b WHERE (b.tenant_id = :userId) AND b.status IN ('CONFIRMED', 'PENDING') AND b.start_date >= CURRENT_DATE) as upcomingBookings
                        """, nativeQuery = true)
        TenantDashboardStatsProjection getTenantDashboardStats(@Param("userId") Long userId);
}
