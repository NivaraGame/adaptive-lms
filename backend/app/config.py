from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/adaptive_lms"
    DATABASE_TEST_URL: str = "postgresql://user:password@localhost:5432/adaptive_lms_test"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM Service
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "llama3.2:1b" # або llama3.2:3b

    # Application
    APP_NAME: str = "Adaptive LMS"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = '["http://localhost:3000", "http://localhost:5173"]'

    # Adaptation Engine
    ADAPTATION_MODE: str = "bandit"  # rules, bandit, policy
    BANDIT_ALPHA: float = 1.5
    BANDIT_MODEL_PATH: str = "models/linucb_bandit.npz"

    # Metrics
    ASYNC_METRICS_SAMPLE_RATE: float = 0.2

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS from JSON string to list"""
        try:
            if isinstance(self.ALLOWED_ORIGINS, str):
                return json.loads(self.ALLOWED_ORIGINS)
            return self.ALLOWED_ORIGINS
        except:
            # Fallback to default origins
            return ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"]


settings = Settings()
