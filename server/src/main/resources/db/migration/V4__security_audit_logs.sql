CREATE TABLE `security_audit_logs` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `event_type`  VARCHAR(50)  NOT NULL,
    `user_id`     BIGINT       NULL,
    `ip_address`  VARCHAR(45)  NOT NULL,
    `user_agent`  VARCHAR(500) NULL,
    `details`     TEXT         NULL,
    `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `idx_audit_event_type_created` (`event_type`, `created_at`),
    INDEX `idx_audit_user_id` (`user_id`),
    CONSTRAINT `fk_audit_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL
);
