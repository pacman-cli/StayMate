package com.webapp.domain.ai.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.domain.ai.dto.OllamaRequest;
import com.webapp.domain.ai.dto.OllamaResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AiService {

    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ai.ollama.model:llama3.2}")
    private String defaultModel;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String generateResponse(String prompt) {
        // Generates response; falls back on failure
        try {
            OllamaRequest request = OllamaRequest.builder()
                    .model(defaultModel)
                    .prompt(prompt)
                    .stream(false)
                    .build();

            String requestBody = objectMapper.writeValueAsString(request);

            // Configures HTTP request with timeout and JSON body
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaUrl + "/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(60))
                    .build();

            log.debug("Sending AI request to Ollama: {}", prompt.substring(0, Math.min(prompt.length(), 50)) + "...");

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("AI Request failed with status code: {}", response.statusCode());
                return performFallback("AI Service Unavailable (Status " + response.statusCode() + ")");
            }

            OllamaResponse ollamaResponse = objectMapper.readValue(response.body(), OllamaResponse.class);
            return ollamaResponse.getResponse();

        } catch (Exception e) {
            log.error("Failed to communicate with Ollama: {}", e.getMessage());
            return performFallback("AI Service Unavailable");
        }
    }
    
    /**
     * Checks Ollama service health; logs failures
     */
    public boolean checkHealth() {
        try {
            // Builds request to check available Ollama models
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaUrl + "/api/tags"))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            log.warn("Ollama health check failed: {}", e.getMessage());
            return false;
        }
    }

    private String performFallback(String reason) {
        // Return a safe fallback message or throw a structured exception depending on use
        // case
        // For matching, we might return empty string or null to indicate "no AI data"
        return null;
    }
}
