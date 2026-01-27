package com.webapp.domain.roommate;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class RoommatePostDto {
  private Long id;
  private Long userId;
  private String userName;
  private String userAvatar;

  @NotBlank(message = "Location is required")
  private String location;

  @NotNull(message = "Min Budget is required")
  private Double budgetMin;

  @NotNull(message = "Max Budget is required")
  private Double budgetMax;

  private Double budget;

  @NotNull(message = "Move-in date is required")
  @JsonFormat(pattern = "yyyy-MM-dd")
  private LocalDate moveInDate;

  private String bio;

  private String genderPreference;
  private Boolean smoking;
  private Boolean alcohol;
  private Boolean pets;
  private String occupation;
  private String stayDuration;
  private String guestsAllowed;
  private String cookingHabits;

  private CleanlinessLevel cleanliness;
  private SleepSchedule sleepSchedule;
  private java.util.List<String> personalityTags;
  private java.util.List<String> interests;

  private Double latitude;
  private Double longitude;

  private String createdAt;
  private RoommatePostStatus status;
  private Integer matchScore;
  private String matchExplanation;
  private boolean isSaved;
}
