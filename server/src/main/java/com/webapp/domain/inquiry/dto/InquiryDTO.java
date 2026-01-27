package com.webapp.domain.inquiry.dto;

import java.time.LocalDateTime;

import com.webapp.domain.inquiry.entity.InquiryStatus;

import lombok.Builder;
import lombok.Data;

public class InquiryDTO {

  @Data
  public static class CreateRequest {
    private Long propertyId;
    private String message;
  }

  @Data
  public static class ReplyRequest {
    private String reply;
  }

  @Data
  @Builder
  public static class Response {
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private String propertyImage;

    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderProfilePictureUrl;

    private String message;
    private String reply;
    private InquiryStatus status;
    private LocalDateTime createdAt;
  }
}
