package com.webapp.domain.verification.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.domain.user.entity.User;
import com.webapp.domain.verification.entity.VerificationRequest;
import com.webapp.domain.verification.service.VerificationService;
import com.webapp.service.FileStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class VerificationController {

  private final VerificationService verificationService;
  private final FileStorageService fileStorageService;

  @PostMapping("/upload")
  public ResponseEntity<?> uploadVerificationDocument(
      @RequestParam("file") MultipartFile file,
      @RequestParam("documentType") String documentType,
      Principal principal) {

    User user = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();

    String fileName = fileStorageService.storeFile(file);
    String fileUrl = "/api/uploads/" + fileName; // Assuming we will have an endpoint or just storing path reference

    VerificationRequest request = verificationService.submitRequest(user.getId(), fileUrl, documentType);

    return ResponseEntity.ok(request);
  }
}
