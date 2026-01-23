package com.webapp.domain.admin.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.admin.dto.FraudEventDto;
import com.webapp.domain.admin.entity.FraudEvent;
import com.webapp.domain.admin.repository.FraudEventRepository;
import com.webapp.domain.admin.service.FraudService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/fraud")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Fraud Detection", description = "Admin endpoints for fraud monitoring and scanning")
public class FraudEventController {

  private final FraudEventRepository fraudEventRepository;
  private final FraudService fraudService;

  @GetMapping("/events")
  @Operation(summary = "Get all fraud events")
  public ResponseEntity<List<FraudEventDto>> getAllFraudEvents() {
    List<FraudEvent> events = fraudEventRepository.findAllByOrderByCreatedAtDesc();

    List<FraudEventDto> dtos = events.stream()
        .map(e -> FraudEventDto.builder()
            .id(e.getId())
            .userId(e.getUser() != null ? e.getUser().getId() : null)
            .userName(e.getUser() != null ? e.getUser().getFirstName() + " " + e.getUser().getLastName() : "Unknown")
            .type(e.getType())
            .severity(e.getSeverity())
            .metadata(e.getMetadata())
            .createdAt(e.getCreatedAt())
            .build())
        .toList();

    return ResponseEntity.ok(dtos);
  }

  @GetMapping("/stats")
  @Operation(summary = "Get fraud statistics")
  public ResponseEntity<Map<String, Object>> getFraudStats(
      @RequestParam(defaultValue = "7") int days) {

    LocalDateTime since = LocalDateTime.now().minusDays(days);
    List<Object[]> counts = fraudEventRepository.countByTypeAndSeveritySince(since);

    Map<String, Long> byType = new HashMap<>();
    Map<String, Long> bySeverity = new HashMap<>();
    long total = 0;

    for (Object[] row : counts) {
      String type = row[0].toString();
      String severity = row[1].toString();
      Long count = (Long) row[2];

      byType.merge(type, count, (a, b) -> a + b);
      bySeverity.merge(severity, count, (a, b) -> a + b);
      total += count;
    }

    Map<String, Object> stats = new HashMap<>();
    stats.put("total", total);
    stats.put("byType", byType);
    stats.put("bySeverity", bySeverity);
    stats.put("periodDays", days);

    return ResponseEntity.ok(stats);
  }

  @PostMapping("/scan/duplicates")
  @Operation(summary = "Trigger duplicate listing scan")
  public ResponseEntity<Map<String, String>> scanDuplicates() {
    log.info("Admin triggered duplicate listing scan");
    fraudService.scanForDuplicateListings();
    return ResponseEntity.ok(Map.of("status", "Scan initiated", "type", "DUPLICATE_LISTINGS"));
  }

  @PostMapping("/scan/spam")
  @Operation(summary = "Trigger spam message scan")
  public ResponseEntity<Map<String, String>> scanSpam() {
    log.info("Admin triggered spam message scan");
    fraudService.scanForSpamMessages();
    return ResponseEntity.ok(Map.of("status", "Scan initiated", "type", "SPAM_MESSAGES"));
  }

  @PostMapping("/scan/mismatches")
  @Operation(summary = "Trigger emergency mismatch scan")
  public ResponseEntity<Map<String, String>> scanMismatches() {
    log.info("Admin triggered emergency mismatch scan");
    fraudService.scanForEmergencyMismatches();
    return ResponseEntity.ok(Map.of("status", "Scan initiated", "type", "EMERGENCY_MISMATCHES"));
  }

  @PostMapping("/scan/all")
  @Operation(summary = "Run all fraud scans")
  public ResponseEntity<Map<String, String>> runAllScans() {
    log.info("Admin triggered full fraud scan");
    fraudService.scanForDuplicateListings();
    fraudService.scanForSpamMessages();
    fraudService.scanForEmergencyMismatches();
    return ResponseEntity.ok(Map.of("status", "All scans initiated"));
  }
}
