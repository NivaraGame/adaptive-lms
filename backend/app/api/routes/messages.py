from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import logging
import time

from app.db.session import get_db
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse
from app.core.metrics import process_message_metrics, create_user_profile_if_missing

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    include_recommendation: bool = Query(
        False,
        description="If true, automatically generate and return next content recommendation after processing message"
    )
) -> Dict[str, Any]:
    """
    Create a new message in a dialog.

    **Full Workflow Integration (Week 3, Section 5):**
    This endpoint implements the complete adaptive learning loop:
    1. User submits answer/message → Message created
    2. Metrics computed automatically (accuracy, response_time, etc.)
    3. User profile updated with aggregated metrics
    4. Optionally: Adaptation engine recommends next content
    5. Content selected and returned

    **Query Parameters:**
    - `include_recommendation` (bool, default=False): If true, automatically triggers
      the recommendation engine after processing metrics, returning both the created
      message and the next recommended content in a single response.

    **Workflow Steps with Logging:**
    - Step 1: Validate dialog and create message
    - Step 2: Compute and store metrics (user messages only)
    - Step 3: Update user profile via aggregators
    - Step 4: Generate recommendation (if requested)
    - Step 5: Return complete response with timing info

    **Response Format:**
    ```json
    {
        "message": {...},
        "recommendation": {...},  // Only if include_recommendation=true
        "workflow_metadata": {
            "metrics_computed": true,
            "profile_updated": true,
            "recommendation_generated": true,
            "total_processing_time_ms": 250
        }
    }
    ```

    **Example Usage:**
    ```bash
    # Submit answer and get next recommendation in one call
    curl -X POST "http://localhost:8000/api/v1/messages?include_recommendation=true" \\
         -H "Content-Type: application/json" \\
         -d '{
           "dialog_id": 42,
           "sender_type": "user",
           "content": "The answer is 42",
           "extra_data": {"content_id": 15, "is_correct": true}
         }'
    ```
    """
    workflow_start_time = time.time()
    workflow_metadata = {
        "metrics_computed": False,
        "profile_updated": False,
        "recommendation_generated": False,
        "errors": []
    }

    # STEP 1: Validate dialog and create message
    logger.info(
        f"[WORKFLOW] Step 1/5: Creating message for dialog_id={message.dialog_id}, "
        f"sender={message.sender_type}, include_recommendation={include_recommendation}"
    )
    step_start = time.time()

    from app.models.dialog import Dialog
    dialog = db.query(Dialog).filter(Dialog.dialog_id == message.dialog_id).first()
    if not dialog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dialog with id {message.dialog_id} not found"
        )

    db_message = Message(
        dialog_id=message.dialog_id,
        sender_type=message.sender_type,
        content=message.content,
        is_question=message.is_question,
        extra_data=message.extra_data
    )

    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    step_duration = (time.time() - step_start) * 1000
    logger.info(
        f"[WORKFLOW] Step 1/5 completed: message_id={db_message.message_id} "
        f"created in {step_duration:.2f}ms"
    )

    # Initialize response
    response = {
        "message": MessageResponse.model_validate(db_message),
        "recommendation": None,
        "workflow_metadata": workflow_metadata
    }

    # STEP 2-4: Process metrics and optionally generate recommendation (only for user messages)
    if message.sender_type == "user":
        metrics_result = None

        try:
            # STEP 2: Ensure user profile exists
            logger.info(
                f"[WORKFLOW] Step 2/5: Ensuring user profile exists for user_id={dialog.user_id}"
            )
            step_start = time.time()

            create_user_profile_if_missing(dialog.user_id, db)

            step_duration = (time.time() - step_start) * 1000
            logger.info(
                f"[WORKFLOW] Step 2/5 completed: Profile check/creation in {step_duration:.2f}ms"
            )

            # STEP 3: Process metrics (compute + store + aggregate)
            logger.info(
                f"[WORKFLOW] Step 3/5: Computing metrics for message_id={db_message.message_id}"
            )
            step_start = time.time()

            metrics_result = process_message_metrics(db_message.message_id, db)

            step_duration = (time.time() - step_start) * 1000
            logger.info(
                f"[WORKFLOW] Step 3/5 completed: Metrics computed and profile updated "
                f"in {step_duration:.2f}ms"
            )

            if metrics_result and metrics_result.get("success"):
                workflow_metadata["metrics_computed"] = True
                workflow_metadata["profile_updated"] = True
            else:
                error_msg = metrics_result.get("error", "Unknown error") if metrics_result else "No result"
                workflow_metadata["errors"].append(f"Metrics computation failed: {error_msg}")
                logger.warning(f"[WORKFLOW] Step 3/5 had errors: {error_msg}")

        except Exception as e:
            # Log the error but don't fail the message creation
            error_msg = f"Error in metrics workflow: {str(e)}"
            workflow_metadata["errors"].append(error_msg)
            logger.error(
                f"[WORKFLOW] Step 3/5 failed for message_id={db_message.message_id}: {error_msg}",
                exc_info=True
            )
            # In production, you might want to queue this for retry

        # STEP 4: Generate recommendation if requested
        if include_recommendation:
            try:
                logger.info(
                    f"[WORKFLOW] Step 4/5: Generating recommendation for user_id={dialog.user_id}, "
                    f"dialog_id={dialog.dialog_id}"
                )
                step_start = time.time()

                from app.services.recommendation_service import RecommendationService
                recommendation_service = RecommendationService(db)

                recommendation = recommendation_service.get_next_recommendation(
                    user_id=dialog.user_id,
                    dialog_id=dialog.dialog_id
                )

                # Add recommendation to response
                from app.schemas.recommendation import ContentSummary, RecommendationMetadata
                response["recommendation"] = {
                    "content": ContentSummary(
                        content_id=recommendation['content'].content_id,
                        title=recommendation['content'].title,
                        difficulty_level=recommendation['content'].difficulty_level,
                        format=recommendation['content'].format,
                        content_type=recommendation['content'].content_type,
                        topic=recommendation['content'].topic,
                        subtopic=recommendation['content'].subtopic
                    ).model_dump(),
                    "reasoning": recommendation['reasoning'],
                    "confidence": recommendation['confidence'],
                    "recommendation_metadata": recommendation['recommendation_metadata'],
                    "strategy_used": recommendation['strategy_used'],
                    "timestamp": recommendation['timestamp']
                }

                workflow_metadata["recommendation_generated"] = True
                step_duration = (time.time() - step_start) * 1000
                logger.info(
                    f"[WORKFLOW] Step 4/5 completed: Recommendation generated "
                    f"(content_id={recommendation['content'].content_id}) in {step_duration:.2f}ms"
                )

            except Exception as e:
                error_msg = f"Error generating recommendation: {str(e)}"
                workflow_metadata["errors"].append(error_msg)
                logger.error(
                    f"[WORKFLOW] Step 4/5 failed: {error_msg}",
                    exc_info=True
                )
                # Don't fail the entire request - recommendation is optional
        else:
            logger.info("[WORKFLOW] Step 4/5: Skipped (recommendation not requested)")

    else:
        logger.info(
            "[WORKFLOW] Steps 2-4: Skipped for system message (no metrics/recommendations needed)"
        )

    # STEP 5: Finalize response
    total_duration = (time.time() - workflow_start_time) * 1000
    workflow_metadata["total_processing_time_ms"] = round(total_duration, 2)

    logger.info(
        f"[WORKFLOW] Step 5/5: Complete workflow finished in {total_duration:.2f}ms - "
        f"metrics={workflow_metadata['metrics_computed']}, "
        f"profile={workflow_metadata['profile_updated']}, "
        f"recommendation={workflow_metadata['recommendation_generated']}, "
        f"errors={len(workflow_metadata['errors'])}"
    )

    # Convert MessageResponse to dict for consistent JSON response
    response["message"] = response["message"].model_dump()

    return response


@router.get("/dialog/{dialog_id}", response_model=List[MessageResponse])
def list_dialog_messages(dialog_id: int, db: Session = Depends(get_db)):
    """
    Get all messages in a dialog
    """
    messages = db.query(Message).filter(Message.dialog_id == dialog_id).order_by(Message.timestamp).all()
    return messages
