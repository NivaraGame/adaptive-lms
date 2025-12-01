"""
Adaptation Engine - Strategy Orchestration (Level A)

This module provides the high-level orchestration layer for the adaptation system.
It manages strategy selection (rules/bandit/policy) and coordinates the flow of:
- Fetching user profiles
- Fetching recent metrics
- Building session context
- Calling the appropriate adapter
- Handling fallbacks and errors

This is a domain orchestration layer that reuses existing services and schemas.
No database ORM logic or HTTP handling is done inside this engine.
"""

import logging
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime
from sqlalchemy.orm import Session

from .rules import RulesAdapter, AdaptationRecommendation, SessionContext
from .config import AdaptationConfig

logger = logging.getLogger(__name__)


class AdaptationStrategy(str, Enum):
    """
    Enum for adaptation strategy types.

    RULES: Threshold-based rules engine (Level A) - current implementation
    BANDIT: Contextual bandit with exploration (Level B) - future
    POLICY: IRT/BKT policy learning (Level C) - future
    """
    RULES = "rules"
    BANDIT = "bandit"  # Placeholder for future
    POLICY = "policy"  # Placeholder for future


class AdaptationEngineError(Exception):
    """Base exception for adaptation engine errors"""
    pass


class StrategyNotFoundError(AdaptationEngineError):
    """Exception raised when requested strategy is not available"""
    pass


class DataFetchError(AdaptationEngineError):
    """Exception raised when required data cannot be fetched"""
    pass


