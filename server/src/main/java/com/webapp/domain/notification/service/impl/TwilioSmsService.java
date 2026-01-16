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
    try {
      Message message = Message.creator(
          new PhoneNumber(phoneNumber),
          new PhoneNumber(fromNumber),
          messageText).create();
      log.info("Sent SMS to {}: SID {}", phoneNumber, message.getSid());
    } catch (Exception e) {
      log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
      log.warn("FALLBACK: SMS content for {}: {}", phoneNumber, messageText);
      // Suppress exception to allow verification flow to continue (Dev/Demo
      // resilience)
    }
  }
}
