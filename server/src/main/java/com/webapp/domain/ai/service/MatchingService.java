package com.webapp.domain.ai.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.domain.ai.dto.AiMatchRecommendation;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

  private final AiService aiService;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;

  /**
   * Findings matches for the given user using a hybrid approach:
   * 1. Hard filters (City, Role) via SQL (Repository)
   * 2. AI Scoring of top candidates
   */
  public List<AiMatchRecommendation> findMatches(User targetUser) {
    if (!aiService.checkHealth()) {
      log.warn("AI Service is down. Skipping AI matching.");
      return Collections.emptyList();
    }

    // Step 1: Candidate Selection (Hard Filters)
    // For now, fetching users in the same city with ROLE_USER, excluding self.
    // In production, this would be a specific @Query in UserRepository
    List<User> candidates = userRepository.findAll().stream()
        .filter(u -> !u.getId().equals(targetUser.getId()))
        .filter(u -> u.isRegularUser()) // Only match with other tenants for now
        .filter(u -> isSameCity(targetUser, u))
        .limit(5) // Limit to top 5 candidates to save AI processing time
        .collect(Collectors.toList());

    if (candidates.isEmpty()) {
      return Collections.emptyList();
    }

    List<AiMatchRecommendation> recommendations = new ArrayList<>();

    // Step 2: AI Scoring
    for (User candidate : candidates) {
      String prompt = buildPrompt(targetUser, candidate);
      String aiResponse = aiService.generateResponse(prompt);

      if (aiResponse != null) {
        try {
          // Extract JSON from response (handling potential markdown wrapping)
          String jsonStr = extractJson(aiResponse);
          JsonNode root = objectMapper.readTree(jsonStr);

          int score = root.path("score").asInt(50);
          String explanation = root.path("explanation").asText("No explanation provided");

          recommendations.add(AiMatchRecommendation.builder()
              .userId(candidate.getId())
              .userName(candidate.getFullName())
              .compatibilityScore(score)
              .explanation(explanation)
              .matchType(determineMatchType(score))
              .build());

        } catch (Exception e) {
          log.error("Failed to parse AI response for match: {}", e.getMessage());
        }
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) -> b.getCompatibilityScore().compareTo(a.getCompatibilityScore()));

    return recommendations;
  }

  private boolean isSameCity(User u1, User u2) {
    if (u1.getCity() == null || u2.getCity() == null)
      return false;
    return u1.getCity().equalsIgnoreCase(u2.getCity());
  }

  private String determineMatchType(int score) {
    if (score >= 85)
      return "Perfect Match";
    if (score >= 70)
      return "Great Match";
    if (score >= 50)
      return "Good Match";
    return "Potential Match";
  }

  private String buildPrompt(User target, User candidate) {
    // Construct anonymized profiles
    String targetProfile = formatProfile(target);
    String candidateProfile = formatProfile(candidate);

    return String.format(
        """
            You are an expert roommate matcher. Analyze the compatibility between these two users based on their profiles.

            User A: %s
            User B: %s

            Respond strictly in JSON format with two fields: 'score' (integer 0-100) and 'explanation' (string, max 2 sentences).
            Example: {"score": 85, "explanation": "Both value cleanliness and have similar schedules."}
            Avoid markdown or additional text.
            """,
        targetProfile, candidateProfile);
  }

  private String formatProfile(User user) {
    // Only include relevant, non-sensitive info for matching
    StringBuilder sb = new StringBuilder();
    if (user.getBio() != null)
      sb.append("Bio: ").append(user.getBio()).append("; ");
    // If we had more fields like specific preferences (smoking, pets), add them
    // here
    // For now, Bio is the main source of personality
    return sb.toString();
  }

  private String extractJson(String response) {
    // Remove markdown code blocks if present ( ```json ... ``` )
    if (response.contains("```json")) {
      int start = response.indexOf("```json") + 7;
      int end = response.lastIndexOf("```");
      if (end > start) {
        return response.substring(start, end).trim();
      }
    }
    if (response.contains("```")) {
      int start = response.indexOf("```") + 3;
      int end = response.lastIndexOf("```");
      if (end > start) {
        return response.substring(start, end).trim();
      }
    }
    return response.trim();
  }
}
