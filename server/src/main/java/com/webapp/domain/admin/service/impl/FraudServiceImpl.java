package com.webapp.domain.admin.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.admin.entity.FraudEvent;
import com.webapp.domain.admin.enums.FraudSeverity;
import com.webapp.domain.admin.enums.FraudType;
import com.webapp.domain.admin.repository.FraudEventRepository;
import com.webapp.domain.admin.service.FraudService;
import com.webapp.domain.messaging.repository.MessageRepository;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class FraudServiceImpl implements FraudService {

  private final FraudEventRepository fraudEventRepository;
  private final PropertyRepository propertyRepository;
  private final MessageRepository messageRepository;
  private final UserRepository userRepository;

  @Override
  @Scheduled(fixedRate = 3600000) // Every hour
  @Transactional
  public void scanForDuplicateListings() {
    log.info("Scanning for duplicate listings...");
    List<Object[]> duplicates = propertyRepository.findDuplicateTitles();

    for (Object[] row : duplicates) {
      Long userId = (Long) row[0]; // ownerId
      // Long count = (Long) row[1]; // count

      createFraudEventIfNeeded(userId, FraudType.DUPLICATE_LISTING, FraudSeverity.MEDIUM,
          "User has multiple listings with identical title.");
    }
  }

  @Override
  @Scheduled(fixedRate = 1800000) // Every 30 mins
  @Transactional
  public void scanForSpamMessages() {
    log.info("Scanning for spam messages...");
    // Placeholder for future batch spam check logic
  }

  @Override
  @Scheduled(fixedRate = 3600000)
  @Transactional
  public void scanForEmergencyMismatches() {
    log.info("Scanning for emergency availability mismatches...");
    List<com.webapp.domain.property.entity.Property> mismatches = propertyRepository
        .findByEmergencyAvailableTrueAndStatus(com.webapp.domain.property.enums.PropertyStatus.RENTED);

    for (com.webapp.domain.property.entity.Property p : mismatches) {
      createFraudEventIfNeeded(p.getOwner().getId(), FraudType.FAKE_LOCATION, FraudSeverity.LOW,
          "Property " + p.getId() + " is marked Emergency Available but status is Rented.");
    }
  }

  @Override
  @Transactional
  public void checkUserActivity(User user) {
    // Check message velocity
    LocalDateTime fiveMinsAgo = LocalDateTime.now().minusMinutes(5);
    long recentMessages = messageRepository.countBySenderIdAndCreatedAtAfter(user.getId(), fiveMinsAgo);

    if (recentMessages > 20) {
      createFraudEventIfNeeded(user.getId(), FraudType.SPAM_MESSAGES, FraudSeverity.HIGH,
          "User sent " + recentMessages + " messages in 5 minutes.");
    }
  }

  private void createFraudEventIfNeeded(Long userId, FraudType type, FraudSeverity severity, String metadata) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null)
      return;

    FraudEvent event = FraudEvent.builder()
        .user(user)
        .type(type)
        .severity(severity)
        .metadata(metadata)
        .build();

    fraudEventRepository.save(event);
    log.warn("Fraud detected: {} for user {}", type, userId);
  }
}
