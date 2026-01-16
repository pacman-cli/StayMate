package com.webapp.domain.admin.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.admin.dto.AnalyticsDashboardData;
import com.webapp.domain.admin.dto.RevenuePoint;
import com.webapp.domain.admin.dto.UserAcquisitionPoint;
import com.webapp.domain.admin.service.AdminAnalyticsService;
import com.webapp.domain.booking.repository.BookingRepository;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

  private final UserRepository userRepository;
  private final BookingRepository bookingRepository;
  private final PropertyRepository propertyRepository;

  @Override
  @Transactional(readOnly = true)
  public List<UserAcquisitionPoint> getUserGrowthStats() {
    return userRepository.getUserGrowthStats();
  }

  @Override
  @Transactional(readOnly = true)
  public List<RevenuePoint> getRevenueStats() {
    return bookingRepository.getRevenueStats();
  }

  @Override
  @Transactional(readOnly = true)
  public com.webapp.domain.admin.dto.FinancialOverviewDTO getFinancialOverview() {
    // 1. Calculate Net Revenue (Total Revenue - Total Refunds)
    List<RevenuePoint> revenuePoints = getRevenueStats();
    BigDecimal totalGrossRevenue = revenuePoints.stream()
        .map(RevenuePoint::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalRefunds = bookingRepository.sumTotalRefunds();
    if (totalRefunds == null)
      totalRefunds = BigDecimal.ZERO;

    BigDecimal netRevenue = totalGrossRevenue.subtract(totalRefunds);

    // 2. Avg Booking Value
    long totalBookings = revenuePoints.stream().mapToInt(RevenuePoint::getTransactionCount).sum();
    BigDecimal avgBookingValue = totalBookings > 0
        ? totalGrossRevenue.divide(BigDecimal.valueOf(totalBookings), 2, java.math.RoundingMode.HALF_UP)
        : BigDecimal.ZERO;

    // 3. Payment Method Distribution
    List<Object[]> methodCounts = bookingRepository.countByPaymentMethod();
    java.util.Map<String, Double> paymentDistribution = new java.util.HashMap<>();

    long totalPaidBookings = methodCounts.stream().mapToLong(row -> (Long) row[1]).sum();

    for (Object[] row : methodCounts) {
      String method = (String) row[0];
      Long count = (Long) row[1];
      double percentage = totalPaidBookings > 0 ? (count * 100.0) / totalPaidBookings : 0.0;
      // Round to 1 decimal place
      percentage = Math.round(percentage * 10.0) / 10.0;
      paymentDistribution.put(method, percentage);
    }

    // 4. Month-over-Month Logic
    java.time.LocalDateTime now = java.time.LocalDateTime.now();
    java.time.LocalDateTime startCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
    java.time.LocalDateTime startLastMonth = startCurrentMonth.minusMonths(1);

    // Revenue for current month vs last month
    BigDecimal currentMonthRev = bookingRepository.sumRevenueBetween(startCurrentMonth, now);
    BigDecimal lastMonthRev = bookingRepository.sumRevenueBetween(startLastMonth, startCurrentMonth); // Entire last
                                                                                                      // month roughly

    if (currentMonthRev == null)
      currentMonthRev = BigDecimal.ZERO;
    if (lastMonthRev == null)
      lastMonthRev = BigDecimal.ZERO;

    Double revenueChange = 0.0;
    if (lastMonthRev.compareTo(BigDecimal.ZERO) > 0) {
      revenueChange = currentMonthRev.subtract(lastMonthRev)
          .divide(lastMonthRev, 4, java.math.RoundingMode.HALF_UP)
          .multiply(BigDecimal.valueOf(100))
          .doubleValue();
    } else if (currentMonthRev.compareTo(BigDecimal.ZERO) > 0) {
      revenueChange = 100.0; // 0 to something is 100% growth effectively
    }

    // Avg Value Change
    long currentMonthBookings = bookingRepository.countBookingsBetween(startCurrentMonth, now);
    long lastMonthBookings = bookingRepository.countBookingsBetween(startLastMonth, startCurrentMonth);

    BigDecimal currentAvg = currentMonthBookings > 0
        ? currentMonthRev.divide(BigDecimal.valueOf(currentMonthBookings), 2, java.math.RoundingMode.HALF_UP)
        : BigDecimal.ZERO;
    BigDecimal lastAvg = lastMonthBookings > 0
        ? lastMonthRev.divide(BigDecimal.valueOf(lastMonthBookings), 2, java.math.RoundingMode.HALF_UP)
        : BigDecimal.ZERO;

    Double avgChange = 0.0;
    if (lastAvg.compareTo(BigDecimal.ZERO) > 0) {
      avgChange = currentAvg.subtract(lastAvg)
          .divide(lastAvg, 4, java.math.RoundingMode.HALF_UP)
          .multiply(BigDecimal.valueOf(100))
          .doubleValue();
    }

    return com.webapp.domain.admin.dto.FinancialOverviewDTO.builder()
        .netRevenue(netRevenue)
        .totalRefunds(totalRefunds)
        .avgBookingValue(avgBookingValue)
        .paymentMethodDistribution(paymentDistribution)
        .revenueChangePercentage(revenueChange)
        .avgValueChangePercentage(avgChange)
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public AnalyticsDashboardData getDashboardData() {
    List<UserAcquisitionPoint> userGrowth = getUserGrowthStats();
    List<RevenuePoint> revenueTrends = getRevenueStats();

    // Calculate totals
    Long totalRevenueLong = revenueTrends.stream()
        .map(RevenuePoint::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add)
        .longValue();

    Long activeListings = propertyRepository.count();

    // Mock occupancy for now or calculate if property occupancy logic exists
    long activeListingsCount = propertyRepository.countByStatus(com.webapp.domain.property.enums.PropertyStatus.ACTIVE);
    long occupiedProperties = bookingRepository.countOccupiedProperties();

    Double occupancyRate = activeListingsCount > 0
        ? (double) occupiedProperties / activeListingsCount
        : 0.0;

    return AnalyticsDashboardData.builder()
        .userGrowth(userGrowth)
        .revenueTrends(revenueTrends)
        .dailyRevenue(revenueTrends) // Reusing same list for now
        .totalRevenue(totalRevenueLong)
        .activeListings(activeListings)
        .occupancyRate(occupancyRate)
        .build();
  }
}
