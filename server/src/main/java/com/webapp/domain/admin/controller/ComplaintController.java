package com.webapp.domain.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.admin.dto.ComplaintRequest;
import com.webapp.domain.admin.dto.ComplaintResponse;
import com.webapp.domain.admin.enums.ComplaintStatus;
import com.webapp.domain.admin.service.ComplaintService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Complaints", description = "User complaint management endpoints")
public class ComplaintController {

  private final ComplaintService complaintService;
  private final UserRepository userRepository;

  @PostMapping
  @Operation(summary = "Submit a complaint against a user")
  public ResponseEntity<ComplaintResponse> createComplaint(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody ComplaintRequest request) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    ComplaintResponse response = complaintService.createComplaint(user.getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Get complaint by ID (Admin only)")
  public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
    return ResponseEntity.ok(complaintService.getComplaintById(id));
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Get all complaints (Admin only)")
  public ResponseEntity<List<ComplaintResponse>> getAllComplaints(
      @RequestParam(required = false) ComplaintStatus status) {

    List<ComplaintResponse> complaints;
    if (status != null) {
      complaints = complaintService.getComplaintsByStatus(status);
    } else {
      complaints = complaintService.getAllComplaints();
    }
    return ResponseEntity.ok(complaints);
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Update complaint status (Admin only)")
  public ResponseEntity<ComplaintResponse> updateComplaintStatus(
      @PathVariable Long id,
      @RequestParam ComplaintStatus status) {

    return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Delete a complaint (Admin only)")
  public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
    complaintService.deleteComplaint(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/stats")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Get complaint statistics (Admin only)")
  public ResponseEntity<ComplaintStats> getComplaintStats() {
    ComplaintStats stats = ComplaintStats.builder()
        .openCount(complaintService.countByStatus(ComplaintStatus.OPEN))
        .inProgressCount(complaintService.countByStatus(ComplaintStatus.IN_PROGRESS))
        .resolvedCount(complaintService.countByStatus(ComplaintStatus.RESOLVED))
        .dismissedCount(complaintService.countByStatus(ComplaintStatus.DISMISSED))
        .build();
    return ResponseEntity.ok(stats);
  }

  @lombok.Data
  @lombok.Builder
  @lombok.NoArgsConstructor
  @lombok.AllArgsConstructor
  public static class ComplaintStats {
    private long openCount;
    private long inProgressCount;
    private long resolvedCount;
    private long dismissedCount;
  }
}
