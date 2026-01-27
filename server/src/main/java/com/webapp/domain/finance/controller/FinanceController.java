package com.webapp.domain.finance.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.finance.dto.EarningDto;
import com.webapp.domain.finance.dto.EarningsSummaryResponse;
import com.webapp.domain.finance.dto.PaymentDto;
import com.webapp.domain.finance.dto.PayoutMethodDto;
import com.webapp.domain.finance.dto.PayoutMethodRequest;
import com.webapp.domain.finance.dto.SpendingSummaryResponse;
import com.webapp.domain.finance.entity.PayoutRequest;
import com.webapp.domain.finance.enums.EarningStatus;
import com.webapp.domain.finance.enums.PayoutStatus;
import com.webapp.domain.finance.service.FinanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

  private final FinanceService financeService;
  private final com.webapp.domain.finance.service.PdfReportService pdfReportService;

  @GetMapping("/earnings")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<EarningsSummaryResponse> getEarningsSummary(
      @AuthenticationPrincipal UserPrincipal currentUser) {
    return ResponseEntity.ok(financeService.getEarningsSummary(currentUser.getId()));
  }

  @GetMapping("/history")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<Page<EarningDto>> getEarningsHistory(
      @AuthenticationPrincipal UserPrincipal currentUser,
      @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
      @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
      @RequestParam(required = false) EarningStatus status,
      Pageable pageable) {
    return ResponseEntity
        .ok(financeService.getEarningsHistory(currentUser.getId(), startDate, endDate, status, pageable));
  }

  @GetMapping("/my-payments")
  @PreAuthorize("hasAnyRole('USER', 'HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<Page<PaymentDto>> getMyPayments(@AuthenticationPrincipal UserPrincipal currentUser,
      Pageable pageable) {
    return ResponseEntity.ok(financeService.getUserPayments(currentUser.getId(), pageable));
  }

  @GetMapping("/my-spending-summary")
  @PreAuthorize("hasAnyRole('USER', 'HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<SpendingSummaryResponse> getMySpendingSummary(
      @AuthenticationPrincipal UserPrincipal currentUser) {
    return ResponseEntity.ok(financeService.getSpendingSummary(currentUser.getId()));
  }

  @GetMapping("/payout-methods")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<List<PayoutMethodDto>> getPayoutMethods(@AuthenticationPrincipal UserPrincipal currentUser) {
    return ResponseEntity.ok(financeService.getPayoutMethods(currentUser.getId()));
  }

  @PostMapping("/payout-methods")
  @PreAuthorize("hasRole('HOUSE_OWNER')")
  public ResponseEntity<PayoutMethodDto> addPayoutMethod(@AuthenticationPrincipal UserPrincipal currentUser,
      @Valid @RequestBody PayoutMethodRequest request) {
    return ResponseEntity.ok(financeService.addPayoutMethod(currentUser.getId(), request));
  }

  @DeleteMapping("/payout-methods/{id}")
  @PreAuthorize("hasRole('HOUSE_OWNER')")
  public ResponseEntity<Void> deletePayoutMethod(@AuthenticationPrincipal UserPrincipal currentUser,
      @PathVariable Long id) {
    financeService.deletePayoutMethod(currentUser.getId(), id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/payout-requests")
  @PreAuthorize("hasRole('HOUSE_OWNER')")
  public ResponseEntity<Void> requestPayout(@AuthenticationPrincipal UserPrincipal currentUser) {
    financeService.requestPayout(currentUser.getId());
    return ResponseEntity.ok().build();
  }

  // Admin Endpoints
  @GetMapping("/admin/payments")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<PaymentDto>> getAllPayments(Pageable pageable) {
    return ResponseEntity.ok(financeService.getAllPayments(pageable));
  }

  @GetMapping("/admin/earnings")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<EarningDto>> getAllEarnings(Pageable pageable) {
    return ResponseEntity.ok(financeService.getAllEarnings(pageable));
  }

  @GetMapping("/admin/payout-requests")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<PayoutRequest>> getAllPayoutRequests(
      @RequestParam(required = false) PayoutStatus status,
      Pageable pageable) {
    return ResponseEntity.ok(financeService.getAllPayoutRequests(status, pageable));
  }

  @PostMapping("/admin/payout-requests/{id}/process")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> processPayoutRequest(
      @PathVariable Long id,
      @RequestParam PayoutStatus status,
      @RequestParam(required = false) String notes) {
    financeService.processPayoutRequest(id, status, notes);
    return ResponseEntity.ok().build();
  }

  /**
   * Get admin financial summary with platform commission totals
   */
  @GetMapping("/admin/summary")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<com.webapp.domain.finance.dto.AdminFinancialSummaryResponse> getAdminSummary(
      @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
      @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
    return ResponseEntity.ok(financeService.getAdminFinancialSummary(startDate, endDate));
  }

  @GetMapping("/admin/analytics")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<com.webapp.domain.finance.dto.AnalyticsDashboardData> getAnalyticsData(
      @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
      @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
    return ResponseEntity.ok(financeService.getAnalyticsData(startDate, endDate));
  }

  /**
   * Export earnings history as CSV file
   */
  @GetMapping("/export")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<byte[]> exportEarningsCSV(@AuthenticationPrincipal UserPrincipal currentUser) {
    Page<EarningDto> earningsPage = financeService.getEarningsHistory(
        currentUser.getId(),
        Pageable.ofSize(1000) // Limit to 1000 records
    );

    StringBuilder csv = new StringBuilder();
    csv.append("Date,Booking ID,Property,Gross Amount,Commission,Net Amount,Status\n");

    for (EarningDto e : earningsPage.getContent()) {
      csv.append(String.format("%s,%d,%s,%.2f,%.2f,%.2f,%s\n",
          e.getDate() != null ? e.getDate().toString() : "",
          e.getBookingId() != null ? e.getBookingId() : 0,
          e.getPropertyTitle() != null ? "\"" + e.getPropertyTitle().replace("\"", "\"\"") + "\"" : "",
          e.getAmount() != null ? e.getAmount() : 0,
          e.getCommission() != null ? e.getCommission() : 0,
          e.getNetAmount() != null ? e.getNetAmount() : 0,
          e.getStatus() != null ? e.getStatus().name() : ""));
    }

    byte[] csvBytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

    return ResponseEntity.ok()
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", "attachment; filename=\"earnings-report.csv\"")
        .body(csvBytes);
  }

  /**
   * Export earnings history as PDF file
   */
  @GetMapping("/export/pdf")
  @PreAuthorize("hasAnyRole('HOUSE_OWNER', 'ADMIN')")
  public ResponseEntity<byte[]> exportEarningsPDF(@AuthenticationPrincipal UserPrincipal currentUser) {
    try {
      Page<EarningDto> earningsPage = financeService.getEarningsHistory(
          currentUser.getId(),
          Pageable.ofSize(1000) // Limit to 1000 records
      );

      byte[] pdfBytes = pdfReportService.generateEarningsReport(earningsPage.getContent());

      return ResponseEntity.ok()
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", "attachment; filename=\"earnings-report.pdf\"")
          .body(pdfBytes);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}
