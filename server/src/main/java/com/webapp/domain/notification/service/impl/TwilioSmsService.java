package com.webapp.domain.notification.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.webapp.domain.notification.service.SmsService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@ConditionalOnProperty(name = "sms.provider", havingValue = "twilio")
public class TwilioSmsService implements SmsService {

  @Value("${twilio.account.sid}")
  private String accountSid;

  @Value("${twilio.auth.token}")
  private String authToken;

  @Value("${twilio.phone.number}")
  private String fromNumber;

  @PostConstruct
  public void init() {
    if (accountSid != null && !accountSid.isEmpty()) {
      Twilio.init(accountSid, authToken);
      log.info("Twilio SMS Service initialized with number: {}", fromNumber);
    } else {
      log.warn("Twilio credentials missing");
    }
  }

  @Override
  public void sendSms(String phoneNumber, String messageText) {
    // ALWAYS log to console first (so code is visible even if Twilio fails)
    log.info("╔════════════════════════════════════════════════════════════╗");
    log.info("║  VERIFICATION CODE for {}  ║", phoneNumber);
    log.info("║  {}  ║", messageText);
    log.info("╚════════════════════════════════════════════════════════════╝");

    // Then attempt to send via Twilio (may fail due to 5 msg/day trial limit)
    try {
      Message message = Message.creator(
          new PhoneNumber(phoneNumber),
          new PhoneNumber(fromNumber),
          messageText).create();
      log.info("✓ SMS sent successfully to {}: SID {}", phoneNumber, message.getSid());
    } catch (Exception e) {
      log.warn("SMS delivery failed (Twilio limit?): {} - Code is logged above", e.getMessage());
      // Suppress exception to allow verification flow to continue
    }
  }
}
