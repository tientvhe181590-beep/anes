package com.anes.server.auth.util;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility that extracts the real client IP, preferring
 * Cloudflare's {@code CF-Connecting-IP} header when present.
 * <p>
 * Falls back to {@code X-Forwarded-For} first element, then
 * the direct remote address.
 */
public final class CloudflareIpResolver {

    private static final Logger log = LoggerFactory.getLogger(CloudflareIpResolver.class);

    private static final String CF_CONNECTING_IP = "CF-Connecting-IP";
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";

    private CloudflareIpResolver() {
    }

    /**
     * Resolve the client IP address from the request.
     * Priority: CF-Connecting-IP → X-Forwarded-For (first entry) → remoteAddr.
     */
    public static String resolve(HttpServletRequest request) {
        // 1. Cloudflare sets this header when proxying
        String cfIp = request.getHeader(CF_CONNECTING_IP);
        if (isValidIp(cfIp)) {
            return cfIp.trim();
        }

        // 2. Standard proxy header
        String xff = request.getHeader(X_FORWARDED_FOR);
        if (xff != null && !xff.isBlank()) {
            String firstIp = xff.split(",")[0].trim();
            if (isValidIp(firstIp)) {
                return firstIp;
            }
        }

        // 3. Direct connection
        return request.getRemoteAddr();
    }

    /**
     * Basic IP validation — non-empty and looks like an IP (v4 or v6).
     */
    private static boolean isValidIp(String ip) {
        if (ip == null || ip.isBlank())
            return false;
        String trimmed = ip.trim();
        // IPv4: digits and dots, IPv6: hex and colons
        return trimmed.matches("^[0-9]{1,3}(\\.[0-9]{1,3}){3}$")
                || trimmed.contains(":");
    }
}
