package com.webapp.domain.admin.dto;

import com.webapp.domain.admin.enums.ComplaintPriority;
import com.webapp.domain.admin.enums.ComplaintType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {

  @NotNull(message = "Reported user ID is required")
  private Long reportedUserId;

  @NotNull(message = "Complaint type is required")
  private ComplaintType type;

  private ComplaintPriority priority;

  @NotBlank(message = "Description is required")
  private String description;
}
