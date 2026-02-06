-- ============================================================================
-- V1: Initial ANES Schema (Sync-Ready)
-- All tables use UUID (VARCHAR(36)) primary keys for offline-first RxDB sync.
-- All tables include updated_at, created_at, and deleted (soft-delete) fields.
-- Compatible with both H2 (dev, MODE=MYSQL) and MySQL (prod).
-- NOTE: ON UPDATE CURRENT_TIMESTAMP is not supported by H2;
--       updatedAt is managed by JPA @PreUpdate / @UpdateTimestamp instead.
-- ============================================================================

-- USERS
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    gender VARCHAR(10),
    date_of_birth DATE,
    role VARCHAR(10) NOT NULL DEFAULT 'member',
    membership_tier VARCHAR(10) NOT NULL DEFAULT 'Free',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_updated_deleted ON users (updated_at, deleted);

-- USER PHYSICAL STATS
CREATE TABLE user_physical_stats (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(5,2),
    bmr DECIMAL(7,2),
    activity_level VARCHAR(10),
    recorded_at DATE,
    health_data CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_ups_user ON user_physical_stats (user_id);
CREATE INDEX idx_ups_updated_deleted ON user_physical_stats (updated_at, deleted);

-- USER PREFERENCES
CREATE TABLE user_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    goal_type VARCHAR(20),
    target_weight DECIMAL(5,2),
    sessions_per_week INT,
    available_tools TEXT,
    target_muscle_groups TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_uprefs_updated_deleted ON user_preferences (updated_at, deleted);

-- HEALTH CONDITIONS
CREATE TABLE health_conditions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_hc_updated_deleted ON health_conditions (updated_at, deleted);

-- SYMPTOMS (AI Knowledge Base)
CREATE TABLE symptoms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_sym_updated_deleted ON symptoms (updated_at, deleted);

-- CONDITION SYMPTOMS (Mapping)
CREATE TABLE condition_symptoms (
    id VARCHAR(36) PRIMARY KEY,
    condition_id VARCHAR(36) NOT NULL,
    symptom_id VARCHAR(36) NOT NULL,
    significance VARCHAR(15) DEFAULT 'Primary',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id),
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id),
    CONSTRAINT uk_condition_symptom UNIQUE (condition_id, symptom_id)
);
CREATE INDEX idx_cs_updated_deleted ON condition_symptoms (updated_at, deleted);

-- HEALTH RECOMMENDATIONS (AI Knowledge Base)
CREATE TABLE health_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    condition_id VARCHAR(36) NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    verified_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id)
);
CREATE INDEX idx_hr_updated_deleted ON health_recommendations (updated_at, deleted);

-- USER HEALTH CONSTRAINTS
CREATE TABLE user_health_constraints (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    condition_id VARCHAR(36) NOT NULL,
    severity_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id),
    CONSTRAINT uk_user_condition UNIQUE (user_id, condition_id)
);
CREATE INDEX idx_uhc_updated_deleted ON user_health_constraints (updated_at, deleted);

-- WORKOUT PROGRAMS
CREATE TABLE workout_programs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    duration_weeks INT,
    level VARCHAR(15) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_wp_updated_deleted ON workout_programs (updated_at, deleted);

-- WORKOUT TEMPLATES
CREATE TABLE workout_templates (
    id VARCHAR(36) PRIMARY KEY,
    program_id VARCHAR(36) NOT NULL,
    day_number INT NOT NULL,
    focus_area VARCHAR(255),
    estimated_duration_mins INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (program_id) REFERENCES workout_programs(id)
);
CREATE INDEX idx_wt_program ON workout_templates (program_id);
CREATE INDEX idx_wt_updated_deleted ON workout_templates (updated_at, deleted);

