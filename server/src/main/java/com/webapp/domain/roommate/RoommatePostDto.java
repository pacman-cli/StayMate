package com.webapp.domain.roommate;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoommatePostDto {
  private Long id;
  private Long userId;
  private String userName;
  private String userAvatar;

  @NotBlank(message = "Location is required")
  private String location;

  @NotNull(message = "Budget is required")
  @Min(value = 0, message = "Budget must be positive")
  private Double budget;

  @NotNull(message = "Move-in date is required")
  private LocalDate moveInDate;

  private String bio;

  private String genderPreference;
  private Boolean smoking;
  private Boolean pets;
  private String occupation;

  private Double latitude;
  private Double longitude;

  private String createdAt;
  private RoommatePostStatus status;
  private Integer matchScore;
}
