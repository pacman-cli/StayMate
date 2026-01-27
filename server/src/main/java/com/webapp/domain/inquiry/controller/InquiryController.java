package com.webapp.domain.inquiry.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.inquiry.dto.InquiryDTO;
import com.webapp.domain.inquiry.service.InquiryService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

  private final InquiryService inquiryService;
  private final UserRepository userRepository;

  @PostMapping
  public ResponseEntity<InquiryDTO.Response> createInquiry(
      @AuthenticationPrincipal UserPrincipal currentUser,
      @RequestBody InquiryDTO.CreateRequest request) {
    User user = userRepository.findById(currentUser.getId()).orElseThrow();
    return ResponseEntity.ok(inquiryService.createInquiry(user, request));
  }

  @PostMapping("/{id}/reply")
  public ResponseEntity<InquiryDTO.Response> replyToInquiry(
      @AuthenticationPrincipal UserPrincipal currentUser,
      @PathVariable Long id,
      @RequestBody InquiryDTO.ReplyRequest request) {
    User user = userRepository.findById(currentUser.getId()).orElseThrow();
    return ResponseEntity.ok(inquiryService.replyToInquiry(user, id, request.getReply()));
  }

  @GetMapping("/received")
  public ResponseEntity<Page<InquiryDTO.Response>> getReceivedInquiries(
      @AuthenticationPrincipal UserPrincipal currentUser,
      @PageableDefault(size = 20) Pageable pageable) {
    User user = userRepository.findById(currentUser.getId()).orElseThrow();
    return ResponseEntity.ok(inquiryService.getOwnerInquiries(user, pageable));
  }

  @GetMapping("/sent")
  public ResponseEntity<Page<InquiryDTO.Response>> getSentInquiries(
      @AuthenticationPrincipal UserPrincipal currentUser,
      @PageableDefault(size = 20) Pageable pageable) {
    User user = userRepository.findById(currentUser.getId()).orElseThrow();
    return ResponseEntity.ok(inquiryService.getUserInquiries(user, pageable));
  }
}
