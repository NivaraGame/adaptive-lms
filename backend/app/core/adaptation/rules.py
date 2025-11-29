"""
Rules-based adaptation engine (Level A).

This module implements threshold-based decision rules for adaptive learning.
It takes user state (profile + metrics + session context) and produces
recommendations for difficulty, format, tempo, and remediation topics.

This is a pure decision logic module with no database or API dependencies.
All metrics are sourced from Week 2's synchronous metrics module:
- accuracy: 0.0-1.0 (correctness of answer)
- response_time: seconds (time to answer)
- attempts_count: number of attempts
- followups_count: number of follow-up questions
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

from .config import AdaptationConfig

logger = logging.getLogger(__name__)


@dataclass
class MetricsSummary:
    """Summary of recent user metrics for decision making."""

    # Accuracy metrics (from Week 2: accuracy metric)
    recent_accuracy: List[float] = field(default_factory=list)
    avg_accuracy: Optional[float] = None

    # Response time metrics (from Week 2: response_time metric, in seconds)
    recent_response_times: List[float] = field(default_factory=list)
    avg_response_time: Optional[float] = None

    # Engagement metrics (from Week 2: followups_count metric)
    total_followups: int = 0
    avg_followups_per_interaction: float = 0.0

    # Attempts metrics (from Week 2: attempts_count metric)
    total_attempts: int = 0

    # Session-level metrics (chronological for fatigue detection)
    response_times_chronological: List[float] = field(default_factory=list)

    @property
    def has_data(self) -> bool:
        """Check if we have any metrics data."""
        return len(self.recent_accuracy) > 0 or len(self.recent_response_times) > 0

    @property
    def sample_size(self) -> int:
        """Number of recent interactions we have data for."""
        return max(len(self.recent_accuracy), len(self.recent_response_times))


@dataclass
class SessionContext:
    """Context about the current learning session."""

    dialog_id: Optional[int] = None
    session_start_time: Optional[datetime] = None
    messages_count: int = 0
    current_topic: Optional[str] = None

    @property
    def session_duration_minutes(self) -> float:
        """Calculate session duration in minutes."""
        if self.session_start_time is None:
            return 0.0
        duration = datetime.utcnow() - self.session_start_time
        return duration.total_seconds() / 60.0

    @property
    def has_session_data(self) -> bool:
        """Check if we have session context."""
        return self.dialog_id is not None and self.session_start_time is not None


@dataclass
class DifficultyDecision:
    """Decision about content difficulty."""

    recommended_difficulty: str
    confidence: float  # 0.0 to 1.0
    reasoning: str
    change_from_current: int = 0  # -1 decrease, 0 same, +1 increase


@dataclass
class FormatDecision:
    """Decision about content format."""

    recommended_format: str
    confidence: float
    reasoning: str


@dataclass
class TempoDecision:
    """Decision about learning tempo/pacing."""

    recommended_tempo: str  # fast/normal/slow/break
    confidence: float
    reasoning: str


@dataclass
class RemediationTopics:
    """Topics that need remediation (struggling topics)."""

    topics: List[str] = field(default_factory=list)
    mastery_scores: Dict[str, float] = field(default_factory=dict)
    reasoning: str = ""


@dataclass
class AdaptationRecommendation:
    """Complete adaptation recommendation combining all decisions."""

    difficulty: DifficultyDecision
    format: FormatDecision
    tempo: TempoDecision
    remediation: RemediationTopics
    overall_confidence: float
    overall_reasoning: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to simple dict format for compatibility with ML pipeline.

        Returns dict matching the format expected by content selection and
        bandit/policy adapters (see ml_pipeline.md).
        """
        return {
            "next_difficulty": self.difficulty.recommended_difficulty,
            "next_format": self.format.recommended_format,
            "next_tempo": self.tempo.recommended_tempo,
            "remediation_focus": self.remediation.topics,
            "reasoning": self.overall_reasoning,
            "confidence": self.overall_confidence,
            "metadata": self.metadata
        }


