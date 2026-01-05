package com.webapp.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetric {
    private String label;
    private String value;
    private String type; // "count", "currency", "percentage"
    private String trend; // "up", "down", "neutral"
    private String change; // "+15%" etc
    private String icon; // "users", "home", "message", etc.
    private String color; // "blue", "green", "red", etc. preference for frontend
}
