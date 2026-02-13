package com.anes.server.analytics;

import com.anes.server.config.PostHogProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostHogServiceTest {

    @Mock
    private RestClient restClient;
    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;
    @Mock
    private RestClient.RequestBodySpec requestBodySpec;
    @Mock
    private RestClient.ResponseSpec responseSpec;

    @Captor
    private ArgumentCaptor<Object> bodyCaptor;

    private PostHogService postHogService;

    @BeforeEach
    void setUp() {
        PostHogProperties props = new PostHogProperties("phc_testkey123", "https://us.i.posthog.com");
        // Use a builder that returns our mock restClient
        RestClient.Builder builder = mock(RestClient.Builder.class);
        when(builder.build()).thenReturn(restClient);
        postHogService = new PostHogService(props, builder);
    }

    @Test
    @DisplayName("capture sends POST to /capture/ with correct payload")
    void captureSuccess() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toBodilessEntity()).thenReturn(null);

        postHogService.capture("server_rate_limit_hit", "server",
                Map.of("endpoint", "/api/v1/auth", "ip_hash", "abc123"));

        verify(requestBodyUriSpec).uri("https://us.i.posthog.com/capture/");
        verify(requestBodySpec).body(bodyCaptor.capture());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) bodyCaptor.getValue();
        assertThat(body).containsEntry("api_key", "phc_testkey123");
        assertThat(body).containsEntry("event", "server_rate_limit_hit");
        assertThat(body).containsEntry("distinct_id", "server");

        @SuppressWarnings("unchecked")
        Map<String, Object> props = (Map<String, Object>) body.get("properties");
        assertThat(props).containsEntry("endpoint", "/api/v1/auth");
        assertThat(props).containsEntry("ip_hash", "abc123");
    }

    @Test
    @DisplayName("capture is a no-op when API key is not configured")
    void captureDisabledNoApiKey() {
        PostHogProperties disabledProps = new PostHogProperties("", "https://us.i.posthog.com");
        RestClient.Builder builder = mock(RestClient.Builder.class);
        when(builder.build()).thenReturn(restClient);
        PostHogService disabledService = new PostHogService(disabledProps, builder);

        disabledService.capture("test_event", "server", Map.of("key", "value"));

        // Should never touch RestClient
        verifyNoInteractions(restClient);
    }

    @Test
    @DisplayName("capture is a no-op when API key is null")
    void captureDisabledNullApiKey() {
        PostHogProperties disabledProps = new PostHogProperties(null, "https://us.i.posthog.com");
        RestClient.Builder builder = mock(RestClient.Builder.class);
        when(builder.build()).thenReturn(restClient);
        PostHogService disabledService = new PostHogService(disabledProps, builder);

        disabledService.capture("test_event", "server", Map.of());

        verifyNoInteractions(restClient);
    }

    @Test
    @DisplayName("capture swallows exceptions — fire and forget")
    void captureHandlesApiFailure() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenThrow(new RuntimeException("Connection refused"));

        assertThatCode(() ->
                postHogService.capture("server_auth_failure", "server", Map.of("reason", "bad token")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("capture sends empty properties map when null props provided")
    void captureWithNullProperties() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toBodilessEntity()).thenReturn(null);

        postHogService.capture("test_event", "server", null);

        verify(requestBodySpec).body(bodyCaptor.capture());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) bodyCaptor.getValue();
        assertThat(body.get("properties")).isEqualTo(Map.of());
    }

    // --- hashIp tests --------------------------------------------------------

    @Test
    @DisplayName("hashIp returns deterministic SHA-256 hex string")
    void hashIpDeterministic() {
        String hash1 = PostHogService.hashIp("203.0.113.50");
        String hash2 = PostHogService.hashIp("203.0.113.50");

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64); // SHA-256 → 32 bytes → 64 hex chars
    }

    @Test
    @DisplayName("hashIp returns different hashes for different IPs")
    void hashIpDifferentInputs() {
        String hash1 = PostHogService.hashIp("203.0.113.50");
        String hash2 = PostHogService.hashIp("203.0.113.51");

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    @DisplayName("hashIp returns 'unknown' for null or blank IP")
    void hashIpNullOrBlank() {
        assertThat(PostHogService.hashIp(null)).isEqualTo("unknown");
        assertThat(PostHogService.hashIp("")).isEqualTo("unknown");
        assertThat(PostHogService.hashIp("   ")).isEqualTo("unknown");
    }
}
