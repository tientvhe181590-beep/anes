package com.anes.server.auth.service;

import com.anes.server.auth.dto.FirebaseAuthResponse;
import com.anes.server.auth.entity.AuthIdentity;
import com.anes.server.auth.repository.AuthIdentityRepository;
import com.anes.server.user.entity.Role;
import com.anes.server.user.entity.User;
import com.anes.server.user.repository.UserRepository;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FirebaseTokenExchangeServiceTest {

    @Mock
    private FirebaseAuthService firebaseAuthService;

    @Mock
    private AuthIdentityRepository authIdentityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FirebaseToken decodedToken;

    private FirebaseTokenExchangeService service;

    @BeforeEach
    void setUp() {
        service = new FirebaseTokenExchangeService(
                firebaseAuthService, authIdentityRepository, userRepository);
    }

    private void stubTokenExtraction(String uid, String email, String displayName,
            String provider, String pictureUrl) {
        when(firebaseAuthService.verifyIdToken("id-token")).thenReturn(decodedToken);
        when(decodedToken.getUid()).thenReturn(uid);
        when(firebaseAuthService.extractEmail(decodedToken)).thenReturn(email);
        when(firebaseAuthService.extractDisplayName(decodedToken)).thenReturn(displayName);
        when(firebaseAuthService.extractProvider(decodedToken)).thenReturn(provider);
        when(firebaseAuthService.extractPictureUrl(decodedToken)).thenReturn(pictureUrl);
    }

    @Test
    void newGoogleUserCreatesAccountWithProfileImage() {
        stubTokenExtraction("goog-uid-1", "alice@gmail.com", "Alice",
                "google.com", "https://lh3.googleusercontent.com/photo.jpg");

        when(authIdentityRepository.findByProviderAndProviderUid("google.com", "goog-uid-1"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailAndDeletedFalse("alice@gmail.com"))
                .thenReturn(Optional.empty());

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("alice@gmail.com");
        savedUser.setFullName("Alice");
        savedUser.setRole(Role.MEMBER);
        savedUser.setOnboardingComplete(false);
        savedUser.setProfileImageUrl("https://lh3.googleusercontent.com/photo.jpg");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        var result = service.exchangeToken("id-token");

        assertThat(result.newUser()).isTrue();
        assertThat(result.response().user().email()).isEqualTo("alice@gmail.com");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User created = userCaptor.getValue();
        assertThat(created.getPasswordHash()).isNull();
        assertThat(created.getProfileImageUrl()).isEqualTo("https://lh3.googleusercontent.com/photo.jpg");

        verify(authIdentityRepository).save(any(AuthIdentity.class));
    }

    @Test
    void existingEmailUserLinksGoogleAccount() {
        stubTokenExtraction("goog-uid-2", "bob@example.com", "Bob",
                "google.com", "https://lh3.googleusercontent.com/bob.jpg");

        when(authIdentityRepository.findByProviderAndProviderUid("google.com", "goog-uid-2"))
                .thenReturn(Optional.empty());

        User existingUser = new User();
        existingUser.setId(42L);
        existingUser.setEmail("bob@example.com");
        existingUser.setFullName("Bob");
        existingUser.setRole(Role.MEMBER);
        existingUser.setOnboardingComplete(true);
        existingUser.setPasswordHash("hashed-pw"); // email/password user
        existingUser.setProfileImageUrl(null);
        when(userRepository.findByEmailAndDeletedFalse("bob@example.com"))
                .thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        var result = service.exchangeToken("id-token");

        assertThat(result.newUser()).isFalse();
        assertThat(result.response().user().email()).isEqualTo("bob@example.com");

        // Should set profile image on existing user
        verify(userRepository).save(existingUser);
        assertThat(existingUser.getProfileImageUrl()).isEqualTo("https://lh3.googleusercontent.com/bob.jpg");

        verify(authIdentityRepository).save(any(AuthIdentity.class));
    }

    @Test
    void returningGoogleUserSkipsCreation() {
        stubTokenExtraction("goog-uid-3", "carol@gmail.com", "Carol",
                "google.com", "https://lh3.googleusercontent.com/carol.jpg");

        User existingUser = new User();
        existingUser.setId(10L);
        existingUser.setEmail("carol@gmail.com");
        existingUser.setFullName("Carol");
        existingUser.setRole(Role.MEMBER);
        existingUser.setOnboardingComplete(true);
        existingUser.setProfileImageUrl("https://lh3.googleusercontent.com/carol.jpg");

        AuthIdentity identity = new AuthIdentity(existingUser, "google.com", "goog-uid-3",
                "carol@gmail.com");
        when(authIdentityRepository.findByProviderAndProviderUid("google.com", "goog-uid-3"))
                .thenReturn(Optional.of(identity));

        var result = service.exchangeToken("id-token");

        assertThat(result.newUser()).isFalse();
        assertThat(result.response().user().email()).isEqualTo("carol@gmail.com");

        // Should not create user or identity
        verify(userRepository, never()).save(any(User.class));
        verify(authIdentityRepository, never()).save(any(AuthIdentity.class));
    }
}
