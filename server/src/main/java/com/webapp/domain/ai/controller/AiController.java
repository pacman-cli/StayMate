package com.webapp.domain.ai.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.security.UserPrincipal;
import com.webapp.domain.ai.dto.AiMatchRecommendation;
import com.webapp.domain.ai.service.AiService;
import com.webapp.domain.ai.service.MatchingService;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;
    private final MatchingService matchingService;
    private final UserService userService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        boolean isUp = aiService.checkHealth();
        return ResponseEntity.ok(Map.of(
                "status", isUp ? "UP" : "DOWN",
                "provider", "Ollama",
                "model", "llama3" // hardcoded for now or fetch from config
        ));
    }

    /**
     * Authenticates user; returns AI matches for user
     */
    @PostMapping("/match")
    public ResponseEntity<List<AiMatchRecommendation>> triggerMatching(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }

        log.info("Triggering AI matching for user: {}", userPrincipal.getEmail());

        User user = userService.getUserById(userPrincipal.getId());
        List<AiMatchRecommendation> matches = matchingService.findMatches(user);

        return ResponseEntity.ok(matches);
    }
}
