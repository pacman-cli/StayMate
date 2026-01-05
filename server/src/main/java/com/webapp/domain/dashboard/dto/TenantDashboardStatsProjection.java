package com.webapp.domain.dashboard.dto;

public interface TenantDashboardStatsProjection {
    long getMatchesCount();

    long getApplicationsSent();

    long getUpcomingBookings();
}
