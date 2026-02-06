package com.anes.server.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {

    private String secret;
    private long accessTokenExpiryMs = 900_000; // 15 min
    private long refreshTokenExpiryMs = 604_800_000; // 7 days
}
