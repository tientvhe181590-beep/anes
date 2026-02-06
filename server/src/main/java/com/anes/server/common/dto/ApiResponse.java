package com.anes.server.common.dto;

import java.util.Map;

/**
 * Standard API response envelope.
 * All endpoints return this structure for consistency.
 */
public record ApiResponse<T>(
        boolean ok,
        T data,
        Meta meta,
        ApiError error) {
    public record Meta(int page, int size, long total) {
    }

    public record ApiError(String code, String message, Map<String, String> details) {
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> ok(T data, Meta meta) {
        return new ApiResponse<>(true, data, meta, null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, null, null, new ApiError(code, message, null));
    }

    public static <T> ApiResponse<T> error(String code, String message, Map<String, String> details) {
        return new ApiResponse<>(false, null, null, new ApiError(code, message, details));
    }
}
