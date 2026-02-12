package com.anes.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableConfigurationProperties(FirebaseProperties.class)
@ConditionalOnProperty(name = "anes.firebase.enabled", havingValue = "true")
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Bean
    public FirebaseApp firebaseApp(FirebaseProperties properties) throws IOException {
        if (FirebaseApp.getApps().stream().anyMatch(app -> app.getName().equals(FirebaseApp.DEFAULT_APP_NAME))) {
            log.info("FirebaseApp already initialized, reusing existing instance.");
            return FirebaseApp.getInstance();
        }

        GoogleCredentials credentials = resolveCredentials(properties);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        FirebaseApp app = FirebaseApp.initializeApp(options);
        log.info("FirebaseApp initialized successfully.");
        return app;
    }

    private GoogleCredentials resolveCredentials(FirebaseProperties properties) throws IOException {
        // 1. Try FIREBASE_SERVICE_ACCOUNT env var (JSON string)
        String envJson = System.getenv("FIREBASE_SERVICE_ACCOUNT");
        if (envJson != null && !envJson.isBlank()) {
            log.info("Loading Firebase credentials from FIREBASE_SERVICE_ACCOUNT env var.");
            InputStream stream = new ByteArrayInputStream(envJson.getBytes(StandardCharsets.UTF_8));
            return GoogleCredentials.fromStream(stream);
        }

        // 2. Try configured file path
        if (properties.serviceAccountPath() != null && !properties.serviceAccountPath().isBlank()) {
            log.info("Loading Firebase credentials from file: {}", properties.serviceAccountPath());
            try (InputStream stream = new FileInputStream(properties.serviceAccountPath())) {
                return GoogleCredentials.fromStream(stream);
            }
        }

        throw new IllegalStateException(
                "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var (JSON string) "
                        + "or configure anes.firebase.service-account-path property.");
    }
}
