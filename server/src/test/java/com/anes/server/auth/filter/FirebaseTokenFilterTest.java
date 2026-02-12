package com.anes.server.auth.filter;

import com.anes.server.auth.entity.AuthIdentity;
import com.anes.server.auth.repository.AuthIdentityRepository;
import com.anes.server.auth.service.FirebaseAuthService;
import com.anes.server.user.entity.Role;
import com.anes.server.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirebaseTokenFilterTest {

    @Mock
    private FirebaseAuthService firebaseAuthService;

    @Mock
    private AuthIdentityRepository authIdentityRepository;

    @Mock
    private FilterChain filterChain;

    private FirebaseTokenFilter filter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        filter = new FirebaseTokenFilter(firebaseAuthService, authIdentityRepository, objectMapper);
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("shouldNotFilter: whitelisted paths are skipped")
    void shouldNotFilter_whitelistedPaths() {
        MockHttpServletRequest authRequest = new MockHttpServletRequest("POST", "/api/v1/auth/firebase");
        MockHttpServletRequest healthRequest = new MockHttpServletRequest("GET", "/actuator/health");

        assertThat(filter.shouldNotFilter(authRequest)).isTrue();
        assertThat(filter.shouldNotFilter(healthRequest)).isTrue();
    }

    @Test
    @DisplayName("shouldNotFilter: protected paths are not skipped")
    void shouldNotFilter_protectedPaths() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        assertThat(filter.shouldNotFilter(request)).isFalse();
    }

    @Test
    @DisplayName("doFilterInternal: missing Authorization header returns 401")
    void doFilter_missingHeader_returns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("Authentication required");
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("doFilterInternal: non-Bearer header returns 401")
    void doFilter_nonBearerHeader_returns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        request.addHeader("Authorization", "Basic abc123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("doFilterInternal: valid token sets SecurityContext with authorities")
    void doFilter_validToken_setsAuthentication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        request.addHeader("Authorization", "Bearer valid-firebase-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FirebaseToken mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("fb-uid-123");
        when(firebaseAuthService.verifyIdToken("valid-firebase-token")).thenReturn(mockToken);
        when(firebaseAuthService.extractProvider(mockToken)).thenReturn("firebase");

        User user = new User();
        user.setId(42L);
        user.setRole(Role.MEMBER);
        user.setDeleted(false);

        AuthIdentity identity = new AuthIdentity(user, "firebase", "fb-uid-123", "user@test.com");

        when(authIdentityRepository.findByProviderAndProviderUid("firebase", "fb-uid-123"))
                .thenReturn(Optional.of(identity));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(filterChain).doFilter(request, response);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo(42L);
        assertThat(auth.getAuthorities()).hasSize(1);
        assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_MEMBER");
    }

    @Test
    @DisplayName("doFilterInternal: expired token returns 401")
    void doFilter_expiredToken_returns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        request.addHeader("Authorization", "Bearer expired-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(firebaseAuthService.verifyIdToken("expired-token"))
                .thenThrow(new BadCredentialsException("Token has expired"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("Token has expired");
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("doFilterInternal: malformed token returns 401")
    void doFilter_malformedToken_returns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        request.addHeader("Authorization", "Bearer malformed-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(firebaseAuthService.verifyIdToken("malformed-token"))
                .thenThrow(new BadCredentialsException("Invalid authentication token"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("Invalid authentication token");
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("doFilterInternal: valid token but no identity mapping returns 401")
    void doFilter_noIdentityMapping_returns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        request.addHeader("Authorization", "Bearer valid-token-no-mapping");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FirebaseToken mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("unknown-uid");
        when(firebaseAuthService.verifyIdToken("valid-token-no-mapping")).thenReturn(mockToken);
        when(firebaseAuthService.extractProvider(mockToken)).thenReturn("firebase");

        when(authIdentityRepository.findByProviderAndProviderUid(anyString(), anyString()))
                .thenReturn(Optional.empty());

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("User not found");
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    @DisplayName("doFilterInternal: deleted user returns 401")
    void doFilter_deletedUser_returns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/workouts");
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FirebaseToken mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("fb-uid-deleted");
        when(firebaseAuthService.verifyIdToken("valid-token")).thenReturn(mockToken);
        when(firebaseAuthService.extractProvider(mockToken)).thenReturn("firebase");

        User deletedUser = new User();
        deletedUser.setId(99L);
        deletedUser.setRole(Role.MEMBER);
        deletedUser.setDeleted(true);

        AuthIdentity identity = new AuthIdentity(deletedUser, "firebase", "fb-uid-deleted", "deleted@test.com");

        when(authIdentityRepository.findByProviderAndProviderUid("firebase", "fb-uid-deleted"))
                .thenReturn(Optional.of(identity));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("deactivated");
        verify(filterChain, never()).doFilter(request, response);
    }
}
