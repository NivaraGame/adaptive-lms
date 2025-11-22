-- Adaptive LMS Database Schema
-- PostgreSQL 15+

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users
-- Stores user account information
-- =====================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- TABLE: dialogs
-- Stores learning sessions/conversations
-- =====================================================
CREATE TABLE dialogs (
    dialog_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    dialog_type VARCHAR(50) NOT NULL CHECK (dialog_type IN ('educational', 'test', 'assessment', 'reflective')),
    topic VARCHAR(200),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    extra_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes for efficient querying
CREATE INDEX idx_dialogs_user_id ON dialogs(user_id);
CREATE INDEX idx_dialogs_type ON dialogs(dialog_type);
CREATE INDEX idx_dialogs_topic ON dialogs(topic);
CREATE INDEX idx_dialogs_started_at ON dialogs(started_at);

-- =====================================================
-- TABLE: messages
-- Stores individual messages within dialogs
-- =====================================================
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    dialog_id INTEGER NOT NULL REFERENCES dialogs(dialog_id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_question BOOLEAN DEFAULT FALSE,
    extra_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes for message retrieval
CREATE INDEX idx_messages_dialog_id ON messages(dialog_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_sender_type ON messages(sender_type);

-- =====================================================
-- TABLE: content_items
-- Stores learning materials and exercises
-- =====================================================
CREATE TABLE content_items (
    content_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('easy', 'normal', 'hard', 'challenge')),
    format VARCHAR(20) NOT NULL CHECK (format IN ('text', 'visual', 'video', 'interactive')),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('lesson', 'exercise', 'quiz', 'explanation')),
    content_data JSONB NOT NULL,
    reference_answer JSONB,
    hints JSONB DEFAULT '[]'::jsonb,
    explanations JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    extra_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes for content filtering and search
CREATE INDEX idx_content_topic ON content_items(topic);
CREATE INDEX idx_content_subtopic ON content_items(subtopic);
CREATE INDEX idx_content_difficulty ON content_items(difficulty_level);
CREATE INDEX idx_content_format ON content_items(format);
CREATE INDEX idx_content_type ON content_items(content_type);

-- GIN index for JSONB fields (efficient for JSON queries)
CREATE INDEX idx_content_skills ON content_items USING gin(skills);
CREATE INDEX idx_content_prerequisites ON content_items USING gin(prerequisites);

-- =====================================================
-- TABLE: metrics
-- Stores computed metrics from user interactions
-- =====================================================
CREATE TABLE metrics (
    metric_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    dialog_id INTEGER REFERENCES dialogs(dialog_id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value_f DOUBLE PRECISION,  -- Numeric value
    metric_value_s VARCHAR(255),      -- String value
    metric_value_j JSONB,             -- JSON value
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    context JSONB DEFAULT '{}'::jsonb
);

-- Indexes for metric queries
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_dialog_id ON metrics(dialog_id);
CREATE INDEX idx_metrics_message_id ON metrics(message_id);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);

-- Composite index for user-metric lookups
CREATE INDEX idx_metrics_user_name ON metrics(user_id, metric_name);

-- =====================================================
-- TABLE: user_profiles
-- Stores aggregated user learning data
-- =====================================================
CREATE TABLE user_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    topic_mastery JSONB DEFAULT '{}'::jsonb,  -- {"topic1": 0.75, ...}
    preferred_format VARCHAR(20) CHECK (preferred_format IN ('text', 'visual', 'video', 'interactive')),
    learning_pace VARCHAR(20) DEFAULT 'medium' CHECK (learning_pace IN ('slow', 'medium', 'fast')),
    error_patterns JSONB DEFAULT '[]'::jsonb,
    avg_response_time DOUBLE PRECISION,
    avg_accuracy DOUBLE PRECISION,
    total_interactions INTEGER DEFAULT 0,
    total_time_spent DOUBLE PRECISION DEFAULT 0.0,
    current_difficulty VARCHAR(20) DEFAULT 'normal' CHECK (current_difficulty IN ('easy', 'normal', 'hard', 'challenge')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    extra_data JSONB DEFAULT '{}'::jsonb
);

-- Index for user profile lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- GIN index for topic mastery queries
CREATE INDEX idx_user_profiles_mastery ON user_profiles USING gin(topic_mastery);

-- =====================================================
-- TABLE: experiments
-- Stores A/B testing and experimentation data
-- =====================================================
CREATE TABLE experiments (
    experiment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    experiment_name VARCHAR(100) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    extra_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes for experiment tracking
CREATE INDEX idx_experiments_user_id ON experiments(user_id);
CREATE INDEX idx_experiments_name ON experiments(experiment_name);
CREATE INDEX idx_experiments_variant ON experiments(variant_name);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_last_updated
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS: Analytics and reporting
-- =====================================================

-- View: User learning summary
CREATE VIEW user_learning_summary AS
SELECT
    u.user_id,
    u.username,
    u.email,
    COUNT(DISTINCT d.dialog_id) AS total_dialogs,
    COUNT(DISTINCT CASE WHEN d.dialog_type = 'test' THEN d.dialog_id END) AS test_dialogs,
    COUNT(m.message_id) AS total_messages,
    COALESCE(up.total_time_spent, 0) AS total_time_spent,
    COALESCE(up.avg_accuracy, 0) AS avg_accuracy,
    up.current_difficulty,
    up.preferred_format
FROM users u
LEFT JOIN dialogs d ON u.user_id = d.user_id
LEFT JOIN messages m ON d.dialog_id = m.dialog_id AND m.sender_type = 'user'
LEFT JOIN user_profiles up ON u.user_id = up.user_id
GROUP BY u.user_id, u.username, u.email, up.total_time_spent, up.avg_accuracy, up.current_difficulty, up.preferred_format;

-- View: Recent user activity
CREATE VIEW recent_user_activity AS
SELECT
    u.user_id,
    u.username,
    d.dialog_id,
    d.dialog_type,
    d.topic,
    d.started_at,
    d.ended_at,
    COUNT(m.message_id) AS message_count,
    EXTRACT(EPOCH FROM (COALESCE(d.ended_at, CURRENT_TIMESTAMP) - d.started_at)) / 60 AS duration_minutes
FROM users u
JOIN dialogs d ON u.user_id = d.user_id
LEFT JOIN messages m ON d.dialog_id = m.dialog_id
GROUP BY u.user_id, u.username, d.dialog_id, d.dialog_type, d.topic, d.started_at, d.ended_at
ORDER BY d.started_at DESC;

-- =====================================================
-- SAMPLE DATA (for development/testing)
-- =====================================================

-- Sample users
INSERT INTO users (username, email, hashed_password) VALUES
    ('alice', 'alice@example.com', '$2b$12$SAMPLE_HASH_1'),
    ('bob', 'bob@example.com', '$2b$12$SAMPLE_HASH_2');

-- Sample content
INSERT INTO content_items (title, topic, subtopic, difficulty_level, format, content_type, content_data, reference_answer, hints, skills)
VALUES
    (
        'Introduction to Variables',
        'Programming Basics',
        'Variables',
        'easy',
        'text',
        'lesson',
        '{"text": "Variables are containers for storing data values..."}'::jsonb,
        NULL,
        '[]'::jsonb,
        '["variables", "data_types"]'::jsonb
    ),
    (
        'Variable Assignment Quiz',
        'Programming Basics',
        'Variables',
        'easy',
        'interactive',
        'quiz',
        '{"question": "What is the correct way to create a variable called x with value 5?", "options": ["x = 5", "var x = 5", "let x = 5", "int x = 5"]}'::jsonb,
        '{"correct": "x = 5", "explanation": "In Python, variables are assigned using the = operator."}'::jsonb,
        '["Think about Python syntax", "No type declaration needed"]'::jsonb,
        '["variables", "assignment"]'::jsonb
    ),
    (
        'Functions Explained',
        'Programming Basics',
        'Functions',
        'normal',
        'video',
        'lesson',
        '{"video_url": "https://example.com/functions.mp4", "duration": 300}'::jsonb,
        NULL,
        '[]'::jsonb,
        '["functions", "code_organization"]'::jsonb
    );

-- Sample user profiles
INSERT INTO user_profiles (user_id, topic_mastery, preferred_format, current_difficulty)
SELECT user_id, '{}'::jsonb, 'text', 'normal'
FROM users;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE dialogs IS 'Stores learning sessions and conversations between users and the system';
COMMENT ON TABLE messages IS 'Individual messages within dialogs';
COMMENT ON TABLE content_items IS 'Learning materials, exercises, and quizzes';
COMMENT ON TABLE metrics IS 'Computed metrics from user interactions (17 metrics)';
COMMENT ON TABLE user_profiles IS 'Aggregated user learning data for adaptation';
COMMENT ON TABLE experiments IS 'A/B testing and experimentation tracking';

COMMENT ON COLUMN metrics.metric_value_f IS 'Floating-point metric values (e.g., accuracy, response_time)';
COMMENT ON COLUMN metrics.metric_value_s IS 'String metric values (e.g., error_type, preferred_format)';
COMMENT ON COLUMN metrics.metric_value_j IS 'JSON metric values for complex data (e.g., error_patterns)';

COMMENT ON COLUMN user_profiles.topic_mastery IS 'JSON object mapping topics to mastery scores (0-1)';
COMMENT ON COLUMN user_profiles.error_patterns IS 'Array of recurring error patterns identified by the system';
