"""
Recommendation Service - Business Logic Layer

This service provides high-level business logic for content recommendations:
- Orchestrates the adaptation engine and content service
- Implements content ranking and selection algorithms
- Handles cold start scenarios
- Manages diversity (avoiding content repetition)
- Generates human-readable reasoning
- Tracks recommendation history

This service layer separates business logic from API routes and adapters.
"""

import logging
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.adaptation.engine import AdaptationEngine, AdaptationStrategy
from app.core.adaptation.rules import AdaptationRecommendation
from app.services.content_service import (
    get_content_by_filters,
    get_random_content,
    ContentNotFoundError
)
from app.models.content import ContentItem
from app.models.user_profile import UserProfile

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Service for generating personalized content recommendations.

    This service coordinates:
    1. Adaptation engine (decision making)
    2. Content service (content retrieval)
    3. Ranking logic (content selection)
    4. Diversity tracking (avoiding repetition)
    5. Reasoning generation (explanations)

    Example:
        >>> service = RecommendationService(db_session)
        >>> rec = service.get_next_recommendation(user_id=1, dialog_id=42)
        >>> print(rec['content'].title)
        'Advanced Algebra Problem Set'
        >>> print(rec['reasoning'])
        'Based on your high accuracy...'
    """

    def __init__(self, db: Session):
        """
        Initialize the recommendation service.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.adaptation_engine = AdaptationEngine(db)
        logger.info("RecommendationService initialized")

    def get_next_recommendation(
        self,
        user_id: int,
        dialog_id: Optional[int] = None,
        override_difficulty: Optional[str] = None,
        override_format: Optional[str] = None,
        exclude_content_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Get next content recommendation for a user.

        This is the main entry point for recommendations. It:
        1. Calls adaptation engine for decision
        2. Queries content service with recommended parameters
        3. Ranks and selects best content
        4. Generates reasoning
        5. Returns complete recommendation package

        Args:
            user_id: ID of the user
            dialog_id: Optional dialog ID for session context
            override_difficulty: Optional difficulty override (for testing/debugging)
            override_format: Optional format override
            exclude_content_ids: Optional list of content IDs to exclude (for diversity)

        Returns:
            Dict containing:
                - content: ContentItem object
                - reasoning: Human-readable explanation
                - confidence: Confidence score (0-1)
                - recommendation_metadata: Additional metadata
                - strategy_used: Strategy that made the decision

        Raises:
            Exception: If no suitable content can be found

        Example:
            >>> rec = service.get_next_recommendation(user_id=1, dialog_id=42)
            >>> print(rec['content'].title)
            >>> print(rec['reasoning'])
        """
        logger.info(
            f"Getting recommendation: user_id={user_id}, dialog_id={dialog_id}, "
            f"overrides=(difficulty={override_difficulty}, format={override_format})"
        )

        # Get adaptation decision from engine
        adaptation_rec = self.adaptation_engine.get_recommendation(
            user_id=user_id,
            dialog_id=dialog_id
        )

        # Apply overrides if provided (for testing/debugging)
        recommended_difficulty = override_difficulty or adaptation_rec.difficulty.recommended_difficulty
        recommended_format = override_format or adaptation_rec.format.recommended_format

        # Get topic focus (remediation or current topic)
        topic_focus = self._determine_topic_focus(adaptation_rec, dialog_id)

        # Get recently shown content for diversity
        if exclude_content_ids is None:
            exclude_content_ids = self._get_recently_shown_content(user_id, limit=5)

        # Query and rank content
        selected_content = self._select_best_content(
            topic=topic_focus,
            difficulty=recommended_difficulty,
            format=recommended_format,
            exclude_ids=exclude_content_ids,
            adaptation_rec=adaptation_rec
        )

        # Generate comprehensive reasoning
        reasoning = self._generate_reasoning(
            adaptation_rec=adaptation_rec,
            selected_content=selected_content,
            topic_focus=topic_focus
        )

        # Build recommendation package
        recommendation = {
            "content": selected_content,
            "reasoning": reasoning,
            "confidence": adaptation_rec.overall_confidence,
            "recommendation_metadata": {
                "difficulty": recommended_difficulty,
                "format": recommended_format,
                "topic": topic_focus,
                "tempo": adaptation_rec.tempo.recommended_tempo,
                "remediation_topics": adaptation_rec.remediation.topics,
                "adaptation_metadata": adaptation_rec.metadata
            },
            "strategy_used": adaptation_rec.metadata.get("strategy", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }

        logger.info(
            f"Recommendation generated: content_id={selected_content.content_id}, "
            f"difficulty={recommended_difficulty}, format={recommended_format}, "
            f"confidence={adaptation_rec.overall_confidence:.2f}"
        )

        return recommendation

    def _determine_topic_focus(
        self,
        adaptation_rec: AdaptationRecommendation,
        dialog_id: Optional[int]
    ) -> Optional[str]:
        """
        Determine which topic to focus on.

        Priority:
        1. Remediation topics (if struggling)
        2. Current dialog topic (if in active session)
        3. None (let content selection be flexible)

        Args:
            adaptation_rec: Adaptation recommendation with remediation info
            dialog_id: Optional dialog ID

        Returns:
            Topic string or None
        """
        # Priority 1: Remediation
        if adaptation_rec.remediation.topics:
            topic = adaptation_rec.remediation.topics[0]  # Weakest topic first
            logger.info(f"Focus on remediation topic: {topic}")
            return topic

        # Priority 2: Current dialog topic
        if dialog_id:
            from app.models.dialog import Dialog
            dialog = self.db.query(Dialog).filter(
                Dialog.dialog_id == dialog_id
            ).first()
            if dialog and dialog.topic:
                logger.info(f"Focus on current dialog topic: {dialog.topic}")
                return dialog.topic

        # Priority 3: No specific focus
        logger.info("No specific topic focus, allowing flexible selection")
        return None

    def _select_best_content(
        self,
        topic: Optional[str],
        difficulty: str,
        format: str,
        exclude_ids: List[int],
        adaptation_rec: AdaptationRecommendation
    ) -> ContentItem:
        """
        Select the best content item based on recommendations.

        This implements a multi-tiered selection strategy:
        1. Try exact match (topic + difficulty + format)
        2. Try relaxed format (topic + difficulty, any format)
        3. Try relaxed difficulty (topic + any difficulty + format)
        4. Try topic only
        5. Fall back to random content

        Args:
            topic: Optional topic to filter by
            difficulty: Recommended difficulty
            format: Recommended format
            exclude_ids: Content IDs to exclude
            adaptation_rec: Full adaptation recommendation (for scoring)

        Returns:
            Selected ContentItem

        Raises:
            Exception: If no content can be found at all
        """
        logger.debug(
            f"Selecting content: topic={topic}, difficulty={difficulty}, "
            f"format={format}, exclude_count={len(exclude_ids)}"
        )

        # Strategy 1: Exact match (topic + difficulty + format)
        candidates = self._query_content_with_exclusions(
            topic=topic,
            difficulty=difficulty,
            format=format,
            exclude_ids=exclude_ids,
            limit=10
        )

        if candidates:
            logger.info(f"Found {len(candidates)} exact matches")
            return self._rank_and_select(candidates, adaptation_rec)

        # Strategy 2: Relax format (topic + difficulty, any format)
        if topic:
            candidates = self._query_content_with_exclusions(
                topic=topic,
                difficulty=difficulty,
                format=None,
                exclude_ids=exclude_ids,
                limit=10
            )

            if candidates:
                logger.info(f"Found {len(candidates)} matches (relaxed format)")
                return self._rank_and_select(candidates, adaptation_rec)

        # Strategy 3: Relax difficulty (topic + format, any difficulty)
        if topic:
            candidates = self._query_content_with_exclusions(
                topic=topic,
                difficulty=None,
                format=format,
                exclude_ids=exclude_ids,
                limit=10
            )

            if candidates:
                logger.info(f"Found {len(candidates)} matches (relaxed difficulty)")
                return self._rank_and_select(candidates, adaptation_rec)

        # Strategy 4: Topic only
        if topic:
            candidates = self._query_content_with_exclusions(
                topic=topic,
                difficulty=None,
                format=None,
                exclude_ids=exclude_ids,
                limit=10
            )

            if candidates:
                logger.info(f"Found {len(candidates)} matches (topic only)")
                return self._rank_and_select(candidates, adaptation_rec)

        # Strategy 5: Fallback to random content (no filters)
        logger.warning("No content found with filters, using random content fallback")
        content = get_random_content(self.db)

        if not content:
            raise Exception("No content available in database")

        return content

    def _query_content_with_exclusions(
        self,
        topic: Optional[str],
        difficulty: Optional[str],
        format: Optional[str],
        exclude_ids: List[int],
        limit: int = 10
    ) -> List[ContentItem]:
        """
        Query content with filters and exclusions.

        Args:
            topic: Optional topic filter
            difficulty: Optional difficulty filter
            format: Optional format filter
            exclude_ids: Content IDs to exclude
            limit: Maximum items to return

        Returns:
            List of ContentItem objects
        """
        content_items, total = get_content_by_filters(
            db=self.db,
            topic=topic,
            difficulty=difficulty,
            format=format,
            limit=limit
        )

        # Filter out excluded IDs
        if exclude_ids:
            content_items = [
                item for item in content_items
                if item.content_id not in exclude_ids
            ]

        return content_items

    def _rank_and_select(
        self,
        candidates: List[ContentItem],
        adaptation_rec: AdaptationRecommendation
    ) -> ContentItem:
        """
        Rank candidate content items and select the best one.

        Scoring criteria:
        - Match with recommended difficulty (+3 points)
        - Match with recommended format (+2 points)
        - Match with remediation topics (+5 points)
        - Content type preference (exercise > quiz > lesson > explanation)
        - Random factor for diversity (±1 point)

        Args:
            candidates: List of candidate content items
            adaptation_rec: Adaptation recommendation for scoring

        Returns:
            Best ranked ContentItem
        """
        if len(candidates) == 1:
            return candidates[0]

        import random

        scored_items = []

        for item in candidates:
            score = 0.0

            # Difficulty match
            if item.difficulty_level == adaptation_rec.difficulty.recommended_difficulty:
                score += 3.0

            # Format match
            if item.format == adaptation_rec.format.recommended_format:
                score += 2.0

            # Remediation topic match
            if adaptation_rec.remediation.topics:
                if item.topic in adaptation_rec.remediation.topics:
                    score += 5.0

            # Content type preference
            content_type_scores = {
                'exercise': 2.0,
                'quiz': 1.5,
                'lesson': 1.0,
                'explanation': 0.5
            }
            score += content_type_scores.get(item.content_type, 0.0)

            # Random factor for diversity
            score += random.uniform(-1.0, 1.0)

            scored_items.append((item, score))

        # Sort by score descending
        scored_items.sort(key=lambda x: x[1], reverse=True)

        best_item = scored_items[0][0]
        best_score = scored_items[0][1]

        logger.debug(
            f"Selected content_id={best_item.content_id} with score={best_score:.2f} "
            f"from {len(candidates)} candidates"
        )

        return best_item

    def _get_recently_shown_content(
        self,
        user_id: int,
        limit: int = 5
    ) -> List[int]:
        """
        Get list of recently shown content IDs for diversity tracking.

        This helps avoid showing the same content repeatedly.

        Args:
            user_id: ID of the user
            limit: Number of recent content IDs to track

        Returns:
            List of content IDs
        """
        from app.models.message import Message
        from app.models.dialog import Dialog

        try:
            # Get recent messages with content_id stored in extra_data
            recent_messages = self.db.query(Message).join(
                Dialog, Message.dialog_id == Dialog.dialog_id
            ).filter(
                Dialog.user_id == user_id
            ).order_by(
                Message.timestamp.desc()
            ).limit(limit).all()

            content_ids = []
            for msg in recent_messages:
                # Check if content_id is in extra_data
                if msg.extra_data and 'content_id' in msg.extra_data:
                    content_ids.append(msg.extra_data['content_id'])

            logger.debug(f"Recently shown content IDs for user {user_id}: {content_ids}")
            return content_ids

        except Exception as e:
            logger.warning(f"Failed to get recent content: {e}")
            return []

    def _generate_reasoning(
        self,
        adaptation_rec: AdaptationRecommendation,
        selected_content: ContentItem,
        topic_focus: Optional[str]
    ) -> str:
        """
        Generate human-readable reasoning for the recommendation.

        Args:
            adaptation_rec: Adaptation recommendation with decisions
            selected_content: The selected content item
            topic_focus: Topic that was focused on (if any)

        Returns:
            Human-readable reasoning string
        """
        parts = []

        # Start with overall adaptation reasoning
        parts.append(adaptation_rec.overall_reasoning)

        # Add content-specific reasoning
        parts.append(
            f"Selected '{selected_content.title}' "
            f"({selected_content.difficulty_level} {selected_content.format} "
            f"{selected_content.content_type} on {selected_content.topic})"
        )

        # Add remediation context if applicable
        if adaptation_rec.remediation.topics and topic_focus in adaptation_rec.remediation.topics:
            mastery = adaptation_rec.remediation.mastery_scores.get(topic_focus, 0.0)
            parts.append(
                f"This content addresses {topic_focus}, where you currently have "
                f"{mastery:.0%} mastery and need additional practice"
            )

        # Add tempo advice if not normal
        if adaptation_rec.tempo.recommended_tempo != "normal":
            parts.append(
                f"Pacing suggestion: {adaptation_rec.tempo.reasoning}"
            )

        reasoning = ". ".join(parts)

        # Ensure it ends with a period
        if not reasoning.endswith("."):
            reasoning += "."

        return reasoning

    def get_recommendation_history(
        self,
        user_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recommendation history for a user.

        This returns recent content shown to the user along with context.

        Args:
            user_id: ID of the user
            limit: Maximum number of records to return

        Returns:
            List of dicts with recommendation history

        Example:
            >>> history = service.get_recommendation_history(user_id=1, limit=5)
            >>> for rec in history:
            ...     print(rec['content_title'], rec['timestamp'])
        """
        from app.models.message import Message
        from app.models.dialog import Dialog
        from app.models.content import ContentItem

        try:
            # Get messages with content_id in extra_data
            messages = self.db.query(Message).join(
                Dialog, Message.dialog_id == Dialog.dialog_id
            ).filter(
                Dialog.user_id == user_id
            ).order_by(
                Message.timestamp.desc()
            ).limit(limit * 2).all()  # Get more to filter

            history = []
            for msg in messages:
                if msg.extra_data and 'content_id' in msg.extra_data:
                    content_id = msg.extra_data['content_id']

                    # Fetch content details
                    content = self.db.query(ContentItem).filter(
                        ContentItem.content_id == content_id
                    ).first()

                    if content:
                        history.append({
                            "content_id": content_id,
                            "content_title": content.title,
                            "difficulty": content.difficulty_level,
                            "format": content.format,
                            "topic": content.topic,
                            "timestamp": msg.timestamp.isoformat(),
                            "dialog_id": msg.dialog_id
                        })

                if len(history) >= limit:
                    break

            logger.info(f"Retrieved {len(history)} history items for user {user_id}")
            return history

        except Exception as e:
            logger.error(f"Failed to get recommendation history: {e}")
            return []

    def get_cold_start_recommendation(
        self,
        user_id: int,
        preferred_topic: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get recommendation for a brand new user (cold start scenario).

        Args:
            user_id: ID of the new user
            preferred_topic: Optional preferred topic from user preferences

        Returns:
            Recommendation dict (same format as get_next_recommendation)

        Example:
            >>> rec = service.get_cold_start_recommendation(user_id=999)
            >>> print(rec['reasoning'])
            'Welcome! Starting with normal difficulty...'
        """
        logger.info(f"Cold start recommendation for user {user_id}")

        # Get random content, optionally filtered by topic
        content = get_random_content(
            self.db,
            topic=preferred_topic,
            difficulty="normal"
        )

        if not content:
            # Last resort: any random content
            content = get_random_content(self.db)

        if not content:
            raise Exception("No content available for cold start")

        reasoning = (
            f"Welcome! Starting your learning journey with normal difficulty content. "
            f"Selected '{content.title}' ({content.content_type} on {content.topic}). "
            f"As you progress, we'll adapt the difficulty and format to match your learning style."
        )

        return {
            "content": content,
            "reasoning": reasoning,
            "confidence": 0.3,  # Low confidence for cold start
            "recommendation_metadata": {
                "difficulty": "normal",
                "format": content.format,
                "topic": content.topic,
                "is_cold_start": True
            },
            "strategy_used": "cold_start",
            "timestamp": datetime.utcnow().isoformat()
        }


def get_recommendation(
    user_id: int,
    dialog_id: Optional[int],
    db: Session,
    override_difficulty: Optional[str] = None,
    override_format: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function for getting recommendations.

    This is a functional interface to the RecommendationService.

    Args:
        user_id: ID of the user
        dialog_id: Optional dialog ID
        db: Database session
        override_difficulty: Optional difficulty override
        override_format: Optional format override

    Returns:
        Recommendation dict

    Example:
        >>> from app.services.recommendation_service import get_recommendation
        >>> rec = get_recommendation(user_id=1, dialog_id=42, db=db)
    """
    service = RecommendationService(db)
    return service.get_next_recommendation(
        user_id=user_id,
        dialog_id=dialog_id,
        override_difficulty=override_difficulty,
        override_format=override_format
    )
