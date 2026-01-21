package com.webapp.domain.finance.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.finance.dto.EarningDto;
import com.webapp.domain.finance.dto.EarningsSummaryResponse;
import com.webapp.domain.finance.dto.PayoutMethodDto;
import com.webapp.domain.finance.dto.PayoutMethodRequest;

public interface FinanceService {
  void recordEarning(Booking booking);

  void recordPayment(Booking booking);

  void markEarningAvailable(Booking booking);

  Page<com.webapp.domain.finance.dto.PaymentDto> getUserPayments(Long userId, Pageable pageable);

  com.webapp.domain.finance.dto.SpendingSummaryResponse getSpendingSummary(Long userId);

  EarningsSummaryResponse getEarningsSummary(Long userId);

  List<PayoutMethodDto> getPayoutMethods(Long userId);

  PayoutMethodDto addPayoutMethod(Long userId, PayoutMethodRequest request);

  void deletePayoutMethod(Long userId, Long methodId);

  void requestPayout(Long userId);

  Page<EarningDto> getEarningsHistory(Long userId, Pageable pageable);

  // With filters
  Page<EarningDto> getEarningsHistory(Long userId, java.time.LocalDate startDate,
      java.time.LocalDate endDate, com.webapp.domain.finance.enums.EarningStatus status, Pageable pageable);

  // Admin
  Page<com.webapp.domain.finance.dto.PaymentDto> getAllPayments(Pageable pageable);

  Page<EarningDto> getAllEarnings(Pageable pageable);

  Page<com.webapp.domain.finance.entity.PayoutRequest> getAllPayoutRequests(
      com.webapp.domain.finance.enums.PayoutStatus status, Pageable pageable);

  void processPayoutRequest(Long id, com.webapp.domain.finance.enums.PayoutStatus status, String notes);

  // Admin financial summary
  com.webapp.domain.finance.dto.AdminFinancialSummaryResponse getAdminFinancialSummary();
}
