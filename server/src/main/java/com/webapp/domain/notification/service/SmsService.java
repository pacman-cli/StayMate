package com.webapp.domain.notification.service;

public interface SmsService {
  void sendSms(String phoneNumber, String message);
}
