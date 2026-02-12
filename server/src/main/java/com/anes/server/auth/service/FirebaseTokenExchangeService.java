package com.anes.server.auth.service;

import com.anes.server.auth.dto.AuthUserDto;
import com.anes.server.auth.dto.FirebaseAuthResponse;
import com.anes.server.auth.entity.AuthIdentity;
import com.anes.server.auth.repository.AuthIdentityRepository;
import com.anes.server.user.entity.Role;
import com.anes.server.user.entity.User;
import com.anes.server.user.repository.UserRepository;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(name = "anes.firebase.enabled", havingValue = "true")
public class FirebaseTokenExchangeService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenExchangeService.class);

    private final FirebaseAuthService firebaseAuthService;
    private final AuthIdentityRepository authIdentityRepository;
    private final UserRepository userRepository;

    public FirebaseTokenExchangeService(
            FirebaseAuthService firebaseAuthService,
            AuthIdentityRepository authIdentityRepository,
            UserRepository userRepository) {
        this.firebaseAuthService = firebaseAuthService;
        this.authIdentityRepository = authIdentityRepository;
        this.userRepository = userRepository;
    }

    /**
     * Exchange result carrying the auth response and whether the user was newly
     * created.
     */
    public record ExchangeResult(FirebaseAuthResponse response, boolean newUser) {
    }

    /**
     * Verifies a Firebase ID token and finds-or-creates the internal user.
     * Creates an auth_identities row if not already present.
     *
     * @param idToken Firebase ID token from the client
     * @return ExchangeResult with auth response and newUser flag
     */
    @Transactional
    public ExchangeResult exchangeToken(String idToken) {
        FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);

        String uid = decodedToken.getUid();
        String email = firebaseAuthService.extractEmail(decodedToken);
        String displayName = firebaseAuthService.extractDisplayName(decodedToken);
        String provider = firebaseAuthService.extractProvider(decodedToken);
        String pictureUrl = firebaseAuthService.extractPictureUrl(decodedToken);

        // 1. Check if identity mapping already exists
        var existingIdentity = authIdentityRepository.findByProviderAndProviderUid(provider, uid);
        if (existingIdentity.isPresent()) {
            User user = existingIdentity.get().getUser();
            // Update profile image if not yet set (e.g. existing user links a Google
            // account)
            if (user.getProfileImageUrl() == null && pictureUrl != null) {
                user.setProfileImageUrl(pictureUrl);
                userRepository.save(user);
            }
            log.info("Existing user found via auth identity: userId={}, provider={}", user.getId(), provider);
            return new ExchangeResult(buildResponse(user), false);
        }

        // 2. Check if a user with this email already exists (account linking)
        boolean newUser = false;
        User user = userRepository.findByEmailAndDeletedFalse(email).orElse(null);

        if (user == null) {
            // 3. Create new user
            user = new User();
            user.setEmail(email);
            user.setFullName(displayName != null ? displayName : "");
            user.setPasswordHash(null); // Firebase-managed auth, no server password
            user.setProfileImageUrl(pictureUrl);
            user.setRole(Role.MEMBER);
            user.setOnboardingComplete(false);
            user.setPremium(false);
            user = userRepository.save(user);
            newUser = true;
            log.info("New user created from Firebase auth: userId={}, email={}", user.getId(), email);
        } else {
            // Update profile image if not yet set during account linking
            if (user.getProfileImageUrl() == null && pictureUrl != null) {
                user.setProfileImageUrl(pictureUrl);
                userRepository.save(user);
            }
            log.info("Existing user linked to Firebase auth: userId={}, email={}", user.getId(), email);
        }

        // 4. Create auth identity mapping
        AuthIdentity identity = new AuthIdentity(user, provider, uid, email);
        authIdentityRepository.save(identity);

        return new ExchangeResult(buildResponse(user), newUser);
    }

    private FirebaseAuthResponse buildResponse(User user) {
        AuthUserDto userDto = new AuthUserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isOnboardingComplete());
        return new FirebaseAuthResponse(userDto);
    }
}
