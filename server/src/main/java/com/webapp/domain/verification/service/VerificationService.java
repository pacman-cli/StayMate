package com.webapp.domain.verification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.notification.service.SmsService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.verification.dto.VerificationStatusResponse;
import com.webapp.domain.verification.entity.VerificationRequest;
import com.webapp.domain.verification.repository.VerificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VerificationService {

  private final VerificationRepository verificationRepository;
  private final UserRepository userRepository;
  private final SmsService smsService;

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

    User user = request.getUser();
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

  @Transactional(readOnly = true)
  public VerificationStatusResponse getVerificationStatus(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    boolean profileComplete = isProfileComplete(user);

    String documentStatus = "NOT_UPLOADED";
    String rejectionReason = null;

    Optional<VerificationRequest> latestRequest = verificationRepository.findTopByUserIdOrderByCreatedAtDesc(userId);

    if (latestRequest.isPresent()) {
      VerificationRequest latest = latestRequest.get();
      documentStatus = latest.getStatus().name();
      if (latest.getStatus() == VerificationRequest.VerificationStatus.REJECTED) {
        rejectionReason = latest.getRejectionReason();
      }
    }

    return VerificationStatusResponse.builder()
        .emailVerified(user.isEmailVerified())
        .phoneVerified(user.isPhoneVerified())
        .profileComplete(profileComplete)
        .documentStatus(documentStatus)
        .rejectionReason(rejectionReason)
        .build();
  }

  private boolean isProfileComplete(User user) {
    return user.getFirstName() != null && !user.getFirstName().isEmpty() &&
        user.getLastName() != null && !user.getLastName().isEmpty() &&
        user.getCity() != null && !user.getCity().isEmpty();
  }

  @Transactional
  public String initiatePhoneVerification(Long userId, String phoneNumber) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Check if phone number is used by ANOTHER user
    java.util.Optional<User> existingUser = userRepository.findByPhoneNumber(phoneNumber);
    if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
      throw new RuntimeException("This phone number is already verified by another user.");
    }

    try {
      user.setPhoneNumber(phoneNumber);
      // BYPASS: Twilio Free Tier restricts SMS delivery.
      // Automatically verify the phone number without sending an OTP.
      user.setPhoneVerified(true);
      userRepository.save(user);

      // Return a dummy OTP for the frontend to digest
      return "000000";
    } catch (Exception e) {
      // Log the FULL stack trace
      e.printStackTrace();
      throw new RuntimeException("Error initiating phone verification: " + e.getMessage(), e);
    }
  }

  @Transactional
  public boolean verifyPhone(Long userId, String otp) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // BYPASS: Automatically assume successful verification since Twilio is
    // disabled.
    user.setPhoneVerified(true);
    user.setPhoneOtp(null);
    userRepository.save(user);
    return true;
  }

  @Transactional(readOnly = true)
  public void validateUserVerification(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    boolean profileComplete = isProfileComplete(user);
    boolean emailVerified = user.isEmailVerified();

    boolean documentVerified = false;
    Optional<VerificationRequest> latestRequest = verificationRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
    if (latestRequest.isPresent()
        && latestRequest.get().getStatus() == VerificationRequest.VerificationStatus.APPROVED) {
      documentVerified = true;
    }

    if (!emailVerified || !profileComplete || !documentVerified) {
      throw new RuntimeException(
          "User is not fully verified. Please complete your profile, verify email, and upload identity documents.");
    }
  }
}
