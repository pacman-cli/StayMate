package com.webapp.domain.report.dto;

import java.time.LocalDateTime;

import com.webapp.domain.report.enums.ReportReason;
import com.webapp.domain.report.enums.ReportSeverity;
import com.webapp.domain.report.enums.ReportStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
  private Long id;
  private String reporterName;
  private String reportedUserName;
  private ReportReason reason;
  private String description;
  private ReportSeverity severity;
  private ReportStatus status;
  private LocalDateTime createdAt;
  private String timeAgo; // Calculated in mapper or service
}
