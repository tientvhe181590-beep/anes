-- ============================================================================
-- V2: Authentication & Payment Tables
-- Adds JWT refresh tokens, membership tiers, subscriptions, payments,
-- and system messages for admin broadcasts.
-- Compatible with both H2 (dev, MODE=MYSQL) and MySQL (prod).
-- ============================================================================

-- REFRESH TOKENS (JWT Session Management)
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_rt_token ON refresh_tokens (token);
CREATE INDEX idx_rt_user ON refresh_tokens (user_id);
CREATE INDEX idx_rt_updated_deleted ON refresh_tokens (updated_at, deleted);

-- MEMBERSHIP TIERS
CREATE TABLE membership_tiers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duration_days INT NOT NULL DEFAULT 30,
    features CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_mt_updated_deleted ON membership_tiers (updated_at, deleted);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    tier_id VARCHAR(36) NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'Pending',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tier_id) REFERENCES membership_tiers(id)
);
CREATE INDEX idx_sub_user ON subscriptions (user_id);
CREATE INDEX idx_sub_status ON subscriptions (status);
CREATE INDEX idx_sub_updated_deleted ON subscriptions (updated_at, deleted);

-- PAYMENTS (VNPAY Integration)
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subscription_id VARCHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    vnpay_txn_ref VARCHAR(255),
    vnpay_transaction_no VARCHAR(255),
    vnpay_response_code VARCHAR(10),
    status VARCHAR(15) NOT NULL DEFAULT 'Pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
CREATE INDEX idx_pay_user ON payments (user_id);
CREATE INDEX idx_pay_vnpay_ref ON payments (vnpay_txn_ref);
CREATE INDEX idx_pay_status ON payments (status);
CREATE INDEX idx_pay_updated_deleted ON payments (updated_at, deleted);

-- SYSTEM MESSAGES (Admin Broadcasts)
CREATE TABLE system_messages (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(15) NOT NULL DEFAULT 'Info',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_sm_active ON system_messages (active, starts_at, expires_at);
CREATE INDEX idx_sm_updated_deleted ON system_messages (updated_at, deleted);

-- Seed default membership tiers
INSERT INTO membership_tiers (id, name, price, duration_days, features) VALUES
    ('tier-free-default', 'Free', 0.00, 36500, '{"ingredient_scans_per_day": 3, "ai_chat": true, "offline_mode": false, "video_download": false}');
INSERT INTO membership_tiers (id, name, price, duration_days, features) VALUES
    ('tier-premium-default', 'Premium', 99000.00, 30, '{"ingredient_scans_per_day": -1, "ai_chat": true, "offline_mode": true, "video_download": true}');
