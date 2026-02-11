package com.anes.server.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.security.authentication.BadCredentialsException;

@Service
public class GoogleTokenVerifier {

    private final RestClient restClient;

    public GoogleTokenVerifier(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://oauth2.googleapis.com")
                .build();
    }

    public GoogleTokenInfo verify(String idToken) {
        try {
            GoogleTokenInfo response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tokeninfo")
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .body(GoogleTokenInfo.class);

            if (response == null || response.email() == null) {
                throw new BadCredentialsException("Invalid Google authentication token.");
            }

            return response;
        } catch (RestClientException ex) {
            throw new BadCredentialsException("Invalid Google authentication token.");
        }
    }

    public record GoogleTokenInfo(String sub, String email, String name) {
    }
}
