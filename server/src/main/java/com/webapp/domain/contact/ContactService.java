package com.webapp.domain.contact;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ContactService {

  public void processContactRequest(ContactRequest request) {
    // In a real app, this would send an email or save to DB
    log.info("Received contact request from {}: {}", request.getName(), request.getMessage());
  }
}
