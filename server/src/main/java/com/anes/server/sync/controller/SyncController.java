package com.anes.server.sync.controller;

import com.anes.server.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

/**
 * RxDB Replication Protocol endpoint.
 * Handles push (client -> server) and pull (server -> client) sync operations.
 */
@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    /**
     * Push endpoint: Client sends local changes to server.
     */
    @PostMapping("/push")
    public ResponseEntity<ApiResponse<Map<String, Object>>> push(
            @RequestBody Map<String, Object> pushPayload) {
        // TODO: Implement push replication logic
        return ResponseEntity.ok(ApiResponse.ok(Map.of("conflicts", Collections.emptyList())));
    }

    /**
     * Pull endpoint: Client requests changes since a checkpoint.
     */
    @GetMapping("/pull")
    public ResponseEntity<ApiResponse<Map<String, Object>>> pull(
            @RequestParam(required = false, defaultValue = "1970-01-01T00:00:00Z") String since,
            @RequestParam(required = false, defaultValue = "100") int limit) {
        // TODO: Implement pull replication logic
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "documents", Collections.emptyList(),
                "checkpoint", Map.of("updatedAt", since, "id", ""))));
    }
}