class RulesAdapter:
    """
    Rules-based adaptation engine using threshold-based decisions.

    This adapter analyzes user profile, recent metrics, and session context
    to make recommendations about:
    - Content difficulty (easy/normal/hard/challenge)
    - Content format (text/visual/video/interactive)
    - Learning tempo (fast/normal/slow/break)
    - Topics needing remediation

    All decision logic is stateless and testable without database access.

    Input data comes from:
    - user_profile: Dict from UserProfile model (topic_mastery, avg_accuracy, current_difficulty, etc.)
    - recent_metrics: List of Metric model dicts (metric_name, metric_value_f, timestamp)
    - session_context: SessionContext with dialog info
    """

    def __init__(self, config: Optional[AdaptationConfig] = None):
        """
        Initialize the rules adapter.

        Args:
            config: Configuration object with thresholds. If None, uses defaults.
        """
        self.config = config or AdaptationConfig()
        logger.info("RulesAdapter initialized with config: %s", self.config.get_config_summary())

    def get_recommendation(
        self,
        user_profile: Dict[str, Any],
        recent_metrics: List[Dict[str, Any]],
        session_context: Optional[SessionContext] = None
    ) -> AdaptationRecommendation:
        """
        Get complete adaptation recommendation.

        Args:
            user_profile: User profile dict with fields from UserProfileBase schema:
                - topic_mastery: Dict[str, float]
                - current_difficulty: str
                - preferred_format: Optional[str]
                - learning_pace: str
                - avg_accuracy: Optional[float]
                - avg_response_time: Optional[float]
            recent_metrics: List of recent metric dicts (last 5-10 interactions):
                - metric_name: str ("accuracy", "response_time", "followups_count", "attempts_count")
                - metric_value_f: float
                - timestamp: datetime
            session_context: Optional session context for tempo decisions

        Returns:
            AdaptationRecommendation with all decisions and reasoning

        Example:
            >>> profile = {
            ...     "topic_mastery": {"algebra": 0.85, "calculus": 0.3},
            ...     "avg_accuracy": 0.75,
            ...     "current_difficulty": "normal"
            ... }
            >>> metrics = [
            ...     {"metric_name": "accuracy", "metric_value_f": 0.8, "timestamp": datetime.now()},
            ...     {"metric_name": "response_time", "metric_value_f": 45.0, "timestamp": datetime.now()}
            ... ]
            >>> adapter = RulesAdapter()
            >>> rec = adapter.get_recommendation(profile, metrics)
            >>> rec.difficulty.recommended_difficulty
            'hard'
        """
        # Parse inputs
        metrics_summary = self._build_metrics_summary(recent_metrics)
        context = session_context or SessionContext()

        logger.debug(
            "Getting recommendation for user - metrics samples: %d, session duration: %.1f min",
            metrics_summary.sample_size,
            context.session_duration_minutes
        )

        # Make decisions
        difficulty_decision = self.decide_difficulty(user_profile, metrics_summary)
        format_decision = self.decide_format(user_profile, metrics_summary)
        tempo_decision = self.decide_tempo(user_profile, metrics_summary, context)
        remediation = self.identify_remediation(user_profile)

        # Calculate overall confidence
        confidences = [
            difficulty_decision.confidence,
            format_decision.confidence,
            tempo_decision.confidence
        ]
        overall_confidence = sum(confidences) / len(confidences)

        # Generate overall reasoning
        overall_reasoning = self._generate_overall_reasoning(
            difficulty_decision,
            format_decision,
            tempo_decision,
            remediation,
            metrics_summary
        )

        # Build metadata
        metadata = {
            "strategy": "rules",
            "config_version": "1.0",
            "metrics_sample_size": metrics_summary.sample_size,
            "has_session_context": context.has_session_data,
            "timestamp": datetime.utcnow().isoformat()
        }

        recommendation = AdaptationRecommendation(
            difficulty=difficulty_decision,
            format=format_decision,
            tempo=tempo_decision,
            remediation=remediation,
            overall_confidence=overall_confidence,
            overall_reasoning=overall_reasoning,
            metadata=metadata
        )

        logger.info(
            "Recommendation generated: difficulty=%s, format=%s, tempo=%s, confidence=%.2f",
            recommendation.difficulty.recommended_difficulty,
            recommendation.format.recommended_format,
            recommendation.tempo.recommended_tempo,
            recommendation.overall_confidence
        )

        return recommendation

    def decide_difficulty(
        self,
        user_profile: Dict[str, Any],
        metrics_summary: MetricsSummary
    ) -> DifficultyDecision:
        """
        Decide on content difficulty based on accuracy and response time.

        Rules:
        - If accuracy > 0.8 AND response_time < 60s → Increase difficulty
        - If accuracy < 0.5 OR response_time > 120s → Decrease difficulty
        - Otherwise → Keep same difficulty

        Args:
            user_profile: User profile with current_difficulty field
            metrics_summary: Summary of recent metrics

        Returns:
            DifficultyDecision with recommendation and reasoning
        """
        current_difficulty = user_profile.get("current_difficulty", self.config.DEFAULT_DIFFICULTY)

        # Cold start: no metrics data
        if not metrics_summary.has_data:
            return DifficultyDecision(
                recommended_difficulty=current_difficulty,
                confidence=0.3,  # Low confidence for cold start
                reasoning="No recent performance data available. Keeping current difficulty.",
                change_from_current=0
            )

        # Calculate average accuracy from recent metrics
        avg_accuracy = metrics_summary.avg_accuracy or (
            sum(metrics_summary.recent_accuracy) / len(metrics_summary.recent_accuracy)
            if metrics_summary.recent_accuracy else 0.5
        )

        # Calculate average response time
        avg_rt = metrics_summary.avg_response_time or (
            sum(metrics_summary.recent_response_times) / len(metrics_summary.recent_response_times)
            if metrics_summary.recent_response_times else 60.0
        )

        # Calculate confidence based on sample size
        confidence = self._calculate_confidence(metrics_summary.sample_size)

        # Apply decision rules
        change = 0
        reasoning_parts = []

        # Rule 1: Increase difficulty (high performance)
        if avg_accuracy >= self.config.ACCURACY_HIGH_THRESHOLD and avg_rt < self.config.RESPONSE_TIME_NORMAL_MAX:
            change = 1
            reasoning_parts.append(
                f"High accuracy ({avg_accuracy:.2f}) and fast response time ({avg_rt:.1f}s) indicate mastery"
            )

        # Rule 2: Decrease difficulty (struggling)
        elif avg_accuracy < self.config.ACCURACY_LOW_THRESHOLD or avg_rt > self.config.RESPONSE_TIME_SLOW_THRESHOLD:
            change = -1
            if avg_accuracy < self.config.ACCURACY_LOW_THRESHOLD:
                reasoning_parts.append(f"Low accuracy ({avg_accuracy:.2f}) indicates difficulty")
            if avg_rt > self.config.RESPONSE_TIME_SLOW_THRESHOLD:
                reasoning_parts.append(f"Slow response time ({avg_rt:.1f}s) suggests struggling")

        # Rule 3: Keep same (moderate performance)
        else:
            change = 0
            reasoning_parts.append(
                f"Moderate performance (accuracy: {avg_accuracy:.2f}, response time: {avg_rt:.1f}s)"
            )

        # Calculate new difficulty
        new_difficulty = self.config.get_difficulty_change(current_difficulty, change)

        # Add change info to reasoning
        if change > 0:
            reasoning_parts.append(f"Increasing difficulty from {current_difficulty} to {new_difficulty}")
        elif change < 0:
            reasoning_parts.append(f"Decreasing difficulty from {current_difficulty} to {new_difficulty}")
        else:
            reasoning_parts.append(f"Maintaining {current_difficulty} difficulty")

        reasoning = ". ".join(reasoning_parts) + "."

        return DifficultyDecision(
            recommended_difficulty=new_difficulty,
            confidence=confidence,
            reasoning=reasoning,
            change_from_current=change
        )

    def decide_format(
        self,
        user_profile: Dict[str, Any],
        metrics_summary: MetricsSummary
    ) -> FormatDecision:
        """
        Decide on content format based on engagement and performance.

        Rules:
        - If followups > 3 → Visual or interactive (needs more support)
        - If quick responses + high accuracy → Text (efficient learner)
        - If slow responses → Video (needs more explanation)
        - If preferred_format set → Bias towards preference

        Args:
            user_profile: User profile with preferred_format field
            metrics_summary: Summary of recent metrics

        Returns:
            FormatDecision with recommendation and reasoning
        """
        preferred_format = user_profile.get("preferred_format")

        # If user has strong preference, use it
        if preferred_format and preferred_format in self.config.FORMATS:
            return FormatDecision(
                recommended_format=preferred_format,
                confidence=0.9,
                reasoning=f"Using user's preferred format: {preferred_format}"
            )

        # Cold start or no metrics
        if not metrics_summary.has_data:
            return FormatDecision(
                recommended_format=self.config.DEFAULT_FORMAT,
                confidence=0.3,
                reasoning="No interaction data. Starting with text format."
            )

        # Calculate metrics
        avg_accuracy = (
            sum(metrics_summary.recent_accuracy) / len(metrics_summary.recent_accuracy)
            if metrics_summary.recent_accuracy else 0.5
        )
        avg_rt = (
            sum(metrics_summary.recent_response_times) / len(metrics_summary.recent_response_times)
            if metrics_summary.recent_response_times else 60.0
        )

        # Calculate confidence
        confidence = self._calculate_confidence(metrics_summary.sample_size)

        # Apply decision rules
        reasoning_parts = []

        # Rule 1: High engagement (many followups) → Visual/interactive
        if metrics_summary.total_followups > self.config.FOLLOWUPS_HIGH_THRESHOLD:
            recommended = "visual"
            reasoning_parts.append(
                f"High number of followup questions ({metrics_summary.total_followups}) "
                "suggests need for more visual support"
            )

        # Rule 2: Efficient learner (fast + accurate) → Text
        elif avg_accuracy >= self.config.ACCURACY_HIGH_THRESHOLD and avg_rt < self.config.RESPONSE_TIME_FAST_THRESHOLD:
            recommended = "text"
            reasoning_parts.append(
                f"High accuracy ({avg_accuracy:.2f}) with fast responses ({avg_rt:.1f}s) "
                "indicates efficient text-based learning"
            )

        # Rule 3: Slow responses → Video
        elif avg_rt > self.config.RESPONSE_TIME_SLOW_THRESHOLD:
            recommended = "video"
            reasoning_parts.append(
                f"Slow response times ({avg_rt:.1f}s) suggest need for detailed video explanations"
            )

        # Rule 4: Moderate performance → Interactive
        elif avg_accuracy < self.config.ACCURACY_MEDIUM_THRESHOLD:
            recommended = "interactive"
            reasoning_parts.append(
                f"Moderate accuracy ({avg_accuracy:.2f}) benefits from interactive practice"
            )

        # Default: Text
        else:
            recommended = "text"
            reasoning_parts.append("Standard text format for balanced performance")

        reasoning = ". ".join(reasoning_parts) + "."

        return FormatDecision(
            recommended_format=recommended,
            confidence=confidence,
            reasoning=reasoning
        )

    def decide_tempo(
        self,
        user_profile: Dict[str, Any],
        metrics_summary: MetricsSummary,
        session_context: SessionContext
    ) -> TempoDecision:
        """
        Decide on learning tempo based on session length and fatigue signals.

        Rules:
        - If session > 60 min → Suggest break
        - If interactions > 20 in session → Suggest slow/review
        - If response_time increasing over session → Fatigue detected, slow down
        - Otherwise → Normal tempo

        Args:
            user_profile: User profile with learning_pace field
            metrics_summary: Summary of recent metrics
            session_context: Current session information

        Returns:
            TempoDecision with recommendation and reasoning
        """
        learning_pace = user_profile.get("learning_pace", self.config.DEFAULT_PACE)

        # No session context
        if not session_context.has_session_data:
            return TempoDecision(
                recommended_tempo=self.config.DEFAULT_TEMPO,
                confidence=0.5,
                reasoning="No session context. Using normal tempo."
            )

        session_minutes = session_context.session_duration_minutes
        interactions = session_context.messages_count

        # Calculate confidence based on session data
        confidence = min(0.9, 0.5 + (interactions / 20) * 0.4)

        reasoning_parts = []

        # Rule 1: Long session → Suggest break
        if session_minutes > self.config.SESSION_LENGTH_LONG_MINUTES:
            recommended = "break"
            reasoning_parts.append(
                f"Session duration ({session_minutes:.0f} minutes) exceeds recommended time. "
                "Consider taking a break to maintain effectiveness"
            )

        # Rule 2: Many interactions → Suggest review/slow
        elif interactions > self.config.SESSION_INTERACTIONS_HIGH:
            recommended = "slow"
            reasoning_parts.append(
                f"High number of interactions ({interactions}) in this session. "
                "Slowing down for better retention"
            )

        # Rule 3: Detect fatigue from increasing response times
        elif self._detect_fatigue(metrics_summary):
            recommended = "slow"
            reasoning_parts.append(
                "Response times are increasing, suggesting fatigue. Reducing pace"
            )

        # Rule 4: Fast learner (from profile) → Fast tempo
        elif learning_pace == "fast" and interactions < 10:
            recommended = "fast"
            reasoning_parts.append(
                "Learner's pace preference is 'fast' and session is still fresh"
            )

        # Default: Normal tempo
        else:
            recommended = "normal"
            reasoning_parts.append(
                f"Session is progressing well ({interactions} interactions, {session_minutes:.0f} min)"
            )

        reasoning = ". ".join(reasoning_parts) + "."

        return TempoDecision(
            recommended_tempo=recommended,
            confidence=confidence,
            reasoning=reasoning
        )

    def identify_remediation(self, user_profile: Dict[str, Any]) -> RemediationTopics:
        """
        Identify topics needing remediation based on topic mastery.

        Args:
            user_profile: User profile with topic_mastery dict

        Returns:
            RemediationTopics with struggling topics sorted by lowest mastery
        """
        topic_mastery = user_profile.get("topic_mastery", {})

        if not topic_mastery:
            return RemediationTopics(
                topics=[],
                mastery_scores={},
                reasoning="No topic mastery data available yet."
            )

        # Find topics with mastery below threshold
        struggling_topics = {
            topic: score
            for topic, score in topic_mastery.items()
            if score < self.config.MASTERY_STRUGGLING_THRESHOLD
        }

        if not struggling_topics:
            return RemediationTopics(
                topics=[],
                mastery_scores={},
                reasoning="All topics have adequate mastery levels (≥0.4)."
            )

        # Sort by lowest mastery first
        sorted_topics = sorted(struggling_topics.items(), key=lambda x: x[1])
        topics_list = [topic for topic, _ in sorted_topics]

        reasoning = (
            f"Identified {len(topics_list)} topic(s) needing remediation: "
            f"{', '.join([f'{t} ({struggling_topics[t]:.2f})' for t in topics_list[:3]])}. "
            "Focus on strengthening fundamentals in these areas."
        )

        return RemediationTopics(
            topics=topics_list,
            mastery_scores=struggling_topics,
            reasoning=reasoning
        )

    # ===== Helper Methods =====

    def _build_metrics_summary(self, recent_metrics: List[Dict[str, Any]]) -> MetricsSummary:
        """
        Build a metrics summary from raw metric records.

        Parses metrics from Week 2's synchronous metrics format:
        - metric_name: str ("accuracy", "response_time", "followups_count", "attempts_count")
        - metric_value_f: float (the actual metric value)
        - timestamp: datetime

        Args:
            recent_metrics: List of metric dicts from Metric model

        Returns:
            MetricsSummary with extracted and aggregated values
        """
        summary = MetricsSummary()

        for metric in recent_metrics:
            metric_name = metric.get("metric_name", "")
            metric_value = metric.get("metric_value_f")

            if metric_value is None:
                continue

            # Extract accuracy metrics
            if metric_name == "accuracy":
                summary.recent_accuracy.append(float(metric_value))

            # Extract response time metrics
            elif metric_name == "response_time":
                rt = float(metric_value)
                summary.recent_response_times.append(rt)
                summary.response_times_chronological.append(rt)

            # Extract followup metrics
            elif metric_name == "followups_count":
                summary.total_followups += int(metric_value)

            # Extract attempts metrics
            elif metric_name == "attempts_count":
                summary.total_attempts += int(metric_value)

        # Calculate averages
        if summary.recent_accuracy:
            summary.avg_accuracy = sum(summary.recent_accuracy) / len(summary.recent_accuracy)

        if summary.recent_response_times:
            summary.avg_response_time = sum(summary.recent_response_times) / len(summary.recent_response_times)

        if summary.sample_size > 0:
            summary.avg_followups_per_interaction = summary.total_followups / summary.sample_size

        logger.debug(
            "Metrics summary built: %d accuracy samples, %d response_time samples, %d followups total",
            len(summary.recent_accuracy),
            len(summary.recent_response_times),
            summary.total_followups
        )

        return summary

    def _calculate_confidence(self, sample_size: int) -> float:
        """
        Calculate confidence score based on sample size.

        Args:
            sample_size: Number of recent interactions

        Returns:
            Confidence score from 0.0 to 1.0
        """
        if sample_size >= self.config.MIN_METRICS_FOR_HIGH_CONFIDENCE:
            return 0.9
        elif sample_size >= self.config.MIN_METRICS_FOR_MEDIUM_CONFIDENCE:
            return 0.7
        elif sample_size > 0:
            return 0.5
        else:
            return 0.3

    def _detect_fatigue(self, metrics_summary: MetricsSummary) -> bool:
        """
        Detect fatigue from increasing response times over session.

        Args:
            metrics_summary: Summary with chronological response times

        Returns:
            True if fatigue detected, False otherwise
        """
        rts = metrics_summary.response_times_chronological

        if len(rts) < 3:
            return False

        # Split into first half and second half
        mid = len(rts) // 2
        first_half_avg = sum(rts[:mid]) / len(rts[:mid]) if rts[:mid] else 0
        second_half_avg = sum(rts[mid:]) / len(rts[mid:]) if rts[mid:] else 0

        if first_half_avg == 0:
            return False

        # Check if second half is significantly slower (30% increase)
        increase_ratio = (second_half_avg - first_half_avg) / first_half_avg

        return increase_ratio > self.config.SESSION_FATIGUE_RT_INCREASE_PERCENT

    def _generate_overall_reasoning(
        self,
        difficulty: DifficultyDecision,
        format_dec: FormatDecision,
        tempo: TempoDecision,
        remediation: RemediationTopics,
        metrics: MetricsSummary
    ) -> str:
        """
        Generate overall reasoning combining all decisions.

        Args:
            difficulty: Difficulty decision
            format_dec: Format decision
            tempo: Tempo decision
            remediation: Remediation topics
            metrics: Metrics summary

        Returns:
            Human-readable explanation string
        """
        parts = []

        # Add difficulty reasoning (brief)
        if difficulty.change_from_current != 0:
            parts.append(
                f"Adjusting to {difficulty.recommended_difficulty} difficulty based on recent performance"
            )

        # Add format reasoning (brief)
        parts.append(f"Recommending {format_dec.recommended_format} format")

        # Add tempo if not normal
        if tempo.recommended_tempo != "normal":
            parts.append(f"Suggesting {tempo.recommended_tempo} pace")

        # Add remediation if present
        if remediation.topics:
            parts.append(
                f"Focus areas: {', '.join(remediation.topics[:2])}"
            )

        # Add data quality note
        if metrics.sample_size > 0:
            parts.append(f"Based on {metrics.sample_size} recent interactions")
        else:
            parts.append("Initial recommendation (cold start)")

        return ". ".join(parts) + "."
