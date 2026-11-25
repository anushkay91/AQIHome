from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Household, Assessment, Recommendation
from backend.app.schemas import RecommendationOut, ExplainRequest, ExplainResponse
from backend.app.dependencies import verify_household_owner
from backend.app.services.gemini_service import explain_recommendation_with_gemini

router = APIRouter(prefix="/households/{household_id}/recommendations", tags=["Affordable Recommendations"])

@router.get("", response_model=List[RecommendationOut])
def get_recommendations(
    household_id: str,
    category: Optional[str] = Query(None),
    cost_category: Optional[str] = Query(None),
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    latest = db.query(Assessment).filter(
        Assessment.household_id == household.id
    ).order_by(Assessment.created_at.desc()).first()

    if not latest:
        return []

    query = db.query(Recommendation).filter(Recommendation.assessment_id == latest.id)
    if category:
        query = query.filter(Recommendation.category == category)
    if cost_category:
        query = query.filter(Recommendation.cost_category == cost_category)

    recs = query.all()
    return [RecommendationOut.model_validate(r) for r in recs]

@router.post("/{rec_id}/explain", response_model=ExplainResponse)
async def explain_recommendation(
    household_id: str,
    rec_id: str,
    explain_req: ExplainRequest,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    # Enforce strict object-level authorization: recommendation must belong to this household's assessment
    rec = (
        db.query(Recommendation)
        .join(Assessment, Recommendation.assessment_id == Assessment.id)
        .filter(Recommendation.id == rec_id, Assessment.household_id == household.id)
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with ID '{rec_id}' not found for this household."
        )

    household_context = {
        "city": household.city,
        "dwelling_type": household.dwelling_type,
        "approx_rooms": household.approx_rooms,
        "has_elderly_or_infants": household.has_elderly_or_infants,
        "has_respiratory_conditions": household.has_respiratory_conditions,
        "budget_tier": household.budget_tier
    }

    explanation = await explain_recommendation_with_gemini(
        action_key=rec.action_key,
        title=rec.title,
        category=rec.category,
        household_trigger=rec.household_trigger,
        household_context=household_context,
        user_question=explain_req.question
    )

    return explanation
