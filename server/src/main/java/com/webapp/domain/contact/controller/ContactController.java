package com.webapp.domain.contact.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.domain.contact.ContactRequest;
import com.webapp.domain.contact.ContactService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

  private final ContactService contactService;

  @PostMapping
  public ResponseEntity<Void> submitContactForm(@RequestBody ContactRequest request) {
    contactService.processContactRequest(request);
    return ResponseEntity.ok().build();
  }
}
