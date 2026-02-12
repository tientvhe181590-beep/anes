-- =============================================================
-- ANES V2 Auth, Payment, and AI Usage Tables + Seed Data
-- =============================================================

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_refresh_tokens_user (user_id),
    INDEX idx_refresh_tokens_token (token)
);

-- PASSWORD RESET TOKENS
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_password_reset_user (user_id)
);

-- USER SUBSCRIPTIONS
CREATE TABLE user_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    start_date DATE NOT NULL,
    end_date DATE,
    payment_provider VARCHAR(100),
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_subscriptions_user (user_id)
);

-- PAYMENTS
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subscription_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    transaction_id VARCHAR(255),
    payment_provider VARCHAR(100),
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_transaction (transaction_id)
);

-- AI USAGE LOGS
CREATE TABLE ai_usage_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    input_tokens INT NOT NULL DEFAULT 0,
    output_tokens INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_ai_usage_user (user_id)
);

-- =============================================================
-- SEED DATA: Health Conditions
-- =============================================================

INSERT INTO health_conditions (name, type, description) VALUES
-- Injuries
('Knee Injury', 'INJURY', 'Injury affecting the knee joint, ligaments, or surrounding tissues'),
('Back Pain', 'INJURY', 'Pain or discomfort in the lower, middle, or upper back'),
('Shoulder Injury', 'INJURY', 'Injury affecting the shoulder joint or rotator cuff'),
('Ankle Injury', 'INJURY', 'Sprain, strain, or other injury to the ankle'),
('Wrist Injury', 'INJURY', 'Injury affecting the wrist joint or carpal tunnel'),
('Hip Injury', 'INJURY', 'Pain or injury in the hip joint area'),
('Neck Pain', 'INJURY', 'Pain or stiffness in the neck region'),

-- Medical Conditions
('Asthma', 'MEDICAL', 'Chronic respiratory condition affecting breathing during exercise'),
('Diabetes', 'MEDICAL', 'Metabolic condition requiring blood sugar management during exercise'),
('Heart Condition', 'MEDICAL', 'Cardiovascular condition requiring exercise intensity monitoring'),
('High Blood Pressure', 'MEDICAL', 'Hypertension requiring careful exercise programming'),
('Arthritis', 'MEDICAL', 'Joint inflammation affecting range of motion and exercise selection'),

-- Allergies
('Nuts', 'ALLERGY', 'Allergy to tree nuts and/or peanuts'),
('Dairy', 'ALLERGY', 'Lactose intolerance or dairy protein allergy'),
('Gluten', 'ALLERGY', 'Celiac disease or gluten sensitivity'),
('Soy', 'ALLERGY', 'Allergy to soy-based products'),
('Eggs', 'ALLERGY', 'Allergy to eggs or egg-based products'),
('Shellfish', 'ALLERGY', 'Allergy to shellfish and crustaceans'),
('Fish', 'ALLERGY', 'Allergy to fish');
