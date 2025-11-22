-- Initialize the adaptive_lms database
-- This script runs automatically when the PostgreSQL container first starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE adaptive_lms TO "user";

-- Note: Tables will be created by SQLAlchemy/Alembic migrations
-- This script is just for initial database setup
