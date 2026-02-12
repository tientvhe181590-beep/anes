package com.anes.server.ai.controller;

import com.anes.server.ai.dto.ChatRequest;
import com.anes.server.ai.dto.ChatResponse;
import com.anes.server.ai.dto.GeneratePlanRequest;
import com.anes.server.ai.dto.GeneratePlanResponse;
import com.anes.server.ai.service.AiService;
import com.anes.server.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-plan")
    public ResponseEntity<ApiResponse<GeneratePlanResponse>> generatePlan(
            Authentication authentication,
            @Valid @RequestBody GeneratePlanRequest request
    ) {
        Long userId = extractUserId(authentication);
        GeneratePlanResponse response = aiService.generatePlan(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Workout plan generated successfully."));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            Authentication authentication,
            @Valid @RequestBody ChatRequest request
    ) {
        Long userId = extractUserId(authentication);
        ChatResponse response = aiService.chat(userId, request.message());
        return ResponseEntity.ok(ApiResponse.success(response, "Response generated."));
    }

    private Long extractUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long id) {
            return id;
        }
        return Long.parseLong(String.valueOf(principal));
    }
}
