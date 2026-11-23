import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Household, Assessment, Recommendation, TrackedAction
from backend.app.schemas import (
    AssessmentCreate, AssessmentResultOut, IdentifiedSource,
    OutdoorAqiContext, RecommendationOut
)
from backend.app.dependencies import verify_household_owner
from backend.app.services.rule_engine import evaluate_pollution_sources
from backend.app.services.environmental_service import fetch_outdoor_aqi
from backend.app.services.recommendation_engine import generate_recommendations
from backend.app.services.impact_service import SCIENTIFIC_DISCLAIMER

router = APIRouter(prefix="/households/{household_id}/assessments", tags=["Pollution Detective"])

@router.post("", response_model=AssessmentResultOut, status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    household_id: str,
    assessment_in: AssessmentCreate,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    # 1. Deterministic source evaluation
    identified_sources = evaluate_pollution_sources(
        assessment=assessment_in,
        has_elderly_or_infants=household.has_elderly_or_infants,
        has_respiratory_conditions=household.has_respiratory_conditions
    )

    # 2. Outdoor AQI retrieval with resilient fallback
    outdoor_aqi = await fetch_outdoor_aqi(city=household.city)

    # 3. Generate candidate recommendations
    recommendations_list = generate_recommendations(
        identified_sources=identified_sources,
        outdoor_aqi=outdoor_aqi,
        budget_tier=household.budget_tier,
        has_respiratory_conditions=household.has_respiratory_conditions,
        has_elderly_or_infants=household.has_elderly_or_infants
    )

    # 4. Persist assessment record
    assessment_record = Assessment(
        household_id=household.id,
        cooking_fuel=assessment_in.cooking_fuel,
        cooking_frequency=assessment_in.cooking_frequency,
        kitchen_ventilation=assessment_in.kitchen_ventilation,
        exhaust_fan_type=assessment_in.exhaust_fan_type,
        indoor_smoking=assessment_in.indoor_smoking,
        incense_agarbatti_or_camphor=assessment_in.incense_agarbatti_or_camphor,
        mosquito_coils_usage=assessment_in.mosquito_coils_usage,
        heating_appliance=assessment_in.heating_appliance,
        visible_dampness_mold=assessment_in.visible_dampness_mold,
        cleaning_products_habit=assessment_in.cleaning_products_habit,
        raw_sources_json=json.dumps([s.model_dump() for s in identified_sources]),
        outdoor_aqi_snapshot_json=json.dumps(outdoor_aqi.model_dump())
    )
    db.add(assessment_record)
    db.commit()
    db.refresh(assessment_record)

    # 5. Persist recommendations & seed tracked actions if empty
    saved_recommendations: List[RecommendationOut] = []
    existing_action_keys = {
        a.action_key for a in db.query(TrackedAction).filter(TrackedAction.household_id == household.id).all()
    }

    for rec in recommendations_list:
        rec_model = Recommendation(
            assessment_id=assessment_record.id,
            action_key=rec.action_key,
            title=rec.title,
            category=rec.category,
            priority_tier=rec.priority_tier,
            cost_category=rec.cost_category,
            estimated_cost_inr=rec.estimated_cost_inr,
            household_trigger=rec.household_trigger,
            qualitative_impact=rec.qualitative_impact,
            limitations=rec.limitations,
            evidence_reference=rec.evidence_reference
        )
        db.add(rec_model)
        db.flush()

        # Seed into Impact Tracker as 'planned' if not already present
        if rec.action_key not in existing_action_keys:
            tracked = TrackedAction(
                household_id=household.id,
                recommendation_id=rec_model.id,
                action_key=rec.action_key,
                title=rec.title,
                category=rec.category,
                status="planned"
            )
            db.add(tracked)
            existing_action_keys.add(rec.action_key)

        rec_out = RecommendationOut(
            id=rec_model.id,
            action_key=rec_model.action_key,
            title=rec_model.title,
            category=rec_model.category,
            priority_tier=rec_model.priority_tier,
            cost_category=rec_model.cost_category,
            estimated_cost_inr=rec_model.estimated_cost_inr,
            household_trigger=rec_model.household_trigger,
            qualitative_impact=rec_model.qualitative_impact,
            limitations=rec_model.limitations,
            evidence_reference=rec_model.evidence_reference,
            created_at=rec_model.created_at
        )
        saved_recommendations.append(rec_out)

    db.commit()

    return AssessmentResultOut(
        assessment_id=assessment_record.id,
        household_id=household.id,
        created_at=assessment_record.created_at,
        outdoor_conditions=outdoor_aqi,
        identified_sources=identified_sources,
        recommendations=saved_recommendations,
        scientific_disclaimer=SCIENTIFIC_DISCLAIMER
    )

@router.get("/latest", response_model=AssessmentResultOut)
def get_latest_assessment(
    household_id: str,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    latest = db.query(Assessment).filter(
        Assessment.household_id == household.id
    ).order_by(Assessment.created_at.desc()).first()

    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assessment has been conducted for this household yet."
        )

    sources_data = json.loads(latest.raw_sources_json)
    aqi_data = json.loads(latest.outdoor_aqi_snapshot_json)

    recs = db.query(Recommendation).filter(Recommendation.assessment_id == latest.id).all()
    recommendations_out = [RecommendationOut.model_validate(r) for r in recs]

    return AssessmentResultOut(
        assessment_id=latest.id,
        household_id=household.id,
        created_at=latest.created_at,
        outdoor_conditions=OutdoorAqiContext(**aqi_data),
        identified_sources=[IdentifiedSource(**s) for s in sources_data],
        recommendations=recommendations_out,
        scientific_disclaimer=SCIENTIFIC_DISCLAIMER
    )
