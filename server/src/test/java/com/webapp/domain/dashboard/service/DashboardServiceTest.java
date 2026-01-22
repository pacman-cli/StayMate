package com.webapp.domain.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;

import com.webapp.domain.ai.service.MatchingService;
import com.webapp.domain.audit.repository.AuditLogRepository;
import com.webapp.domain.booking.repository.BookingRepository;
import com.webapp.domain.dashboard.dto.AdminDashboardDTO;
import com.webapp.domain.dashboard.dto.LandlordDashboardDTO;
import com.webapp.domain.dashboard.dto.UserDashboardDTO;
import com.webapp.domain.dashboard.repository.ExpenseRepository;
import com.webapp.domain.dashboard.service.impl.DashboardServiceImpl;
import com.webapp.domain.dashboard.strategy.DashboardStrategy;
import com.webapp.domain.maintenance.repository.MaintenanceRequestRepository;
import com.webapp.domain.messaging.repository.MessageRepository;
import com.webapp.domain.property.enums.PropertyStatus;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.report.repository.ReportRepository;
import com.webapp.domain.roommate.RoommatePostRepository;
import com.webapp.domain.saved.repository.SavedPropertyRepository;
import com.webapp.domain.saved.repository.SavedRoommateRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.RoleName;
import com.webapp.domain.user.mapper.UserMapper;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.verification.repository.VerificationRequestRepository;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

  @Mock
  private MessageRepository messageRepository;
  @Mock
  private UserRepository userRepository;
  @Mock
  private PropertyRepository propertyRepository;
  @Mock
  private BookingRepository bookingRepository;
  @Mock
  private ReportRepository reportRepository;
  @Mock
  private MaintenanceRequestRepository maintenanceRequestRepository;
  @Mock
  private AuditLogRepository auditLogRepository;
  @Mock
  private SavedPropertyRepository savedPropertyRepository;
  @Mock
  private SavedRoommateRepository savedRoommateRepository;
  @Mock
  private RoommatePostRepository roommatePostRepository;
  @Mock
  private MatchingService matchingService;
  @Mock
  private VerificationRequestRepository verificationRequestRepository;
  @Mock
  private ExpenseRepository expenseRepository;
  @Mock
  private UserMapper userMapper;
  @Mock
  private List<DashboardStrategy> strategies;

  @InjectMocks
  private DashboardServiceImpl dashboardService;

  private User user;

  @BeforeEach
  void setUp() {
    user = new User();
    user.setId(1L);
    user.setEmail("test@example.com");
    dashboardService.init(); // Init strategy map
  }

  @Mock
  private com.webapp.domain.notification.repository.NotificationRepository notificationRepository;

  @Test
  void getUserDashboard_ShouldReturnPopulatedDTO() {
    // Arrange
    when(bookingRepository.countUpcomingByTenantId(1L)).thenReturn(2L);
    when(notificationRepository.countUnreadByUserId(1L)).thenReturn(5);
    when(propertyRepository.searchProperties(any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(Collections.emptyList());
    when(savedPropertyRepository.countByUserId(1L)).thenReturn(10L);
    when(expenseRepository.findByPayerId(1L)).thenReturn(Collections.emptyList());
    when(propertyRepository.findByEmergencyAvailableTrueAndStatus(PropertyStatus.ACTIVE))
        .thenReturn(Collections.emptyList());

    // Act
    UserDashboardDTO result = dashboardService.getUserDashboard(user);

    // Assert
    assertNotNull(result);
    assertEquals(2L, result.getUpcomingVisitsCount());
    assertEquals(5L, result.getUnreadNotificationsCount());
    assertEquals(10L, result.getSavedItemsCount());
    assertNotNull(result.getVerificationProgress());
    assertNotNull(result.getFinanceStats());
  }

  @Test
  void getLandlordDashboard_ShouldCalculateOccupancy() {
    // Arrange
    when(propertyRepository.countByOwnerIdAndStatus(1L, PropertyStatus.ACTIVE)).thenReturn(5L);
    when(propertyRepository.countByOwnerId(1L)).thenReturn(10L);
    when(propertyRepository.sumRevenueByOwnerId(1L)).thenReturn(BigDecimal.valueOf(5000));
    when(bookingRepository.countByLandlordIdAndStatus(eq(1L), any())).thenReturn(8L); // Active/Confirmed
    when(bookingRepository.findIncomingRequests(eq(1L), any())).thenReturn(Collections.emptyList());
    when(propertyRepository.findTop5ByOwnerIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());

    // Act
    LandlordDashboardDTO result = dashboardService.getLandlordDashboard(user);

    // Assert
    assertNotNull(result);
    assertEquals(5L, result.getActivePropertiesCount());
    assertEquals(BigDecimal.valueOf(5000), result.getTotalRevenue());
    // Occupancy = 8 confirmed / 10 total = 80%
    assertEquals(80.0, result.getOccupancyRate(), 0.1);
  }

  @Test
  void getAdminDashboard_ShouldReturnStats() {
    // Arrange
    when(userRepository.countNonAdminUsersByRoleAndStatus(eq(RoleName.ROLE_USER), any())).thenReturn(100L);
    when(userRepository.countNonAdminUsersByRoleAndStatus(eq(RoleName.ROLE_HOUSE_OWNER), any())).thenReturn(20L);
    when(reportRepository.findRecentRiskyReports(any())).thenReturn(Page.empty());
    when(propertyRepository.countPropertiesByType()).thenReturn(Collections.emptyList());
    when(propertyRepository.findOccupancyByLocation()).thenReturn(Collections.emptyList());
    when(userRepository.findTop5ByEmailVerifiedFalse()).thenReturn(Collections.emptyList());

    // Act
    AdminDashboardDTO result = dashboardService.getAdminDashboard(user);

    // Assert
    assertNotNull(result);
    assertEquals(100L, result.getTotalUsers());
    assertEquals(20L, result.getTotalLandlords());
    assertNotNull(result.getPendingVerificationUsers());
  }
}
