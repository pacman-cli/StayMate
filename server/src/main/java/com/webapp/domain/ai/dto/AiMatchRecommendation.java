package com.webapp.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMatchRecommendation {

  @JsonProperty("user_id")
  private Long userId;

  @JsonProperty("user_name")
  private String userName;

  @JsonProperty("compatibility_score")
  private Integer compatibilityScore;

  private String explanation;

  @JsonProperty("match_type")
  private String matchType; // e.g., "Highly Compatible", "Balanced", "Risky"
}
