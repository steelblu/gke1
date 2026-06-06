package com.shop.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class AiClient {

    private final RestTemplate restTemplate;
    private final String fastapiUrl;

    public AiClient(@Value("${fastapi.url}") String fastapiUrl) {
        this.restTemplate = new RestTemplate();
        this.fastapiUrl = fastapiUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> healthCheck() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    fastapiUrl + "/health", Map.class);
            return response.getBody();
        } catch (Exception e) {
            return Map.of("status", "DOWN", "error", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> recommend(String userId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    fastapiUrl + "/recommend?user_id=" + userId, Map.class);
            return response.getBody();
        } catch (Exception e) {
            return Map.of("error", "AI service unavailable", "message", e.getMessage());
        }
    }
}
