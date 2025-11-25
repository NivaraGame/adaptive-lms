"""
Metrics computation workflow module.

This module orchestrates the complete metrics computation pipeline:
1. Listen for message creation events
2. Compute synchronous metrics
3. Store metrics in database
4. Aggregate metrics and update user profile

This is the integration layer that connects synchronous metrics
and aggregators into an automated workflow.
"""

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

from .synchronous import (
    compute_synchronous_metrics,
    store_metrics,
    extract_message_data
)
from .aggregators import aggregate_metrics

# Configure logging
logger = logging.getLogger(__name__)


class MetricsWorkflowError(Exception):
    """Custom exception for metrics workflow errors"""
    pass


def process_message_metrics(
    message_id: int,
    db: Session,
    trigger_type: str = "message_creation"
) -> Dict[str, Any]:
    """
    Main workflow function that processes metrics after a message is created.

    This function orchestrates the complete metrics computation pipeline:
    1. Fetch message and related data from database
    2. Extract relevant data for metrics computation
    3. Compute synchronous metrics (accuracy, response_time, etc.)
    4. Store metrics in the metrics table
    5. Aggregate metrics and update user profile

    Args:
        message_id: ID of the message to process
        db: SQLAlchemy database session
        trigger_type: Type of trigger (default: "message_creation")
            Options: "message_creation", "manual_trigger", "batch_process"

    Returns:
        dict: Processing results including metrics and profile updates
            {
                "success": bool,
                "message_id": int,
                "metrics": dict,
                "profile_updates": dict,
                "error": str (if failed)
            }

    Raises:
        MetricsWorkflowError: If workflow encounters critical errors

    Example:
        >>> result = process_message_metrics(message_id=123, db=db)
        >>> if result["success"]:
        ...     print(f"Metrics computed: {result['metrics']}")
    """
    logger.info(f"Starting metrics workflow for message_id={message_id}, trigger={trigger_type}")

    result = {
        "success": False,
        "message_id": message_id,
        "metrics": None,
        "profile_updates": None,
        "error": None
    }

    try:
        # Step 1: Fetch message and related entities
        logger.debug(f"Fetching message and related data for message_id={message_id}")
        message, dialog, content, dialog_messages = _fetch_message_data(message_id, db)

        if not message:
            error_msg = f"Message with id {message_id} not found"
            logger.error(error_msg)
            result["error"] = error_msg
            return result

        # Only process user messages (not system messages)
        if message.sender_type != "user":
            logger.info(f"Skipping metrics for system message (message_id={message_id})")
            result["success"] = True
            result["error"] = "System message - no metrics computed"
            return result

        # Step 2: Extract data for metrics computation
        logger.debug(f"Extracting message data for message_id={message_id}")
        message_data = extract_message_data(
            message=message,
            content=content,
            dialog_messages=dialog_messages
        )

        # Ensure user_id is set (from dialog relationship)
        if not message_data.get("user_id") and dialog:
            message_data["user_id"] = dialog.user_id

        if not message_data.get("user_id"):
            error_msg = f"Unable to determine user_id for message_id={message_id}"
            logger.error(error_msg)
            result["error"] = error_msg
            return result

        # Step 3: Compute synchronous metrics
        logger.info(f"Computing synchronous metrics for message_id={message_id}")
        metrics = compute_synchronous_metrics(message_data, db)

        logger.debug(f"Computed metrics: {metrics}")
        result["metrics"] = metrics

        # Step 4: Store metrics in database
        logger.info(f"Storing metrics for message_id={message_id}")
        metric_objects = store_metrics(metrics, db)

        logger.debug(f"Stored {len(metric_objects)} metric entries")

        # Step 5: Aggregate metrics and update user profile
        logger.info(f"Aggregating metrics for user_id={message_data['user_id']}")
        profile_updates = aggregate_metrics(
            user_id=message_data["user_id"],
            metrics=metrics,
            db=db
        )

        logger.debug(f"Profile updates: {profile_updates}")
        result["profile_updates"] = profile_updates

        # Mark as successful
        result["success"] = True
        logger.info(f"Metrics workflow completed successfully for message_id={message_id}")

        return result

    except SQLAlchemyError as e:
        # Database errors - rollback transaction
        logger.error(f"Database error in metrics workflow for message_id={message_id}: {str(e)}")
        db.rollback()
        result["error"] = f"Database error: {str(e)}"
        raise MetricsWorkflowError(f"Database error processing metrics: {str(e)}") from e

    except Exception as e:
        # Unexpected errors - log and re-raise
        logger.error(f"Unexpected error in metrics workflow for message_id={message_id}: {str(e)}")
        db.rollback()
        result["error"] = f"Unexpected error: {str(e)}"
        raise MetricsWorkflowError(f"Unexpected error processing metrics: {str(e)}") from e


