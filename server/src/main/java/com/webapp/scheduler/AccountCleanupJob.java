package com.webapp.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.enums.AccountStatus;
import com.webapp.domain.user.repository.UserRepository;
import com.webapp.domain.user.service.UserDeletionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountCleanupJob {

  private final UserRepository userRepository;
  private final UserDeletionService userDeletionService;

  // Run every hour
  @Scheduled(cron = "0 0 * * * *")
  public void processExpiredDeletions() {
    log.info("Running account cleanup job...");

    LocalDateTime now = LocalDateTime.now();
    List<User> usersToDelete = userRepository.findByAccountStatusAndDeletionScheduledAtBefore(
        AccountStatus.PENDING_DELETION, now);

    if (usersToDelete.isEmpty()) {
      log.info("No accounts scheduled for deletion at this time.");
      return;
    }

    log.info("Found {} accounts to delete.", usersToDelete.size());

    for (User user : usersToDelete) {
      try {
        userDeletionService.executeDeletion(user);
      } catch (Exception e) {
        log.error("Failed to delete user {}", user.getId(), e);
      }
    }
  }
}
