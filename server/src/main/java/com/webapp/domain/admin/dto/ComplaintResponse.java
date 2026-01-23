package com.webapp.domain.admin.dto;

import java.time.LocalDateTime;

import com.webapp.domain.admin.entity.Complaint;
import com.webapp.domain.admin.enums.ComplaintPriority;
import com.webapp.domain.admin.enums.ComplaintStatus;
import com.webapp.domain.admin.enums.ComplaintType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {

  private Long id;
  private Long reporterId;
  private String reporterName;
  private String reporterEmail;
  private Long reportedUserId;
  private String reportedUserName;
  private String reportedUserEmail;
  private ComplaintType type;
  private ComplaintPriority priority;
  private ComplaintStatus status;
  private String description;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static ComplaintResponse fromEntity(Complaint complaint) {
    return ComplaintResponse.builder()
        .id(complaint.getId())
        .reporterId(complaint.getReporter().getId())
        .reporterName(complaint.getReporter().getFirstName() + " " + complaint.getReporter().getLastName())
        .reporterEmail(complaint.getReporter().getEmail())
        .reportedUserId(complaint.getReportedUser().getId())
        .reportedUserName(complaint.getReportedUser().getFirstName() + " " + complaint.getReportedUser().getLastName())
        .reportedUserEmail(complaint.getReportedUser().getEmail())
        .type(complaint.getType())
        .priority(complaint.getPriority())
        .status(complaint.getStatus())
        .description(complaint.getDescription())
        .createdAt(complaint.getCreatedAt())
        .updatedAt(complaint.getUpdatedAt())
        .build();
  }
}
