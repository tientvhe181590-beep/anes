package com.anes.server.auth.controller;

import com.anes.server.auth.dto.FirebaseAuthRequest;
import com.anes.server.auth.dto.FirebaseAuthResponse;
import com.anes.server.auth.service.AuditLogService;
import com.anes.server.auth.service.FirebaseTokenExchangeService;
import com.anes.server.auth.util.CloudflareIpResolver;
import com.anes.server.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuditLogService auditLogService;

    // Optional — only present when anes.firebase.enabled=true
    @Autowired(required = false)
    private FirebaseTokenExchangeService firebaseTokenExchangeService;

    public AuthController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @PostMapping("/firebase")
    public ResponseEntity<ApiResponse<FirebaseAuthResponse>> firebaseAuth(
            @Valid @RequestBody FirebaseAuthRequest request,
            HttpServletRequest httpRequest) {
        if (firebaseTokenExchangeService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("SERVICE_UNAVAILABLE", "Firebase authentication is not enabled."));
        }

        String clientIp = CloudflareIpResolver.resolve(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FirebaseTokenExchangeService.ExchangeResult result = firebaseTokenExchangeService
                .exchangeToken(request.idToken());

        Long userId = result.response().user().id();

        if (result.newUser()) {
            auditLogService.logEvent(AuditLogService.ACCOUNT_CREATED, userId, clientIp, userAgent,
                    java.util.Map.of("provider", "firebase"));
        } else {
            auditLogService.logEvent(AuditLogService.AUTH_SUCCESS, userId, clientIp, userAgent,
                    java.util.Map.of("provider", "firebase"));
        }

        HttpStatus status = result.newUser() ? HttpStatus.CREATED : HttpStatus.OK;
        String message = result.newUser() ? "Account created successfully." : "Authentication successful.";

        return ResponseEntity.status(status)
                .body(ApiResponse.success(result.response(), message));
    }

}
