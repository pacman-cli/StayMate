package com.webapp.domain.notification.service.impl;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.webapp.domain.notification.service.SmsService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@ConditionalOnProperty(name = "sms.provider", havingValue = "console", matchIfMissing = true)
public class ConsoleSmsService implements SmsService {

  @Override
  public void sendSms(String phoneNumber, String message) {
    log.info("SMS to {}: {}", phoneNumber, message);
  }
}
