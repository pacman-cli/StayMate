package com.webapp.domain.finance.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.finance.dto.EarningDto;
import com.webapp.domain.finance.dto.EarningsSummaryResponse;
import com.webapp.domain.finance.dto.PaymentDto;
import com.webapp.domain.finance.dto.PayoutMethodDto;
import com.webapp.domain.finance.dto.PayoutMethodRequest;
import com.webapp.domain.finance.entity.Earning;
import com.webapp.domain.finance.entity.Payment;
import com.webapp.domain.finance.entity.PayoutMethod;
import com.webapp.domain.finance.entity.PayoutRequest;
import com.webapp.domain.finance.enums.EarningStatus;
import com.webapp.domain.finance.enums.PaymentStatus;
import com.webapp.domain.finance.enums.PayoutStatus;
import com.webapp.domain.finance.repository.EarningRepository;
import com.webapp.domain.finance.repository.PaymentRepository;
import com.webapp.domain.finance.repository.PayoutMethodRepository;
import com.webapp.domain.finance.repository.PayoutRequestRepository;
import com.webapp.domain.finance.service.FinanceService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

  private final EarningRepository earningRepository;
  private final PaymentRepository paymentRepository;
  private final PayoutMethodRepository payoutMethodRepository;
  private final PayoutRequestRepository payoutRequestRepository;
  private final UserService userService;

  @Override
  @Transactional
  public void recordEarning(Booking booking) {
    if (earningRepository.findByBooking(booking).isPresent()) {
      return; // Already recorded
    }

    BigDecimal amount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
    BigDecimal commission = booking.getCommission() != null ? booking.getCommission() : BigDecimal.ZERO;
    BigDecimal netAmount = booking.getNetAmount() != null ? booking.getNetAmount() : BigDecimal.ZERO;

    if (netAmount.compareTo(BigDecimal.ZERO) <= 0) {
      // Log warning?
      return;
    }

    Earning earning = Earning.builder()
        .user(booking.getLandlord())
        .booking(booking)
        .amount(amount)
        .commission(commission)
        .netAmount(netAmount)
        .status(EarningStatus.PENDING) // Pending until checkout
        .build();

    earningRepository.save(earning);
  }

  @Override
  @Transactional
  public void recordPayment(Booking booking) {
    if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
      return;
    }

    BigDecimal amount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;

    Payment payment = Payment.builder()
        .user(booking.getTenant())
        .booking(booking)
        .amount(amount)
        .status(PaymentStatus.COMPLETED) // Assuming confirmed booking means paid
        .paymentMethod("CARD") // Default for now
        .transactionId("TX-" + System.currentTimeMillis())
        .paymentDate(java.time.LocalDateTime.now())
        .build();

    paymentRepository.save(payment);
  }

  @Override
  @Transactional
  public void markEarningAvailable(Booking booking) {
    Optional<Earning> earningOpt = earningRepository.findByBooking(booking);
    if (earningOpt.isPresent()) {
      Earning earning = earningOpt.get();
      if (earning.getStatus() == EarningStatus.PENDING) {
        earning.setStatus(EarningStatus.AVAILABLE);
        earningRepository.save(earning);
      }
    }
  }

  @Override
  @Transactional(readOnly = true)
  public com.webapp.domain.finance.dto.SpendingSummaryResponse getSpendingSummary(Long userId) {
    BigDecimal total = paymentRepository.sumTotalSpentByUserId(userId);
    if (total == null)
      total = BigDecimal.ZERO;

    return com.webapp.domain.finance.dto.SpendingSummaryResponse.builder()
        .totalSpent(total)
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public EarningsSummaryResponse getEarningsSummary(Long userId) {
    BigDecimal total = earningRepository.sumTotalEarningsByUserId(userId);
    BigDecimal pending = earningRepository.sumNetAmountByUserIdAndStatus(userId, EarningStatus.PENDING);
    BigDecimal available = earningRepository.sumNetAmountByUserIdAndStatus(userId, EarningStatus.AVAILABLE);
    BigDecimal paid = earningRepository.sumNetAmountByUserIdAndStatus(userId, EarningStatus.PAID);
    BigDecimal requested = earningRepository.sumNetAmountByUserIdAndStatus(userId, EarningStatus.REQUESTED);

    if (total == null)
      total = BigDecimal.ZERO;
    if (pending == null)
      pending = BigDecimal.ZERO;
    if (available == null)
      available = BigDecimal.ZERO;
    if (paid == null)
      paid = BigDecimal.ZERO;
    if (requested == null)
      requested = BigDecimal.ZERO;

    return EarningsSummaryResponse.builder()
        .totalEarnings(total)
        .pendingEarnings(pending.add(requested))
        .availableBalance(available)
        .paidOutEarnings(paid)
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PayoutMethodDto> getPayoutMethods(Long userId) {
    return payoutMethodRepository.findByUserId(userId).stream()
        .map(this::mapToPayoutMethodDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public PayoutMethodDto addPayoutMethod(Long userId, PayoutMethodRequest request) {
    User user = userService.getUserById(userId);
    PayoutMethod method = PayoutMethod.builder()
        .user(user)
        .bankName(request.getBankName())
        .accountNumber(request.getAccountNumber())
        .accountHolderName(request.getAccountHolderName())
        .routingNumber(request.getRoutingNumber())
        .currency(request.getCurrency())
        .isDefault(payoutMethodRepository.findByUserId(userId).isEmpty()) // First one is default
        .build();
    return mapToPayoutMethodDto(payoutMethodRepository.save(method));
  }

  @Override
  @Transactional
  public void deletePayoutMethod(Long userId, Long methodId) {
    PayoutMethod method = payoutMethodRepository.findById(methodId)
        .orElseThrow(() -> new IllegalArgumentException("Method not found"));
    if (!method.getUser().getId().equals(userId)) {
      throw new SecurityException("Not authorized");
    }
    payoutMethodRepository.delete(method);
  }

  @Override
  @Transactional
  public void requestPayout(Long userId) {
    User user = userService.getUserById(userId);
    PayoutMethod method = payoutMethodRepository.findByUserIdAndIsDefaultTrue(userId)
        .orElse(payoutMethodRepository.findByUserId(userId).stream().findFirst()
            .orElseThrow(() -> new IllegalStateException("No payout method added")));

    // Check if payout method is verified
    if (method.getVerificationStatus() != com.webapp.domain.finance.enums.PayoutMethodVerificationStatus.VERIFIED) {
      throw new IllegalStateException("Payout method must be verified before requesting payout. Current status: "
          + method.getVerificationStatus());
    }

    List<Earning> availableEarnings = earningRepository.findByUserIdAndStatus(userId, EarningStatus.AVAILABLE);
    if (availableEarnings.isEmpty()) {
      throw new IllegalStateException("No available earnings to payout");
    }

    BigDecimal totalAmount = availableEarnings.stream()
        .map(Earning::getNetAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    // Generate idempotency key based on user and available earnings
    String idempotencyKey = "payout-" + userId + "-" + System.currentTimeMillis();

    PayoutRequest payoutRequest = PayoutRequest.builder()
        .user(user)
        .payoutMethod(method)
        .amount(totalAmount)
        .status(PayoutStatus.PENDING)
        .idempotencyKey(idempotencyKey)
        .build();

    payoutRequestRepository.save(payoutRequest);

    for (Earning e : availableEarnings) {
      e.setStatus(EarningStatus.REQUESTED);
      e.setPayoutRequest(payoutRequest);
      earningRepository.save(e);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public Page<EarningDto> getEarningsHistory(Long userId, Pageable pageable) {
    return earningRepository.findByUserId(userId, pageable)
        .map(this::mapToEarningDto);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<EarningDto> getEarningsHistory(Long userId, java.time.LocalDate startDate,
      java.time.LocalDate endDate, EarningStatus status, Pageable pageable) {
    // If no filters, use simple query
    if (startDate == null && endDate == null && status == null) {
      return getEarningsHistory(userId, pageable);
    }

    // Convert dates to LocalDateTime for comparison
    java.time.LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
    java.time.LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

    return earningRepository.findByUserIdWithFilters(userId, startDateTime, endDateTime, status, pageable)
        .map(this::mapToEarningDto);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PaymentDto> getUserPayments(Long userId, Pageable pageable) {
    return paymentRepository.findByUserId(userId, pageable)
        .map(this::mapToPaymentDto);
  }

  private PayoutMethodDto mapToPayoutMethodDto(PayoutMethod pm) {
    String masked = "****" + (pm.getAccountNumber().length() > 4
        ? pm.getAccountNumber().substring(pm.getAccountNumber().length() - 4)
        : pm.getAccountNumber());
    return PayoutMethodDto.builder()
        .id(pm.getId())
        .bankName(pm.getBankName())
        .accountNumber(masked)
        .accountHolderName(pm.getAccountHolderName())
        .routingNumber(pm.getRoutingNumber())
        .currency(pm.getCurrency())
        .isDefault(pm.isDefault())
        .build();
  }

  private EarningDto mapToEarningDto(Earning e) {
    Long bookingId = e.getBooking() != null ? e.getBooking().getId() : null;
    String propertyTitle = "Unknown Property";
    if (e.getBooking() != null && e.getBooking().getProperty() != null) {
      propertyTitle = e.getBooking().getProperty().getTitle();
    }

    return EarningDto.builder()
        .id(e.getId())
        .bookingId(bookingId)
        .propertyTitle(propertyTitle)
        .amount(e.getAmount())
        .commission(e.getCommission())
        .netAmount(e.getNetAmount())
        .status(e.getStatus())
        .date(e.getCreatedAt())
        .build();
  }

  private PaymentDto mapToPaymentDto(Payment p) {
    Long bookingId = p.getBooking() != null ? p.getBooking().getId() : null;
    String propertyTitle = "Unknown Property";
    if (p.getBooking() != null && p.getBooking().getProperty() != null) {
      propertyTitle = p.getBooking().getProperty().getTitle();
    }
    String statusName = p.getStatus() != null ? p.getStatus().name() : "UNKNOWN";

    return PaymentDto.builder()
        .id(p.getId())
        .bookingId(bookingId)
        .propertyTitle(propertyTitle)
        .amount(p.getAmount())
        .status(statusName)
        .date(p.getPaymentDate())
        .paymentMethod(p.getPaymentMethod())
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PaymentDto> getAllPayments(Pageable pageable) {
    return paymentRepository.findAll(pageable).map(this::mapToPaymentDto);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<EarningDto> getAllEarnings(Pageable pageable) {
    return earningRepository.findAll(pageable).map(this::mapToEarningDto);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PayoutRequest> getAllPayoutRequests(PayoutStatus status, Pageable pageable) {
    if (status != null) {
      return payoutRequestRepository.findByStatus(status, pageable);
    }
    return payoutRequestRepository.findAll(pageable);
  }

  @Override
  @Transactional
  public void processPayoutRequest(Long id, PayoutStatus status, String notes) {
    PayoutRequest request = payoutRequestRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Payout request not found"));

    if (request.getStatus() != PayoutStatus.PENDING) {
      throw new IllegalStateException("Can only process PENDING requests");
    }

    request.setStatus(status);
    request.setAdminNote(notes);
    request.setProcessedAt(java.time.LocalDateTime.now());

    payoutRequestRepository.save(request);

    if (status == PayoutStatus.PAID) {
      List<Earning> earnings = earningRepository.findByPayoutRequestId(id);
      earnings.forEach(e -> {
        e.setStatus(EarningStatus.PAID);
        earningRepository.save(e);
      });
    } else if (status == PayoutStatus.REJECTED) {
      List<Earning> earnings = earningRepository.findByPayoutRequestId(id);
      earnings.forEach(e -> {
        e.setStatus(EarningStatus.AVAILABLE);
        e.setPayoutRequest(null);
        earningRepository.save(e);
      });
    }
  }

  @Override
  @Transactional(readOnly = true)
  public com.webapp.domain.finance.dto.AdminFinancialSummaryResponse getAdminFinancialSummary() {
    // Calculate totals from earnings
    BigDecimal totalRevenue = earningRepository.sumTotalAmount();
    BigDecimal totalCommission = earningRepository.sumTotalCommission();
    BigDecimal totalOwnerEarnings = earningRepository.sumTotalNetAmount();

    // Calculate payout totals by status
    BigDecimal pendingPayouts = payoutRequestRepository.sumAmountByStatus(PayoutStatus.PENDING);
    BigDecimal processingPayouts = payoutRequestRepository.sumAmountByStatus(PayoutStatus.PROCESSING);
    BigDecimal completedPayouts = payoutRequestRepository.sumAmountByStatus(PayoutStatus.PAID);

    // Count requests
    long totalRequests = payoutRequestRepository.count();
    long pendingCount = payoutRequestRepository.countByStatus(PayoutStatus.PENDING);

    return com.webapp.domain.finance.dto.AdminFinancialSummaryResponse.builder()
        .totalPlatformRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
        .totalPlatformCommission(totalCommission != null ? totalCommission : BigDecimal.ZERO)
        .totalOwnerEarnings(totalOwnerEarnings != null ? totalOwnerEarnings : BigDecimal.ZERO)
        .pendingPayouts(pendingPayouts != null ? pendingPayouts : BigDecimal.ZERO)
        .processingPayouts(processingPayouts != null ? processingPayouts : BigDecimal.ZERO)
        .completedPayouts(completedPayouts != null ? completedPayouts : BigDecimal.ZERO)
        .totalPayoutRequests(totalRequests)
        .pendingPayoutCount(pendingCount)
        .build();
  }
}
