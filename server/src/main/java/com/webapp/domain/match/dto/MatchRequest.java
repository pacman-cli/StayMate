package com.webapp.domain.match.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {

    @NotNull(message = "Target User ID is required")
    private Long targetUserId;

    private Double matchPercentage;
}
