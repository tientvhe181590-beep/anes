package com.anes.server.auth.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class CloudflareIpResolverTest {

    @Test
    @DisplayName("returns CF-Connecting-IP when present")
    void prefersCloudflareHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("CF-Connecting-IP", "203.0.113.50");
        request.addHeader("X-Forwarded-For", "10.0.0.1, 172.16.0.1");
        request.setRemoteAddr("127.0.0.1");

        String ip = CloudflareIpResolver.resolve(request);

        assertThat(ip).isEqualTo("203.0.113.50");
    }

    @Test
    @DisplayName("falls back to X-Forwarded-For when CF header absent")
    void fallsBackToXForwardedFor() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "198.51.100.10, 172.16.0.1");
        request.setRemoteAddr("127.0.0.1");

        String ip = CloudflareIpResolver.resolve(request);

        assertThat(ip).isEqualTo("198.51.100.10");
    }

    @Test
    @DisplayName("falls back to remoteAddr when no proxy headers")
    void fallsBackToRemoteAddr() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.100");

        String ip = CloudflareIpResolver.resolve(request);

        assertThat(ip).isEqualTo("192.168.1.100");
    }

    @Test
    @DisplayName("handles single IP in X-Forwarded-For")
    void singleXForwardedFor() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "10.0.0.5");
        request.setRemoteAddr("127.0.0.1");

        String ip = CloudflareIpResolver.resolve(request);

        assertThat(ip).isEqualTo("10.0.0.5");
    }

    @Test
    @DisplayName("ignores blank CF-Connecting-IP and uses X-Forwarded-For")
    void blankCfHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("CF-Connecting-IP", "   ");
        request.addHeader("X-Forwarded-For", "10.0.0.5");
        request.setRemoteAddr("127.0.0.1");

        String ip = CloudflareIpResolver.resolve(request);

        assertThat(ip).isEqualTo("10.0.0.5");
    }

    @Test
    @DisplayName("handles IPv6 CF-Connecting-IP")
    void ipv6CloudflareHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("CF-Connecting-IP", "2001:db8::1");
        request.setRemoteAddr("127.0.0.1");

        String ip = CloudflareIpResolver.resolve(request);

        assertThat(ip).isEqualTo("2001:db8::1");
    }

    @Test
    @DisplayName("ignores invalid CF-Connecting-IP and falls back")
    void invalidCfHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("CF-Connecting-IP", "not-an-ip");
        request.setRemoteAddr("192.168.1.1");

        String ip = CloudflareIpResolver.resolve(request);

        // Should fall back since "not-an-ip" doesn't match IP pattern
        assertThat(ip).isEqualTo("192.168.1.1");
    }
}
