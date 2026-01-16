package com.webapp.domain.admin.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.admin.dto.AdminDashboardStatDto;
import com.webapp.domain.admin.dto.FraudEventDto;
import com.webapp.domain.admin.dto.UserAcquisitionPoint;
import com.webapp.domain.admin.dto.VerificationStats;
import com.webapp.domain.admin.entity.FraudEvent;
import com.webapp.domain.admin.repository.FraudEventRepository;
import com.webapp.domain.admin.service.AdminService;
import com.webapp.domain.booking.enums.BookingStatus;
import com.webapp.domain.property.enums.PropertyStatus;
import com.webapp.domain.property.enums.SeatStatus;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.enums.RoleName;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.verification.entity.VerificationRequest.VerificationStatus;
import com.webapp.domain.verification.repository.VerificationRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

  private final VerificationRequestRepository verificationRequestRepository;
  private final PropertyRepository propertyRepository;
  private final UserRepository userRepository;
  private final FraudEventRepository fraudEventRepository;
  private final com.webapp.domain.booking.repository.BookingRepository bookingRepository;
  private final com.webapp.domain.property.repository.SeatRepository seatRepository;
  private final com.webapp.domain.audit.repository.AuditLogRepository auditLogRepository;
  private final com.webapp.domain.maintenance.repository.MaintenanceRequestRepository maintenanceRequestRepository;

  @Override
  @Transactional(readOnly = true)
  public AdminDashboardStatDto getDashboardStats() {
    // 1. Verification Stats
    long pendingIdentity = verificationRequestRepository.countByStatus(VerificationStatus.PENDING);
    long pendingProperties = propertyRepository.countByStatus(PropertyStatus.PENDING);

    // Calculate Occupancy Rate
    long totalSeats = seatRepository.count();
    long occupiedSeats = seatRepository.countByStatus(SeatStatus.OCCUPIED);
    double occupancyRate = totalSeats > 0 ? (double) occupiedSeats / totalSeats * 100 : 0.0;

    // Additional Metrics
    long totalUsers = userRepository.count();
    long totalHouseOwners = userRepository.countByRole(RoleName.ROLE_HOUSE_OWNER);
    long totalRegularUsers = userRepository.countByRole(RoleName.ROLE_USER);
    long totalAdmins = userRepository.countByRole(RoleName.ROLE_ADMIN);
    long totalListings = propertyRepository.count();
    long verifiedListings = propertyRepository.countByStatus(PropertyStatus.ACTIVE); // Assuming Active means
                                                                                     // Verified/Approved here
    // for now

    // Booking Metrics
    long totalBookings = bookingRepository.count();
    long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
    long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

    // Other Metrics
    long openMaintenance = maintenanceRequestRepository.countByStatusIn(
        List.of(com.webapp.domain.maintenance.entity.MaintenanceRequest.Status.OPEN,
            com.webapp.domain.maintenance.entity.MaintenanceRequest.Status.IN_PROGRESS,
            com.webapp.domain.maintenance.entity.MaintenanceRequest.Status.ON_HOLD));
    // Simple count for today's logs
    long todayAuditLogs = auditLogRepository.count();
    // DAU approximation
    long activeUsers = userRepository.countByLastLoginAtAfter(java.time.LocalDateTime.now().minusHours(24));

    VerificationStats verificationStats = VerificationStats.builder()
        .pendingIdentity(pendingIdentity)
        .pendingProperty(pendingProperties)
        .build();

    // 2. Listing Stats
    List<Object[]> statusCounts = propertyRepository.countByStatusGrouped();
    Map<String, Long> listingStats = new HashMap<>();
    for (Object[] row : statusCounts) {
      String status = (row[0] != null) ? row[0].toString() : "Unknown";
      Long count = (Long) row[1];
      listingStats.put(status, count);
    }

    // 3. User Acquisition
    List<Object[]> userStats = userRepository.getUserAcquisitionStats();
    List<UserAcquisitionPoint> userAcquisition = new ArrayList<>();
    for (Object[] row : userStats) {
      // row[0] is Date, row[1] is RoleName (Enum), row[2] is Count
      userAcquisition.add(UserAcquisitionPoint.builder()
          .date(row[0].toString())
          .role(row[1].toString())
          .count((Long) row[2])
          .build());
    }

    // 4. Recent Fraud Events
    List<FraudEvent> events = fraudEventRepository.findAllByOrderByCreatedAtDesc();
    List<FraudEventDto> fraudEvents = events.stream()
        .limit(50)
        .map(this::mapToFraudDto)
        .collect(Collectors.toList());

    return AdminDashboardStatDto.builder()
        .verificationStats(verificationStats)
        .listingStats(listingStats)
        .userAcquisition(userAcquisition)
        .recentFraudEvents(fraudEvents)
        // New Fields
        .totalUsers(totalUsers)
        .totalHouseOwners(totalHouseOwners)
        .totalRegularUsers(totalRegularUsers)
        .totalAdmins(totalAdmins)
        .totalListings(totalListings)
        .verifiedListingsCount(verifiedListings)
        .pendingVerificationsCount(pendingIdentity)
        .seatOccupancyRate(occupancyRate)
        .activeUsers(activeUsers)
        .totalBookings(totalBookings)
        .confirmedBookings(confirmedBookings)
        .cancelledBookings(cancelledBookings)
        .openMaintenanceRequests(openMaintenance)
        .todayAuditLogs(todayAuditLogs)
        // Emergency & Safety
        .totalEmergencyRoomsAvailable(propertyRepository.countByEmergencyAvailableTrue())
        .bannedUsersCount(userRepository.countByAccountStatus(com.webapp.domain.user.enums.AccountStatus.BANNED))
        .recentFraudAlerts(fraudEvents) // Reuse the fraud events list already calculated
        .build();
  }

  private FraudEventDto mapToFraudDto(FraudEvent event) {
    return FraudEventDto.builder()
        .id(event.getId())
        .userId(event.getUser().getId())
        .userName(event.getUser().getFullName())
        .type(event.getType())
        .severity(event.getSeverity())
        .metadata(event.getMetadata())
        .createdAt(event.getCreatedAt())
        .build();
  }
}
