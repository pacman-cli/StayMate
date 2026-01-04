package com.webapp.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OllamaRequest {

  @Builder.Default
  private String model = "llama2"; // Default, can be overridden

  private String prompt;

  @Builder.Default
  private boolean stream = false;
}
