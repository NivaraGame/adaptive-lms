"""
Configuration for adaptation thresholds and parameters.

All threshold values can be overridden via environment variables.
This config aligns with the Pydantic schemas defined in app/schemas/.
"""

import os
from typing import List, Dict


class AdaptationConfig:
    """
    Configuration class for adaptation thresholds and parameters.

    All values align with the constraints defined in Pydantic schemas:
    - Difficulty levels: ['easy', 'normal', 'hard', 'challenge']
    - Formats: ['text', 'visual', 'video', 'interactive']
    - Learning pace: ['slow', 'medium', 'fast']
    - Accuracy: 0.0-1.0 range
    """

    # ===== Difficulty Levels (from schemas/content.py and schemas/user_profile.py) =====
    DIFFICULTY_LEVELS: List[str] = ['easy', 'normal', 'hard', 'challenge']
    DIFFICULTY_ORDER: Dict[str, int] = {
        'easy': 1,
        'normal': 2,
        'hard': 3,
        'challenge': 4
    }
    DIFFICULTY_FROM_ORDER: Dict[int, str] = {
        1: 'easy',
        2: 'normal',
        3: 'hard',
        4: 'challenge'
    }

    # ===== Content Formats (from schemas/content.py and schemas/user_profile.py) =====
    FORMATS: List[str] = ['text', 'visual', 'video', 'interactive']

    # ===== Learning Pace (from schemas/user_profile.py) =====
    LEARNING_PACE: List[str] = ['slow', 'medium', 'fast']

    # ===== Tempo Types (for session pacing recommendations) =====
    TEMPO_TYPES: List[str] = ['fast', 'normal', 'slow', 'break']

    # ===== Accuracy Thresholds (0.0-1.0 range per schema validation) =====
    ACCURACY_HIGH_THRESHOLD: float = float(os.getenv("ACCURACY_HIGH_THRESHOLD", "0.8"))
    ACCURACY_MEDIUM_THRESHOLD: float = float(os.getenv("ACCURACY_MEDIUM_THRESHOLD", "0.5"))
    ACCURACY_LOW_THRESHOLD: float = float(os.getenv("ACCURACY_LOW_THRESHOLD", "0.5"))

    # ===== Response Time Thresholds (seconds, non-negative per schema) =====
    RESPONSE_TIME_FAST_THRESHOLD: float = float(os.getenv("RESPONSE_TIME_FAST_THRESHOLD", "30.0"))
    RESPONSE_TIME_NORMAL_MAX: float = float(os.getenv("RESPONSE_TIME_NORMAL_MAX", "90.0"))
    RESPONSE_TIME_SLOW_THRESHOLD: float = float(os.getenv("RESPONSE_TIME_SLOW_THRESHOLD", "120.0"))

    # ===== Topic Mastery Thresholds (0.0-1.0 range) =====
    MASTERY_HIGH_THRESHOLD: float = float(os.getenv("MASTERY_HIGH_THRESHOLD", "0.7"))
    MASTERY_MEDIUM_THRESHOLD: float = float(os.getenv("MASTERY_MEDIUM_THRESHOLD", "0.4"))
    MASTERY_STRUGGLING_THRESHOLD: float = float(os.getenv("MASTERY_STRUGGLING_THRESHOLD", "0.4"))

    # ===== Engagement Thresholds =====
    FOLLOWUPS_HIGH_THRESHOLD: int = int(os.getenv("FOLLOWUPS_HIGH_THRESHOLD", "3"))
    FOLLOWUPS_LOW_THRESHOLD: int = int(os.getenv("FOLLOWUPS_LOW_THRESHOLD", "1"))

    # ===== Session Thresholds =====
    SESSION_LENGTH_LONG_MINUTES: float = float(os.getenv("SESSION_LENGTH_LONG_MINUTES", "60.0"))
    SESSION_INTERACTIONS_HIGH: int = int(os.getenv("SESSION_INTERACTIONS_HIGH", "20"))
    SESSION_FATIGUE_RT_INCREASE_PERCENT: float = float(os.getenv("SESSION_FATIGUE_RT_INCREASE_PERCENT", "0.3"))

    # ===== Confidence Calculation Thresholds =====
    MIN_METRICS_FOR_HIGH_CONFIDENCE: int = int(os.getenv("MIN_METRICS_FOR_HIGH_CONFIDENCE", "5"))
    MIN_METRICS_FOR_MEDIUM_CONFIDENCE: int = int(os.getenv("MIN_METRICS_FOR_MEDIUM_CONFIDENCE", "3"))

    # ===== Default Values (matching schema defaults) =====
    DEFAULT_DIFFICULTY: str = "normal"  # matches UserProfileBase.current_difficulty default
    DEFAULT_FORMAT: str = "text"
    DEFAULT_PACE: str = "medium"  # matches UserProfileBase.learning_pace default
    DEFAULT_TEMPO: str = "normal"

    @classmethod
    def get_difficulty_change(cls, current: str, change: int) -> str:
        """
        Calculate new difficulty level given current level and change amount.

        Args:
            current: Current difficulty level (easy/normal/hard/challenge)
            change: Change amount (-1 for decrease, +1 for increase, 0 for same)

        Returns:
            New difficulty level as string

        Example:
            >>> AdaptationConfig.get_difficulty_change("normal", 1)
            'hard'
            >>> AdaptationConfig.get_difficulty_change("easy", -1)
            'easy'  # Can't go lower
        """
        if current not in cls.DIFFICULTY_ORDER:
            return cls.DEFAULT_DIFFICULTY

        current_level = cls.DIFFICULTY_ORDER[current]
        new_level = max(1, min(4, current_level + change))
        return cls.DIFFICULTY_FROM_ORDER[new_level]

    @classmethod
    def validate_difficulty(cls, difficulty: str) -> bool:
        """Check if difficulty level is valid per schema."""
        return difficulty in cls.DIFFICULTY_LEVELS

    @classmethod
    def validate_format(cls, format_type: str) -> bool:
        """Check if format is valid per schema."""
        return format_type in cls.FORMATS

    @classmethod
    def validate_pace(cls, pace: str) -> bool:
        """Check if learning pace is valid per schema."""
        return pace in cls.LEARNING_PACE

    @classmethod
    def get_config_summary(cls) -> Dict[str, any]:
        """Return summary of key configuration values."""
        return {
            "accuracy_thresholds": {
                "high": cls.ACCURACY_HIGH_THRESHOLD,
                "medium": cls.ACCURACY_MEDIUM_THRESHOLD,
                "low": cls.ACCURACY_LOW_THRESHOLD,
            },
            "response_time_thresholds": {
                "fast": cls.RESPONSE_TIME_FAST_THRESHOLD,
                "normal_max": cls.RESPONSE_TIME_NORMAL_MAX,
                "slow": cls.RESPONSE_TIME_SLOW_THRESHOLD,
            },
            "mastery_thresholds": {
                "high": cls.MASTERY_HIGH_THRESHOLD,
                "medium": cls.MASTERY_MEDIUM_THRESHOLD,
                "struggling": cls.MASTERY_STRUGGLING_THRESHOLD,
            },
            "session_thresholds": {
                "long_minutes": cls.SESSION_LENGTH_LONG_MINUTES,
                "high_interactions": cls.SESSION_INTERACTIONS_HIGH,
            },
            "difficulty_levels": cls.DIFFICULTY_LEVELS,
            "formats": cls.FORMATS,
        }
