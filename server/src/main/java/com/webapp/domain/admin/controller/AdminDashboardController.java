package com.webapp.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.admin.dto.AdminDashboardStatDto;
import com.webapp.domain.admin.service.AdminService;
import com.webapp.domain.admin.service.FraudService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

  private final AdminService adminService;
  private final FraudService fraudService;

  @GetMapping("/dashboard")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<AdminDashboardStatDto> getDashboardStats() {
    // Ensuring backward compatibility if frontend calls /dashboard
    return ResponseEntity.ok(adminService.getDashboardStats());
  }

  @GetMapping("/stats")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<AdminDashboardStatDto> getStats() {
    // Alias for /stats as requested by frontend
    return ResponseEntity.ok(adminService.getDashboardStats());
  }

  @PostMapping("/fraud/scan")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> triggerFraudScan() {
    fraudService.scanForDuplicateListings();
    fraudService.scanForSpamMessages();
    fraudService.scanForEmergencyMismatches();
    return ResponseEntity.ok().build();
  }
}