-- EXERCISES
CREATE TABLE exercises (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(15) NOT NULL,
    video_url VARCHAR(500),
    is_downloadable BOOLEAN DEFAULT FALSE,
    video_source VARCHAR(15) DEFAULT 'YouTube',
    calories_per_min DECIMAL(6,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_ex_updated_deleted ON exercises (updated_at, deleted);

-- WORKOUT TEMPLATE EXERCISES
CREATE TABLE workout_template_exercises (
    id VARCHAR(36) PRIMARY KEY,
    template_id VARCHAR(36) NOT NULL,
    exercise_id VARCHAR(36) NOT NULL,
    order_index INT NOT NULL,
    target_reps INT,
    target_duration_sec INT,
    rest_time_sec INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
CREATE INDEX idx_wte_template ON workout_template_exercises (template_id);
CREATE INDEX idx_wte_updated_deleted ON workout_template_exercises (updated_at, deleted);

-- USER WORKOUT SCHEDULE
CREATE TABLE user_workout_schedule (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36) NOT NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(15) NOT NULL,
    completed_at TIMESTAMP,
    total_calories_burned DECIMAL(7,2),
    rating INT,
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES workout_templates(id)
);
CREATE INDEX idx_uws_user_date ON user_workout_schedule (user_id, scheduled_date);
CREATE INDEX idx_uws_updated_deleted ON user_workout_schedule (updated_at, deleted);

-- INGREDIENTS
CREATE TABLE ingredients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories_per_100g DECIMAL(6,2),
    protein_per_100g DECIMAL(6,2),
    carbs_per_100g DECIMAL(6,2),
    fat_per_100g DECIMAL(6,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_ing_updated_deleted ON ingredients (updated_at, deleted);

-- RECIPES
CREATE TABLE recipes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions TEXT,
    total_calories DECIMAL(7,2),
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_rec_updated_deleted ON recipes (updated_at, deleted);

-- RECIPE INGREDIENTS
CREATE TABLE recipe_ingredients (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL,
    ingredient_id VARCHAR(36) NOT NULL,
    amount_grams DECIMAL(7,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
CREATE INDEX idx_ri_recipe ON recipe_ingredients (recipe_id);
CREATE INDEX idx_ri_updated_deleted ON recipe_ingredients (updated_at, deleted);

-- USER DAILY NUTRITION
CREATE TABLE user_daily_nutrition (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    total_calories_intake DECIMAL(7,2),
    total_protein DECIMAL(7,2),
    total_carbs DECIMAL(7,2),
    total_fat DECIMAL(7,2),
    metrics_data CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_udn_user_date ON user_daily_nutrition (user_id, date);
CREATE INDEX idx_udn_updated_deleted ON user_daily_nutrition (updated_at, deleted);

-- CHAT LOGS
CREATE TABLE chat_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message_content TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_cl_user_ts ON chat_logs (user_id, timestamp);
CREATE INDEX idx_cl_updated_deleted ON chat_logs (updated_at, deleted);

-- WORKOUT SESSION EXERCISES (Actual Log)
CREATE TABLE workout_session_exercises (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL,
    exercise_id VARCHAR(36) NOT NULL,
    is_extra BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (schedule_id) REFERENCES user_workout_schedule(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
CREATE INDEX idx_wse_schedule ON workout_session_exercises (schedule_id);
CREATE INDEX idx_wse_updated_deleted ON workout_session_exercises (updated_at, deleted);

-- WORKOUT SESSION SETS (Actual Log)
CREATE TABLE workout_session_sets (
    id VARCHAR(36) PRIMARY KEY,
    session_exercise_id VARCHAR(36) NOT NULL,
    set_number INT NOT NULL,
    reps INT,
    weight_kg DECIMAL(6,2),
    duration_sec INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (session_exercise_id) REFERENCES workout_session_exercises(id)
);
CREATE INDEX idx_wss_session_exercise ON workout_session_sets (session_exercise_id);
CREATE INDEX idx_wss_updated_deleted ON workout_session_sets (updated_at, deleted);