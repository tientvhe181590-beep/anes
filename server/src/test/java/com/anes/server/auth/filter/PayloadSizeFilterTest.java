package com.anes.server.auth.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PayloadSizeFilterTest {

    @Mock
    private FilterChain filterChain;

    private PayloadSizeFilter filter;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() {
        filter = new PayloadSizeFilter(objectMapper);
    }

    @Test
    @DisplayName("request under auth limit passes through")
    void underAuthLimitPasses() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setContentType("application/json");
        request.setContent(new byte[5 * 1024]); // 5 KB, limit is 10 KB
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("request over auth limit returns 413")
    void overAuthLimitReturns413() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setContentType("application/json");
        request.setContent(new byte[11 * 1024]); // 11 KB, limit is 10 KB
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getContentAsString()).contains("PAYLOAD_TOO_LARGE");
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("sync push under 1MB passes through")
    void syncPushUnderLimitPasses() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/sync/push");
        request.setContentType("application/json");
        request.setContent(new byte[500 * 1024]); // 500 KB, limit is 1 MB
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("sync push over 1MB returns 413")
    void syncPushOverLimitReturns413() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/sync/push");
        request.setContentType("application/json");
        request.setContent(new byte[1100 * 1024]); // ~1.1 MB, limit is 1 MB
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(413);
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("AI endpoint under 50KB passes through")
    void aiUnderLimitPasses() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/ai/chat");
        request.setContentType("application/json");
        request.setContent(new byte[20 * 1024]); // 20 KB, limit is 50 KB
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("request with no Content-Length passes through")
    void noContentLengthPasses() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        // Don't set content — contentLengthLong will be -1
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("default limit (100KB) applies to unlisted paths")
    void defaultLimitApplies() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/workouts");
        request.setContentType("application/json");
        request.setContent(new byte[101 * 1024]); // 101 KB, default limit is 100 KB
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(413);
        verify(filterChain, never()).doFilter(request, response);
    }
}
