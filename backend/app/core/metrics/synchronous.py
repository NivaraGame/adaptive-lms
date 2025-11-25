"""
Synchronous metrics computation module.

This module computes real-time metrics from user interactions:
- accuracy: Correctness of user's answer (binary or score)
- response_time: Time between content delivery and user response
- attempts_count: Number of attempts for a question
- followups_count: Number of follow-up questions asked by user

These metrics are computed immediately after each user interaction
and stored in the metrics table.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session


def compute_accuracy(
    user_answer: str,
    correct_answer: Any,
    answer_type: str = "binary"
) -> float:
    """
    Compute accuracy metric based on user's answer.

    Args:
        user_answer: The answer provided by the user
        correct_answer: The correct answer for the question (can be string, dict/JSONB, or list)
        answer_type: Type of comparison ("binary", "exact", "partial")
            - binary: 1.0 if correct, 0.0 if incorrect
            - exact: Case-insensitive exact match
            - partial: Similarity score (0.0 to 1.0)

    Returns:
        float: Accuracy score between 0.0 and 1.0

    Example:
        >>> compute_accuracy("42", "42", "binary")
        1.0
        >>> compute_accuracy("41", "42", "binary")
        0.0
        >>> compute_accuracy("42", {"answer": "42"}, "binary")
        1.0
    """
    # Handle JSONB reference_answer (could be dict or string)
    if isinstance(correct_answer, dict):
        # Extract answer from dict (common keys: 'answer', 'value', 'correct')
        correct_answer = correct_answer.get("answer") or correct_answer.get("value") or correct_answer.get("correct")

    if isinstance(correct_answer, list):
        # Multiple correct answers - check if user answer matches any
        for ans in correct_answer:
            if isinstance(ans, dict):
                ans = ans.get("answer") or ans.get("value")
            if user_answer.strip().lower() == str(ans).strip().lower():
                return 1.0
        return 0.0

    # Convert to string for comparison
    correct_answer_str = str(correct_answer) if correct_answer is not None else ""

    if answer_type == "binary":
        # Simple binary comparison (case-insensitive)
        return 1.0 if user_answer.strip().lower() == correct_answer_str.strip().lower() else 0.0

    elif answer_type == "exact":
        # Exact match
        return 1.0 if user_answer.strip() == correct_answer_str.strip() else 0.0

    elif answer_type == "partial":
        # Partial credit based on similarity (placeholder for future implementation)
        # Could use Levenshtein distance, word overlap, etc.
        user_lower = user_answer.strip().lower()
        correct_lower = correct_answer_str.strip().lower()
        if user_lower == correct_lower:
            return 1.0
        # TODO: Implement partial credit logic (e.g., word overlap, Levenshtein)
        return 0.0

    else:
        raise ValueError(f"Unknown answer_type: {answer_type}")


def compute_response_time(
    content_delivery_time: datetime,
    user_response_time: datetime
) -> float:
    """
    Compute response time in seconds.

    Args:
        content_delivery_time: Timestamp when content was delivered to user
        user_response_time: Timestamp when user submitted their response

    Returns:
        float: Response time in seconds

    Example:
        >>> from datetime import datetime, timedelta
        >>> t1 = datetime(2025, 1, 1, 10, 0, 0)
        >>> t2 = datetime(2025, 1, 1, 10, 0, 30)
        >>> compute_response_time(t1, t2)
        30.0
    """
    delta = user_response_time - content_delivery_time
    return delta.total_seconds()


def compute_attempts_count(message_data: Dict[str, Any]) -> int:
    """
    Count number of attempts for a question.

    Args:
        message_data: Dictionary containing message metadata
            Expected keys: "attempts" or "attempt_number"

    Returns:
        int: Number of attempts (default: 1)

    Example:
        >>> compute_attempts_count({"attempts": 3})
        3
        >>> compute_attempts_count({})
        1
    """
    return message_data.get("attempts", message_data.get("attempt_number", 1))


def compute_followups_count(dialog_messages: list) -> int:
    """
    Count number of follow-up questions asked by user in a dialog.

    Args:
        dialog_messages: List of messages in the dialog
            Each message should have "role" field ("user" or "system")

    Returns:
        int: Number of follow-up questions (user messages after first)

    Example:
        >>> messages = [
        ...     {"role": "system", "content": "Here's a question..."},
        ...     {"role": "user", "content": "Answer"},
        ...     {"role": "user", "content": "Wait, what about...?"},
        ...     {"role": "user", "content": "And also...?"}
        ... ]
        >>> compute_followups_count(messages)
        2
    """
    # Message model uses 'sender_type' field (not 'role')
    user_messages = [msg for msg in dialog_messages if msg.get("sender_type") == "user" or msg.get("role") == "user"]
    # First user message is the initial answer, rest are follow-ups
    return max(0, len(user_messages) - 1)


def extract_message_data(
    message: Any,
    content: Optional[Any] = None,
    dialog_messages: Optional[list] = None
) -> Dict[str, Any]:
    """
    Extract relevant data from message and related entities.

    Args:
        message: Message object (SQLAlchemy model or dict)
        content: Content object (optional)
        dialog_messages: List of all messages in the dialog (optional)

    Returns:
        dict: Extracted data including timestamps, answers, etc.

    Example:
        >>> message = Message(...)
        >>> data = extract_message_data(message)
        >>> print(data.keys())
        dict_keys(['user_id', 'dialog_id', 'content_id', 'user_answer', ...])
    """
    # Handle both SQLAlchemy models and dicts
    if hasattr(message, '__dict__'):
        # Message model fields: message_id, dialog_id, sender_type, content, timestamp, extra_data
        # Note: user_id comes from Dialog relationship, not directly on Message
        message_dict = {
            "message_id": message.message_id,
            "dialog_id": message.dialog_id,
            "user_id": getattr(message.dialog, "user_id", None) if hasattr(message, "dialog") else None,
            "content_id": message.extra_data.get("content_id") if message.extra_data else None,
            "user_answer": message.content,
            "timestamp": message.timestamp,
            "sender_type": message.sender_type,
            "extra_data": message.extra_data or {},
        }
    else:
        message_dict = message

    extracted = {
        "message_id": message_dict.get("message_id"),
        "user_id": message_dict.get("user_id"),
        "dialog_id": message_dict.get("dialog_id"),
        "content_id": message_dict.get("content_id") or message_dict.get("extra_data", {}).get("content_id"),
        "user_answer": message_dict.get("user_answer", message_dict.get("content")),
        "user_response_time": message_dict.get("timestamp"),
        "attempts": message_dict.get("extra_data", {}).get("attempts", 1),
    }

    # Check if content_delivery_time is in extra_data (preferred method)
    extra_data = message_dict.get("extra_data", {})
    if "content_delivery_time" in extra_data:
        # Parse datetime string if needed
        delivery_time = extra_data["content_delivery_time"]
        if isinstance(delivery_time, str):
            from datetime import datetime
            delivery_time = datetime.fromisoformat(delivery_time.replace('Z', '+00:00'))
        extracted["content_delivery_time"] = delivery_time

    # Extract content data if provided
    # ContentItem model fields: content_id, title, topic, difficulty_level, format,
    # content_data, reference_answer (JSONB), hints, explanations, etc.
    if content:
        if hasattr(content, '__dict__'):
            # reference_answer is JSONB, could contain the answer
            extracted["correct_answer"] = content.reference_answer
            extracted["topic"] = getattr(content, "topic", None)
            # Only use message timestamp as fallback if not already set
            if "content_delivery_time" not in extracted:
                extracted["content_delivery_time"] = message_dict.get("timestamp")
        else:
            extracted["correct_answer"] = content.get("reference_answer") or content.get("correct_answer")
            extracted["topic"] = content.get("topic")
            if "content_delivery_time" not in extracted:
                extracted["content_delivery_time"] = content.get("created_at")

    # Extract dialog messages for follow-up count
    if dialog_messages:
        extracted["dialog_messages"] = dialog_messages

    return extracted


def compute_synchronous_metrics(
    message_data: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """
    Main function to compute all synchronous metrics from a message.

    This is the primary entry point for metrics computation.
    It orchestrates all metric calculation functions.

    Args:
        message_data: Dictionary with extracted message data
            Required keys: user_id, dialog_id, user_answer, user_response_time
            Optional keys: content_id, correct_answer, content_delivery_time,
            dialog_messages, attempts
        db: SQLAlchemy database session

    Returns:
        dict: Computed metrics
            {
                "user_id": int,
                "dialog_id": int,
                "content_id": int,
                "timestamp": datetime,
                "accuracy": float,
                "response_time": float,
                "attempts_count": int,
                "followups_count": int,
            }

    Example:
        >>> message_data = {
        ...     "user_id": 1,
        ...     "dialog_id": 10,
        ...     "user_answer": "42",
        ...     "correct_answer": "42",
        ...     "content_delivery_time": datetime(2025, 1, 1, 10, 0, 0),
        ...     "user_response_time": datetime(2025, 1, 1, 10, 0, 30),
        ...     "attempts": 1,
        ...     "dialog_messages": [...]
        ... }
        >>> metrics = compute_synchronous_metrics(message_data, db)
        >>> print(metrics["accuracy"], metrics["response_time"])
        1.0 30.0
    """
    metrics = {
        "user_id": message_data["user_id"],
        "dialog_id": message_data["dialog_id"],
        "message_id": message_data.get("message_id"),
        "content_id": message_data.get("content_id"),
        "timestamp": message_data.get("user_response_time", datetime.utcnow()),
        "topic": message_data.get("topic"),  # Pass through topic if available
    }

    # Compute accuracy (if correct answer is available)
    if "correct_answer" in message_data and message_data["correct_answer"]:
        metrics["accuracy"] = compute_accuracy(
            message_data["user_answer"],
            message_data["correct_answer"],
            answer_type="binary"
        )
    else:
        # If no correct answer available, assume manual grading needed
        metrics["accuracy"] = None

    # Compute response time (if timestamps are available)
    if "content_delivery_time" in message_data and message_data["content_delivery_time"]:
        metrics["response_time"] = compute_response_time(
            message_data["content_delivery_time"],
            message_data["user_response_time"]
        )
    else:
        metrics["response_time"] = None

    # Compute attempts count
    metrics["attempts_count"] = compute_attempts_count(message_data)

    # Compute follow-ups count (if dialog messages are available)
    if "dialog_messages" in message_data and message_data["dialog_messages"]:
        metrics["followups_count"] = compute_followups_count(
            message_data["dialog_messages"]
        )
    else:
        metrics["followups_count"] = 0

    return metrics


def store_metrics(
    metrics: Dict[str, Any],
    db: Session
) -> list:
    """
    Store computed metrics in the database.

    The Metric model uses a key-value structure with:
    - metric_name: Name of the metric (e.g., 'accuracy', 'response_time')
    - metric_value_f: Float value for numeric metrics
    - metric_value_s: String value (not used for these metrics)
    - metric_value_j: JSONB value for complex data (not used for these metrics)

    Args:
        metrics: Dictionary of computed metrics
        db: SQLAlchemy database session

    Returns:
        list: List of created Metric database objects

    Example:
        >>> metrics = compute_synchronous_metrics(message_data, db)
        >>> metric_objs = store_metrics(metrics, db)
        >>> print(len(metric_objs))
        4
    """
    from app.models.metric import Metric

    metric_objects = []

    # Store each metric as a separate row
    metric_mappings = [
        ("accuracy", metrics.get("accuracy")),
        ("response_time", metrics.get("response_time")),
        ("attempts_count", metrics.get("attempts_count")),
        ("followups_count", metrics.get("followups_count")),
    ]

    for metric_name, metric_value in metric_mappings:
        if metric_value is not None:  # Only store non-null metrics
            metric = Metric(
                user_id=metrics["user_id"],
                dialog_id=metrics["dialog_id"],
                message_id=metrics.get("message_id"),
                metric_name=metric_name,
                metric_value_f=float(metric_value),
                timestamp=metrics["timestamp"],
                context={"content_id": metrics.get("content_id")} if metrics.get("content_id") else {}
            )
            db.add(metric)
            metric_objects.append(metric)

    db.commit()

    # Refresh all objects
    for metric in metric_objects:
        db.refresh(metric)

    return metric_objects
