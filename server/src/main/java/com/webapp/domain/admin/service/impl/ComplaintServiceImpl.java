package com.webapp.domain.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.admin.dto.ComplaintRequest;
import com.webapp.domain.admin.dto.ComplaintResponse;
import com.webapp.domain.admin.entity.Complaint;
import com.webapp.domain.admin.enums.ComplaintPriority;
import com.webapp.domain.admin.enums.ComplaintStatus;
import com.webapp.domain.admin.repository.ComplaintRepository;
import com.webapp.domain.admin.service.ComplaintService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintServiceImpl implements ComplaintService {

  private final ComplaintRepository complaintRepository;
  private final UserRepository userRepository;

  @Override
  @Transactional
  public ComplaintResponse createComplaint(Long reporterId, ComplaintRequest request) {
    User reporter = userRepository.findById(reporterId)
        .orElseThrow(() -> new ResourceNotFoundException("Reporter not found with id: " + reporterId));

    User reportedUser = userRepository.findById(request.getReportedUserId())
        .orElseThrow(
            () -> new ResourceNotFoundException("Reported user not found with id: " + request.getReportedUserId()));

    Complaint complaint = Complaint.builder()
        .reporter(reporter)
        .reportedUser(reportedUser)
        .type(request.getType())
        .priority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM)
        .status(ComplaintStatus.OPEN)
        .description(request.getDescription())
        .build();

    Complaint saved = complaintRepository.save(complaint);
    log.info("Created complaint {} by user {} against user {}", saved.getId(), reporterId, request.getReportedUserId());

    return ComplaintResponse.fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public ComplaintResponse getComplaintById(Long id) {
    Complaint complaint = complaintRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
    return ComplaintResponse.fromEntity(complaint);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ComplaintResponse> getAllComplaints() {
    return complaintRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(ComplaintResponse::fromEntity)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status) {
    return complaintRepository.findByStatus(status).stream()
        .map(ComplaintResponse::fromEntity)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatus status) {
    Complaint complaint = complaintRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

    complaint.setStatus(status);
    Complaint updated = complaintRepository.save(complaint);
    log.info("Updated complaint {} status to {}", id, status);

    return ComplaintResponse.fromEntity(updated);
  }

  @Override
  @Transactional
  public void deleteComplaint(Long id) {
    if (!complaintRepository.existsById(id)) {
      throw new ResourceNotFoundException("Complaint not found with id: " + id);
    }
    complaintRepository.deleteById(id);
    log.info("Deleted complaint {}", id);
  }

  @Override
  @Transactional(readOnly = true)
  public long countByStatus(ComplaintStatus status) {
    return complaintRepository.countByStatus(status);
  }
}
