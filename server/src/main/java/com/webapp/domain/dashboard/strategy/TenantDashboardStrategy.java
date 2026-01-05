package com.webapp.domain.dashboard.strategy;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.webapp.domain.dashboard.dto.DashboardMetric;
import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.dashboard.dto.TenantDashboardStatsProjection;
import com.webapp.domain.dashboard.repository.DashboardRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.RoleName;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TenantDashboardStrategy implements DashboardStrategy {

    private final DashboardRepository dashboardRepository;
    private final com.webapp.domain.messaging.repository.MessageRepository messageRepository;

    @Override
    public RoleName getRole() {
        return RoleName.ROLE_USER; // Maps to "USER" aka Tenant
    }

    /**
     * Aggregates tenant dashboard statistics for a given user
     */
    @Override
    public DashboardStats aggregate(User user) {
        TenantDashboardStatsProjection stats = dashboardRepository.getTenantDashboardStats(user.getId());

        List<DashboardMetric> metrics = new ArrayList<>();

        // 1. Calculate Profile Completion
        int profileCompletion = 0;
        if (user.getFirstName() != null && !user.getFirstName().isEmpty())
            profileCompletion += 10;
        if (user.getLastName() != null && !user.getLastName().isEmpty())
            profileCompletion += 10;
        if (user.getBio() != null && !user.getBio().isEmpty())
            profileCompletion += 20;
        if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty())
            profileCompletion += 20;
        if (user.isPhoneVerified())
            profileCompletion += 20;
        if (user.isEmailVerified())
            profileCompletion += 20;

        // 2. Unread Messages
        int unreadMessages = messageRepository.countUnreadByRecipientId(user.getId());

        // Matches Found
        metrics.add(DashboardMetric.builder()
                .label("Matches Found")
                .value(String.valueOf(stats.getMatchesCount()))
                .type("count")
                .change("+0") // TODO: Implement Match history?
                .trend("neutral")
                .icon("heart")
                .color("rose")
                .build());

        // Applications Sent
        metrics.add(DashboardMetric.builder()
                .label("Applications Sent")
                .value(String.valueOf(stats.getApplicationsSent()))
                .type("count")
                .change("+0")
                .trend("neutral")
                .icon("send")
                .color("blue")
                .build());

        // Upcoming Bookings
        metrics.add(DashboardMetric.builder()
                .label("Upcoming Bookings")
                .value(String.valueOf(stats.getUpcomingBookings()))
                .type("count")
                .change("0%")
                .trend("neutral")
                .icon("calendar")
                .color("emerald")
                .build());

        // Builds dashboard statistics with user role and metrics
        return DashboardStats.builder()
                .userRole(getRole().name())
                .metrics(metrics)
                .profileCompletion(profileCompletion)
                .unreadMessagesCount(unreadMessages)
                .matchesCount(stats.getMatchesCount())
                .applicationsSent(stats.getApplicationsSent())
                .upcomingBookings(stats.getUpcomingBookings())
                .build();
    }
}
