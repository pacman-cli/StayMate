package com.webapp.domain.verification.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.verification.entity.VerificationRequest;
import com.webapp.domain.verification.repository.VerificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VerificationService {

  private final VerificationRepository verificationRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public List<VerificationRequest> getPendingRequests() {
    return verificationRepository.findByStatus(VerificationRequest.VerificationStatus.PENDING);
  }

  @Transactional(readOnly = true)
  public List<VerificationRequest> getAllRequests() {
    return verificationRepository.findAll();
  }

  @Transactional
  public VerificationRequest submitRequest(@NonNull Long userId, String documentUrl, String documentType) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // precise duplicate check logic can be added here

    VerificationRequest request = VerificationRequest.builder()
        .user(user)
        .documentUrl(documentUrl)
        .documentType(documentType)
        .status(VerificationRequest.VerificationStatus.PENDING)
        .build();
    return java.util.Objects.requireNonNull(verificationRepository.save(request));
  }

  @Transactional
  public VerificationRequest approveRequest(@NonNull Long requestId) {
    VerificationRequest request = verificationRepository.findById(requestId)
        .orElseThrow(() -> new RuntimeException("Request not found"));

    request.setStatus(VerificationRequest.VerificationStatus.APPROVED);
    request.setUpdatedAt(LocalDateTime.now());

    // Update user status
    User user = request.getUser();
    // Assuming there's a field for verification or we just rely on this request
    // history
    // user.setIdentityVerified(true); // If this field exists
    java.util.Objects.requireNonNull(userRepository.save(user));

    return java.util.Objects.requireNonNull(verificationRepository.save(request));
  }

  @Transactional
  public VerificationRequest rejectRequest(@NonNull Long requestId, String reason) {
    VerificationRequest request = verificationRepository.findById(requestId)
        .orElseThrow(() -> new RuntimeException("Request not found"));

    request.setStatus(VerificationRequest.VerificationStatus.REJECTED);
    request.setRejectionReason(reason);
    request.setUpdatedAt(LocalDateTime.now());

    return java.util.Objects.requireNonNull(verificationRepository.save(request));
  }
}
