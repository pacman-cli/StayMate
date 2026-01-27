package com.webapp.domain.dashboard.strategy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.webapp.domain.booking.enums.BookingStatus;
import com.webapp.domain.booking.repository.BookingRepository;
import com.webapp.domain.dashboard.dto.DashboardMetric;
import com.webapp.domain.dashboard.dto.DashboardStats;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.RoleName;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LandlordDashboardStrategy implements DashboardStrategy {

        private final BookingRepository bookingRepository;
        private final com.webapp.domain.property.repository.PropertyRepository propertyRepository;
        private final com.webapp.domain.booking.mapper.BookingMapper bookingMapper;

        @Override
        public RoleName getRole() {
                return RoleName.ROLE_HOUSE_OWNER;
        }

        @Override
        public DashboardStats aggregate(User user) {
                List<DashboardMetric> metrics = new ArrayList<>();

                LocalDateTime lastMonth = LocalDateTime.now().minusDays(30);

                // 1. Total Properties
                long totalProperties = propertyRepository.countByOwnerId(user.getId());
                long totalPropertiesBefore = propertyRepository.countByOwnerIdAndCreatedAtBefore(user.getId(),
                                lastMonth);
                metrics.add(
                                createMetric("Total Properties", totalProperties, totalPropertiesBefore, "building",
                                                "blue"));

                // 2. Active Bookings
                long activeBookings = bookingRepository.countByLandlordIdAndStatus(
                                user.getId(),
                                BookingStatus.CONFIRMED);
                long activeBookingsBefore = bookingRepository.countByLandlordIdAndStatusAndCreatedAtBefore(user.getId(),
                                BookingStatus.CONFIRMED, lastMonth);
                metrics.add(createMetric("Active Bookings", activeBookings, activeBookingsBefore, "calendar",
                                "emerald"));

                // 3. Pending Requests
                long pendingRequests = bookingRepository.countByLandlordIdAndStatus(user.getId(),
                                BookingStatus.PENDING);
                long pendingRequestsBefore = bookingRepository.countByLandlordIdAndStatusAndCreatedAtBefore(
                                user.getId(), BookingStatus.PENDING, lastMonth);
                metrics.add(createMetric("Pending Bookings", pendingRequests, pendingRequestsBefore, "clock", "amber"));

                // 4. Completed Bookings
                long completedBookings = bookingRepository.countByLandlordIdAndStatus(user.getId(),
                                BookingStatus.COMPLETED);
                long completedBookingsBefore = bookingRepository.countByLandlordIdAndStatusAndCreatedAtBefore(
                                user.getId(), BookingStatus.COMPLETED, lastMonth);
                metrics.add(createMetric("Completed Bookings", completedBookings, completedBookingsBefore,
                                "check-circle", "purple"));

                // 5. Occupancy Rate (Active Bookings / Total Properties)
                double occupancyRate = totalProperties > 0 ? ((double) activeBookings / totalProperties) * 100 : 0;
                metrics.add(DashboardMetric.builder()
                                .label("Occupancy Rate")
                                .value(String.format("%.1f%%", occupancyRate))
                                .type("percent")
                                .change("+0%") // Historical occupancy not tracked yet
                                .trend("neutral")
                                .icon("activity")
                                .color("rose")
                                .build());

                // 6. Property Status Breakdown
                java.util.Map<String, Long> propertyStatusStats = new java.util.HashMap<>();
                propertyStatusStats.put("Active", propertyRepository.countByOwnerIdAndStatus(user.getId(),
                                com.webapp.domain.property.enums.PropertyStatus.ACTIVE));
                propertyStatusStats.put("Pending", propertyRepository.countByOwnerIdAndStatus(user.getId(),
                                com.webapp.domain.property.enums.PropertyStatus.PENDING));
                propertyStatusStats.put("Rented", propertyRepository.countByOwnerIdAndStatus(user.getId(),
                                com.webapp.domain.property.enums.PropertyStatus.RENTED));

                // 7. Recent Bookings
                List<com.webapp.domain.booking.entity.Booking> recentBookingsEntities = bookingRepository
                                .findTop5ByLandlordIdOrderByCreatedAtDesc(user.getId());
                List<com.webapp.domain.booking.dto.BookingResponse> recentBookings = recentBookingsEntities.stream()
                                .map(bookingMapper::toResponse)
                                .collect(java.util.stream.Collectors.toList());

                // Builds dashboard summary with user role and metrics
                return DashboardStats.builder()
                                .userRole(getRole().name())
                                .metrics(metrics)
                                .totalProperties(totalProperties)
                                .activeBookings(activeBookings)
                                .pendingBookings(pendingRequests)
                                .completedBookings(completedBookings)
                                .recentBookings(recentBookings)
                                .propertyStatusStats(propertyStatusStats)
                                .build();
        }

        /**
         * Creates dashboard metric with trend and percentage change
         */
        private DashboardMetric createMetric(String label, long current, long previous, String icon, String color) {
                long change = current - previous;
                String trend = change >= 0 ? "up" : "down";
                if (change == 0)
                        trend = "neutral";

                String changeStr;
                if (previous == 0) {
                        changeStr = change > 0 ? "+100%" : "0%";
                } else {
                        long percent = (change * 100) / previous;
                        changeStr = (percent > 0 ? "+" : "") + percent + "%";
                }

                // Builds metric with formatted change and trend
                return DashboardMetric.builder()
                                .label(label)
                                .value(String.valueOf(current))
                                .type("count")
                                .change(changeStr)
                                .trend(trend)
                                .icon(icon)
                                .color(color)
                                .build();
        }
}
