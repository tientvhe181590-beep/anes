package com.anes.server.ai.controller;

import com.anes.server.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI Proxy Controller (BFF Pattern).
 * Proxies chat and vision requests to Gemini API.
 * API keys are NEVER exposed to the client.
 */
@RestController
@RequestMapping("/api/v1/ai")
public class AiProxyController {

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @RequestBody Map<String, Object> request) {
        // TODO: Implement Gemini proxy
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "message", "AI chat proxy — not yet implemented",
                "role", "assistant")));
    }

    @PostMapping("/vision/scan")
    public ResponseEntity<ApiResponse<Map<String, String>>> scanIngredients(
            @RequestBody Map<String, Object> request) {
        // TODO: Implement vision proxy
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "message", "Vision scan proxy — not yet implemented")));
    }
}