class AdaptationEngine:
    """
    High-level adaptation engine that orchestrates strategy execution.

    This engine:
    1. Manages strategy selection (currently only RULES is implemented)
    2. Fetches required data (user profile, metrics, session context)
    3. Delegates to the active adapter
    4. Handles errors with safe fallbacks
    5. Provides a unified interface for recommendation generation

    The engine is stateful (tracks current strategy) but each recommendation
    call is stateless and thread-safe.

    Example:
        >>> engine = AdaptationEngine(db_session)
        >>> recommendation = engine.get_recommendation(
        ...     user_id=1,
        ...     dialog_id=42
        ... )
        >>> print(recommendation.difficulty.recommended_difficulty)
        'hard'
    """

    def __init__(
        self,
        db: Session,
        config: Optional[AdaptationConfig] = None,
        default_strategy: AdaptationStrategy = AdaptationStrategy.RULES
    ):
        """
        Initialize the adaptation engine.

        Args:
            db: SQLAlchemy database session
            config: Configuration for thresholds and parameters
            default_strategy: Initial strategy to use (default: RULES)
        """
        self.db = db
        self.config = config or AdaptationConfig()
        self.current_strategy = default_strategy

        # Initialize strategy registry
        self._strategy_registry: Dict[AdaptationStrategy, Any] = {}
        self._initialize_strategies()

        logger.info(
            f"AdaptationEngine initialized with strategy={self.current_strategy.value}"
        )

    def _initialize_strategies(self) -> None:
        """
        Initialize all available strategies.

        Currently only RULES is implemented. Future strategies (BANDIT, POLICY)
        will be added here.
        """
        # Initialize rules adapter
        self._strategy_registry[AdaptationStrategy.RULES] = RulesAdapter(self.config)

        # Placeholders for future strategies
        # self._strategy_registry[AdaptationStrategy.BANDIT] = BanditAdapter(...)
        # self._strategy_registry[AdaptationStrategy.POLICY] = PolicyAdapter(...)

        logger.debug(
            f"Initialized {len(self._strategy_registry)} strategies: "
            f"{list(self._strategy_registry.keys())}"
        )

    def set_strategy(self, strategy: AdaptationStrategy) -> None:
        """
        Switch to a different adaptation strategy.

        Args:
            strategy: The strategy to switch to

        Raises:
            StrategyNotFoundError: If the requested strategy is not available

        Example:
            >>> engine.set_strategy(AdaptationStrategy.RULES)
        """
        if strategy not in self._strategy_registry:
            available = list(self._strategy_registry.keys())
            raise StrategyNotFoundError(
                f"Strategy '{strategy}' is not available. "
                f"Available strategies: {available}"
            )

        old_strategy = self.current_strategy
        self.current_strategy = strategy

        logger.info(f"Strategy changed: {old_strategy.value} -> {strategy.value}")

    def get_current_strategy(self) -> Dict[str, Any]:
        """
        Get information about the current active strategy.

        Returns:
            Dict with strategy metadata including type, version, and config

        Example:
            >>> info = engine.get_current_strategy()
            >>> print(info['strategy_type'])
            'rules'
        """
        return {
            "strategy_type": self.current_strategy.value,
            "config_version": "1.0",
            "available_strategies": [s.value for s in self._strategy_registry.keys()],
            "config_summary": self.config.get_config_summary()
        }

    def get_recommendation(
        self,
        user_id: int,
        dialog_id: Optional[int] = None,
        context_overrides: Optional[Dict[str, Any]] = None
    ) -> AdaptationRecommendation:
        """
        Get adaptation recommendation for a user.

        This is the main entry point for the adaptation engine. It:
        1. Fetches user profile
        2. Fetches recent metrics (last 10 interactions)
        3. Builds session context (if dialog_id provided)
        4. Calls the active adapter
        5. Returns recommendation with fallback on errors

        Args:
            user_id: ID of the user to get recommendation for
            dialog_id: Optional dialog ID for session context
            context_overrides: Optional dict to override context values

        Returns:
            AdaptationRecommendation with complete decision data

        Raises:
            DataFetchError: If critical data cannot be fetched

        Example:
            >>> rec = engine.get_recommendation(user_id=1, dialog_id=42)
            >>> print(rec.difficulty.recommended_difficulty)
            'hard'
            >>> print(rec.overall_reasoning)
            'Adjusting to hard difficulty based on recent performance...'
        """
        logger.info(
            f"Getting recommendation: user_id={user_id}, dialog_id={dialog_id}, "
            f"strategy={self.current_strategy.value}"
        )

        try:
            # Fetch user profile
            user_profile = self._fetch_user_profile(user_id)

            # Fetch recent metrics
            recent_metrics = self._fetch_recent_metrics(user_id, limit=10)

            # Build session context
            session_context = self._build_session_context(
                user_id,
                dialog_id,
                context_overrides
            )

            # Get active adapter
            adapter = self._strategy_registry[self.current_strategy]

            # Call adapter to get recommendation
            recommendation = adapter.get_recommendation(
                user_profile=user_profile,
                recent_metrics=recent_metrics,
                session_context=session_context
            )

            logger.info(
                f"Recommendation generated successfully: "
                f"difficulty={recommendation.difficulty.recommended_difficulty}, "
                f"format={recommendation.format.recommended_format}, "
                f"confidence={recommendation.overall_confidence:.2f}"
            )

            return recommendation

        except Exception as e:
            logger.error(f"Error generating recommendation: {e}", exc_info=True)

            # Attempt fallback
            return self._fallback_recommendation(user_id, str(e))

    def _fetch_user_profile(self, user_id: int) -> Dict[str, Any]:
        """
        Fetch user profile from database.

        Args:
            user_id: ID of the user

        Returns:
            Dict with user profile data

        Raises:
            DataFetchError: If profile cannot be fetched
        """
        from app.models.user_profile import UserProfile

        try:
            profile = self.db.query(UserProfile).filter(
                UserProfile.user_id == user_id
            ).first()

            if not profile:
                logger.warning(f"No profile found for user_id={user_id}, using defaults")
                # Return default profile for cold start
                return {
                    "user_id": user_id,
                    "topic_mastery": {},
                    "current_difficulty": self.config.DEFAULT_DIFFICULTY,
                    "preferred_format": None,
                    "learning_pace": self.config.DEFAULT_PACE,
                    "avg_accuracy": None,
                    "avg_response_time": None,
                    "total_time_spent": 0.0,
                    "streak_days": 0
                }

            # Convert ORM model to dict
            profile_dict = {
                "user_id": profile.user_id,
                "topic_mastery": profile.topic_mastery or {},
                "current_difficulty": profile.current_difficulty,
                "preferred_format": profile.preferred_format,
                "learning_pace": profile.learning_pace,
                "avg_accuracy": profile.avg_accuracy,
                "avg_response_time": profile.avg_response_time,
                "total_time_spent": profile.total_time_spent or 0.0,
                "total_interactions": getattr(profile, 'total_interactions', 0)
            }

            logger.debug(f"Fetched profile for user_id={user_id}")
            return profile_dict

        except Exception as e:
            raise DataFetchError(f"Failed to fetch user profile: {e}")

    def _fetch_recent_metrics(
        self,
        user_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch recent metrics for a user.

        Args:
            user_id: ID of the user
            limit: Maximum number of recent metrics to fetch

        Returns:
            List of metric dicts with metric_name, metric_value_f, timestamp
        """
        from app.models.metric import Metric

        try:
            metrics = self.db.query(Metric).filter(
                Metric.user_id == user_id
            ).order_by(
                Metric.timestamp.desc()
            ).limit(limit).all()

            # Convert to list of dicts
            metrics_list = [
                {
                    "metric_name": m.metric_name,
                    "metric_value_f": m.metric_value_f,
                    "metric_value_s": m.metric_value_s,
                    "metric_value_j": m.metric_value_j,
                    "timestamp": m.timestamp,
                    "context": m.context or {}
                }
                for m in metrics
            ]

            logger.debug(
                f"Fetched {len(metrics_list)} recent metrics for user_id={user_id}"
            )

            return metrics_list

        except Exception as e:
            logger.warning(f"Failed to fetch metrics: {e}")
            return []  # Return empty list rather than failing

    def _build_session_context(
        self,
        user_id: int,
        dialog_id: Optional[int] = None,
        overrides: Optional[Dict[str, Any]] = None
    ) -> SessionContext:
        """
        Build session context from dialog information.

        Args:
            user_id: ID of the user
            dialog_id: Optional dialog ID
            overrides: Optional dict to override context values

        Returns:
            SessionContext object
        """
        from app.models.dialog import Dialog
        from app.models.message import Message

        if not dialog_id:
            logger.debug("No dialog_id provided, returning empty context")
            return SessionContext()

        try:
            # Fetch dialog
            dialog = self.db.query(Dialog).filter(
                Dialog.dialog_id == dialog_id,
                Dialog.user_id == user_id
            ).first()

            if not dialog:
                logger.warning(f"Dialog {dialog_id} not found for user {user_id}")
                return SessionContext()

            # Count messages in dialog
            messages_count = self.db.query(Message).filter(
                Message.dialog_id == dialog_id
            ).count()

            # Build context
            context = SessionContext(
                dialog_id=dialog_id,
                session_start_time=dialog.started_at,
                messages_count=messages_count,
                current_topic=dialog.topic
            )

            # Apply overrides if provided
            if overrides:
                for key, value in overrides.items():
                    if hasattr(context, key):
                        setattr(context, key, value)

            logger.debug(
                f"Built session context: dialog_id={dialog_id}, "
                f"messages={messages_count}, duration={context.session_duration_minutes:.1f}min"
            )

            return context

        except Exception as e:
            logger.warning(f"Error building session context: {e}")
            return SessionContext()

    def _fallback_recommendation(
        self,
        user_id: int,
        error_msg: str
    ) -> AdaptationRecommendation:
        """
        Generate a safe fallback recommendation when the adapter fails.

        This ensures the system always returns a valid recommendation,
        even if the adaptation logic fails.

        Args:
            user_id: ID of the user
            error_msg: Error message from the failed attempt

        Returns:
            AdaptationRecommendation with safe defaults
        """
        from .rules import (
            DifficultyDecision,
            FormatDecision,
            TempoDecision,
            RemediationTopics
        )

        logger.warning(
            f"Using fallback recommendation for user_id={user_id}. "
            f"Error: {error_msg}"
        )

        # Create safe default decisions
        difficulty = DifficultyDecision(
            recommended_difficulty=self.config.DEFAULT_DIFFICULTY,
            confidence=0.1,
            reasoning="Fallback: Using default difficulty due to system error",
            change_from_current=0
        )

        format_decision = FormatDecision(
            recommended_format=self.config.DEFAULT_FORMAT,
            confidence=0.1,
            reasoning="Fallback: Using default format due to system error"
        )

        tempo = TempoDecision(
            recommended_tempo=self.config.DEFAULT_TEMPO,
            confidence=0.1,
            reasoning="Fallback: Using normal tempo due to system error"
        )

        remediation = RemediationTopics(
            topics=[],
            mastery_scores={},
            reasoning="Fallback: No remediation data available"
        )

        fallback_rec = AdaptationRecommendation(
            difficulty=difficulty,
            format=format_decision,
            tempo=tempo,
            remediation=remediation,
            overall_confidence=0.1,
            overall_reasoning=(
                f"System fallback recommendation (error occurred). "
                f"Using safe defaults: {self.config.DEFAULT_DIFFICULTY} difficulty, "
                f"{self.config.DEFAULT_FORMAT} format."
            ),
            metadata={
                "strategy": "fallback",
                "error": error_msg,
                "timestamp": datetime.utcnow().isoformat(),
                "is_fallback": True
            }
        )

        logger.info("Fallback recommendation generated")
        return fallback_rec
