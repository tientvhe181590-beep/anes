-- Auth identity mapping: links Firebase UIDs to internal user IDs
-- Supports multiple identity providers per user (email/password, Google, etc.)

CREATE TABLE auth_identities (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    provider    VARCHAR(50)  NOT NULL,
    provider_uid VARCHAR(255) NOT NULL,
    email       VARCHAR(150),
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT fk_auth_identities_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_provider_provider_uid UNIQUE (provider, provider_uid),
    INDEX idx_auth_identities_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