def _fetch_message_data(
    message_id: int,
    db: Session
) -> tuple:
    """
    Fetch message and related entities from database.

    Args:
        message_id: ID of the message
        db: Database session

    Returns:
        tuple: (message, dialog, content, dialog_messages)
    """
    from app.models.message import Message
    from app.models.dialog import Dialog
    from app.models.content import ContentItem

    # Fetch message with dialog relationship
    message = db.query(Message).filter(Message.message_id == message_id).first()

    if not message:
        return None, None, None, None

    # Fetch dialog
    dialog = db.query(Dialog).filter(Dialog.dialog_id == message.dialog_id).first()

    # Fetch content if content_id is in extra_data
    content = None
    content_id = message.extra_data.get("content_id") if message.extra_data else None
    if content_id:
        content = db.query(ContentItem).filter(ContentItem.content_id == content_id).first()

    # Fetch all messages in dialog for follow-up count
    dialog_messages = db.query(Message).filter(
        Message.dialog_id == message.dialog_id
    ).order_by(Message.timestamp).all()

    # Convert to dict format for extract_message_data function
    dialog_messages_dict = [
        {
            "message_id": msg.message_id,
            "sender_type": msg.sender_type,
            "content": msg.content,
            "timestamp": msg.timestamp
        }
        for msg in dialog_messages
    ]

    return message, dialog, content, dialog_messages_dict


def process_batch_metrics(
    message_ids: list,
    db: Session
) -> Dict[str, Any]:
    """
    Process metrics for multiple messages in batch.

    Useful for backfilling metrics or reprocessing.

    Args:
        message_ids: List of message IDs to process
        db: Database session

    Returns:
        dict: Batch processing results
            {
                "total": int,
                "successful": int,
                "failed": int,
                "results": list[dict]
            }

    Example:
        >>> results = process_batch_metrics([1, 2, 3, 4, 5], db)
        >>> print(f"Processed {results['successful']}/{results['total']} messages")
    """
    logger.info(f"Starting batch metrics processing for {len(message_ids)} messages")

    batch_result = {
        "total": len(message_ids),
        "successful": 0,
        "failed": 0,
        "results": []
    }

    for message_id in message_ids:
        try:
            result = process_message_metrics(message_id, db, trigger_type="batch_process")

            if result["success"]:
                batch_result["successful"] += 1
            else:
                batch_result["failed"] += 1

            batch_result["results"].append(result)

        except Exception as e:
            logger.error(f"Error processing message_id={message_id} in batch: {str(e)}")
            batch_result["failed"] += 1
            batch_result["results"].append({
                "success": False,
                "message_id": message_id,
                "error": str(e)
            })

    logger.info(
        f"Batch processing complete: {batch_result['successful']} successful, "
        f"{batch_result['failed']} failed"
    )

    return batch_result


def check_user_profile_exists(user_id: int, db: Session) -> bool:
    """
    Check if user profile exists before processing metrics.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        bool: True if profile exists, False otherwise
    """
    from app.models.user_profile import UserProfile

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    return profile is not None


def create_user_profile_if_missing(user_id: int, db: Session) -> bool:
    """
    Create user profile if it doesn't exist.

    This ensures metrics processing won't fail due to missing profile.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        bool: True if profile was created or already exists, False on error
    """
    from app.models.user_profile import UserProfile

    try:
        # Check if profile exists
        if check_user_profile_exists(user_id, db):
            logger.debug(f"User profile already exists for user_id={user_id}")
            return True

        # Create new profile
        logger.info(f"Creating user profile for user_id={user_id}")
        profile = UserProfile(
            user_id=user_id,
            topic_mastery={},
            avg_response_time=0.0,
            total_interactions=0,
            learning_pace="medium",  # Default value
            current_difficulty="normal",  # Default value
            preferred_format=None,
            avg_accuracy=None,
            total_time_spent=0.0,
            error_patterns=[],
            extra_data={},
            last_updated=datetime.utcnow()
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

        logger.info(f"User profile created successfully for user_id={user_id}")
        return True

    except Exception as e:
        logger.error(f"Error creating user profile for user_id={user_id}: {str(e)}")
        db.rollback()
        return False
