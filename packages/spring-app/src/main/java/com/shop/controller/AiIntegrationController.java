package com.shop.controller;

import com.shop.client.AiClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class AiIntegrationController {

    private final AiClient aiClient;

    public AiIntegrationController(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    @GetMapping("/buyer/recommend")
    public Map<String, Object> recommend(@RequestParam(defaultValue = "test-user") String userId) {
        return aiClient.recommend(userId);
    }

    @GetMapping("/ai/health")
    public Map<String, Object> aiHealth() {
        return aiClient.healthCheck();
    }
}
