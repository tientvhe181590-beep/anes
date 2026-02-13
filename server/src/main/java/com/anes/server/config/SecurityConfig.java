package com.anes.server.config;

import com.anes.server.auth.filter.FirebaseTokenFilter;
import com.anes.server.auth.filter.PayloadSizeFilter;
import com.anes.server.auth.filter.RateLimitFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties({ FirebaseProperties.class, RateLimitProperties.class })
public class SecurityConfig {

    private final RateLimitFilter rateLimitFilter;
    private final PayloadSizeFilter payloadSizeFilter;
    private final CorsConfigurationSource corsConfigurationSource;

        private final FirebaseTokenFilter firebaseTokenFilter;

    public SecurityConfig(
                        FirebaseTokenFilter firebaseTokenFilter,
            RateLimitFilter rateLimitFilter,
            PayloadSizeFilter payloadSizeFilter,
            CorsConfigurationSource corsConfigurationSource) {
                this.firebaseTokenFilter = firebaseTokenFilter;
        this.rateLimitFilter = rateLimitFilter;
        this.payloadSizeFilter = payloadSizeFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                OncePerRequestFilter activeFilter = firebaseTokenFilter;

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Security headers
                .headers(headers -> headers
                        .contentTypeOptions(cto -> {
                        }) // X-Content-Type-Options: nosniff
                        .frameOptions(fo -> fo.deny()) // X-Frame-Options: DENY
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        .xssProtection(xss -> xss.disable()) // X-XSS-Protection: 0
                        .referrerPolicy(rp -> rp.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .cacheControl(cc -> {
                        }) // Cache-Control: no-cache, no-store, ...
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/actuator/health").permitAll()
                        .anyRequest().authenticated())

                // Filter chain order: payload → rate-limit → auth
                .addFilterBefore(payloadSizeFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(rateLimitFilter, PayloadSizeFilter.class)
                .addFilterAfter(activeFilter, RateLimitFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
