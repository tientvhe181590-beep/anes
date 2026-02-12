package com.anes.server.config;

import com.anes.server.auth.filter.FirebaseTokenFilter;
import com.anes.server.auth.filter.JwtAuthenticationFilter;
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
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties({JwtProperties.class, FirebaseProperties.class})
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final FirebaseProperties firebaseProperties;

    // Optional — only present when anes.firebase.enabled=true
    @Autowired(required = false)
    private FirebaseTokenFilter firebaseTokenFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            FirebaseProperties firebaseProperties
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.firebaseProperties = firebaseProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Choose the active auth filter based on the feature flag
        OncePerRequestFilter activeFilter = (firebaseProperties.enabled() && firebaseTokenFilter != null)
                ? firebaseTokenFilter
                : jwtAuthenticationFilter;

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/actuator/health").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(activeFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
