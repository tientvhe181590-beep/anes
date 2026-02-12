-- =============================================================
-- ANES V1 Initial Schema - 20 Core Tables
-- =============================================================

-- USERS
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    date_of_birth DATE,
    profile_image_url VARCHAR(500),
    role ENUM('MEMBER', 'ADMIN') NOT NULL DEFAULT 'MEMBER',
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- USER PHYSICAL STATS
CREATE TABLE user_physical_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(5,2),
    bmr DECIMAL(7,2),
    tdee DECIMAL(7,2),
    activity_level ENUM('LOW', 'MEDIUM', 'HIGH'),
    recorded_at DATE,
    health_data JSON,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_physical_stats_user (user_id)
);

-- USER PREFERENCES
CREATE TABLE user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    goal_type ENUM('WEIGHT_LOSS', 'MUSCLE_GAIN', 'STAY_FIT', 'WEIGHT_GAIN'),
    target_weight DECIMAL(5,2),
    sessions_per_week INT,
    training_location ENUM('HOME', 'GYM'),
    available_tools TEXT,
    target_muscle_groups TEXT,
    experience_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_preferences_user (user_id)
);

-- HEALTH CONDITIONS
CREATE TABLE health_conditions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('INJURY', 'MEDICAL', 'ALLERGY') NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SYMPTOMS
CREATE TABLE symptoms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CONDITION SYMPTOMS (Mapping)
CREATE TABLE condition_symptoms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    condition_id BIGINT NOT NULL,
    symptom_id BIGINT NOT NULL,
    significance ENUM('PRIMARY', 'SECONDARY', 'RARE') NOT NULL DEFAULT 'PRIMARY',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_condition_symptom (condition_id, symptom_id),
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id),
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id)
);

-- HEALTH RECOMMENDATIONS
CREATE TABLE health_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    condition_id BIGINT NOT NULL,
    type ENUM('FOOD', 'AVOID_FOOD', 'LIFESTYLE', 'RECOVERY_TIP', 'EXERCISE_ADJUSTMENT') NOT NULL,
    title VARCHAR(255),
    content TEXT,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id)
);

-- USER HEALTH CONSTRAINTS
CREATE TABLE user_health_constraints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    condition_id BIGINT NOT NULL,
    severity_notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_condition (user_id, condition_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id)
);

-- WORKOUT PROGRAMS
CREATE TABLE workout_programs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    goal_type ENUM('WEIGHT_LOSS', 'MUSCLE_GAIN', 'STAY_FIT', 'WEIGHT_GAIN'),
    duration_weeks INT,
    difficulty_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_workout_programs_user (user_id)
);

-- WORKOUT TEMPLATES
CREATE TABLE workout_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    focus_area VARCHAR(255),
    estimated_duration_mins INT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES workout_programs(id),
    INDEX idx_workout_templates_program (program_id)
);

-- EXERCISES
CREATE TABLE exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('TIME_BASED', 'REP_BASED') NOT NULL,
    primary_muscle_group VARCHAR(100),
    equipment VARCHAR(255),
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    video_url VARCHAR(500),
    is_downloadable BOOLEAN NOT NULL DEFAULT FALSE,
    video_source ENUM('YOUTUBE', 'SELF_HOSTED') DEFAULT 'YOUTUBE',
    calories_per_min DECIMAL(6,2),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- WORKOUT TEMPLATE EXERCISES
CREATE TABLE workout_template_exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT,
    target_reps INT,
    target_duration_sec INT,
    rest_time_sec INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    INDEX idx_template_exercises_template (template_id)
);

-- USER WORKOUT SCHEDULE
CREATE TABLE user_workout_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    template_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    status ENUM('LOCKED', 'UNLOCKED', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'LOCKED',
    completed_at DATETIME,
    total_calories_burned DECIMAL(7,2),
    rating INT,
    feedback TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES workout_templates(id),
    INDEX idx_schedule_user_date (user_id, scheduled_date)
);

-- WORKOUT SESSION EXERCISES
CREATE TABLE workout_session_exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    is_extra BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES user_workout_schedule(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- WORKOUT SESSION SETS
CREATE TABLE workout_session_sets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_exercise_id BIGINT NOT NULL,
    set_number INT NOT NULL,
    reps INT,
    weight_kg DECIMAL(6,2),
    duration_sec INT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_exercise_id) REFERENCES workout_session_exercises(id)
);

-- INGREDIENTS
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    calories_per_100g DECIMAL(6,2),
    protein_per_100g DECIMAL(6,2),
    carbs_per_100g DECIMAL(6,2),
    fat_per_100g DECIMAL(6,2),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RECIPES
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    meal_type ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'),
    instructions TEXT,
    total_calories DECIMAL(7,2),
    prep_time_mins INT,
    image_url VARCHAR(500),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RECIPE INGREDIENTS
CREATE TABLE recipe_ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity DECIMAL(7,2),
    unit VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    INDEX idx_recipe_ingredients_recipe (recipe_id)
);

-- USER DAILY NUTRITION
CREATE TABLE user_daily_nutrition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_calories DECIMAL(7,2),
    total_protein DECIMAL(7,2),
    total_carbs DECIMAL(7,2),
    total_fat DECIMAL(7,2),
    metrics_data JSON,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_daily_nutrition_user_date (user_id, date)
);

-- CHAT LOGS
CREATE TABLE chat_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255),
    role ENUM('USER', 'AI') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_chat_logs_user_session (user_id, session_id)
);
