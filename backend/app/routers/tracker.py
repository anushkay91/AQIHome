from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Household, TrackedAction
from backend.app.schemas import (
    TrackedActionCreate, TrackedActionUpdate, TrackedActionOut, TrackerSummaryOut
)
from backend.app.dependencies import verify_household_owner
from backend.app.services.impact_service import compute_tracker_summary

router = APIRouter(prefix="/households/{household_id}/tracker", tags=["Impact Tracker"])

@router.get("/summary", response_model=TrackerSummaryOut)
def get_tracker_summary(
    household_id: str,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    return compute_tracker_summary(household_id=household.id, db=db)

@router.get("/actions", response_model=List[TrackedActionOut])
def list_tracked_actions(
    household_id: str,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    actions = db.query(TrackedAction).filter(
        TrackedAction.household_id == household.id
    ).order_by(TrackedAction.created_at.asc()).all()
    return [TrackedActionOut.model_validate(a) for a in actions]

@router.post("/actions", response_model=TrackedActionOut, status_code=status.HTTP_201_CREATED)
def create_tracked_action(
    household_id: str,
    action_in: TrackedActionCreate,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    action = TrackedAction(
        household_id=household.id,
        recommendation_id=action_in.recommendation_id,
        action_key=action_in.action_key,
        title=action_in.title,
        category=action_in.category,
        status=action_in.status,
        notes=action_in.notes,
        habit_frequency=action_in.habit_frequency,
        completed_at=datetime.now(timezone.utc) if action_in.status == "completed" else None
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return TrackedActionOut.model_validate(action)

@router.patch("/actions/{action_id}", response_model=TrackedActionOut)
def update_tracked_action(
    household_id: str,
    action_id: str,
    action_update: TrackedActionUpdate,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    action = db.query(TrackedAction).filter(
        TrackedAction.id == action_id,
        TrackedAction.household_id == household.id
    ).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tracked action with ID '{action_id}' not found."
        )

    if action_update.status is not None:
        action.status = action_update.status
        if action_update.status == "completed":
            action.completed_at = datetime.now(timezone.utc)
        elif action_update.status in ["planned", "started", "skipped"]:
            action.completed_at = None

    if action_update.notes is not None:
        action.notes = action_update.notes

    if action_update.habit_frequency is not None:
        action.habit_frequency = action_update.habit_frequency

    db.commit()
    db.refresh(action)
    return TrackedActionOut.model_validate(action)
