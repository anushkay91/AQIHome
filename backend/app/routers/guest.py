import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Household, Assessment, Recommendation, TrackedAction
from backend.app.schemas import TokenOut, UserOut, AssessmentResultOut, OutdoorAqiContext, IdentifiedSource, RecommendationOut
from backend.app.security import create_access_token, get_password_hash
from backend.app.services.rule_engine import evaluate_pollution_sources
from backend.app.services.environmental_service import fetch_outdoor_aqi
from backend.app.services.recommendation_engine import generate_recommendations
from backend.app.services.impact_service import SCIENTIFIC_DISCLAIMER

router = APIRouter(prefix="/guest", tags=["Guest Demonstration Mode"])

@router.post("/demo-session", status_code=status.HTTP_200_OK)
async def initialize_demo_session(db: Session = Depends(get_db)):
    """
    Bootstraps an immediate guest demonstration session.
    Creates an isolated demo user and realistic pre-loaded household ('Demo Family Residence, New Delhi')
    with live outdoor AQI, completed assessment, prioritized recommendations, and sample tracked habits.
    No credentials or API keys required by the user!
    """
    # Deterministic demo user
    demo_email = f"guest_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}@gharkagod.demo"
    demo_user = User(
        email=demo_email,
        hashed_password=get_password_hash("guestDemoSecure2026!"),
        full_name="Guest Family (Demonstration)"
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # Demo household
    household = Household(
        user_id=demo_user.id,
        name="Sharma Family Residence",
        city="New Delhi",
        state_region="Delhi NCR",
        dwelling_type="apartment",
        approx_rooms=3,
        has_elderly_or_infants=True,
        has_respiratory_conditions=True,
        budget_tier="low_cost_under_500"
    )
    db.add(household)
    db.commit()
    db.refresh(household)

    # Initial realistic assessment
    from backend.app.schemas import AssessmentCreate
    sample_assessment = AssessmentCreate(
        cooking_fuel="lpg",
        cooking_frequency="daily_heavy_frying",
        kitchen_ventilation="interior_window_only",
        exhaust_fan_type="indoor_exhaust_only",
        indoor_smoking=False,
        incense_agarbatti_or_camphor="daily_multiple_times",
        mosquito_coils_usage="frequent",
        heating_appliance="electric_convector_blower",
        visible_dampness_mold=True,
        cleaning_products_habit="heavy_scented_bleach_aerosols"
    )

    sources = evaluate_pollution_sources(
        assessment=sample_assessment,
        has_elderly_or_infants=True,
        has_respiratory_conditions=True
    )
    outdoor_aqi = await fetch_outdoor_aqi(city=household.city)
    recs = generate_recommendations(
        identified_sources=sources,
        outdoor_aqi=outdoor_aqi,
        budget_tier=household.budget_tier,
        has_respiratory_conditions=True,
        has_elderly_or_infants=True
    )

    assessment_record = Assessment(
        household_id=household.id,
        cooking_fuel=sample_assessment.cooking_fuel,
        cooking_frequency=sample_assessment.cooking_frequency,
        kitchen_ventilation=sample_assessment.kitchen_ventilation,
        exhaust_fan_type=sample_assessment.exhaust_fan_type,
        indoor_smoking=sample_assessment.indoor_smoking,
        incense_agarbatti_or_camphor=sample_assessment.incense_agarbatti_or_camphor,
        mosquito_coils_usage=sample_assessment.mosquito_coils_usage,
        heating_appliance=sample_assessment.heating_appliance,
        visible_dampness_mold=sample_assessment.visible_dampness_mold,
        cleaning_products_habit=sample_assessment.cleaning_products_habit,
        raw_sources_json=json.dumps([s.model_dump() for s in sources]),
        outdoor_aqi_snapshot_json=json.dumps(outdoor_aqi.model_dump())
    )
    db.add(assessment_record)
    db.commit()
    db.refresh(assessment_record)

    # Seed recommendations and sample progress (1 completed, 1 started, rest planned)
    for idx, rec in enumerate(recs):
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

        status_val = "completed" if idx == 0 else ("started" if idx == 1 else "planned")
        tracked = TrackedAction(
            household_id=household.id,
            recommendation_id=rec_model.id,
            action_key=rec.action_key,
            title=rec.title,
            category=rec.category,
            status=status_val,
            completed_at=datetime.now(timezone.utc) if status_val == "completed" else None,
            notes="Adopted as morning routine." if status_val == "completed" else None
        )
        db.add(tracked)

    db.commit()

    token = create_access_token({"sub": demo_user.id, "email": demo_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(demo_user),
        "household": {
            "id": household.id,
            "name": household.name,
            "city": household.city,
            "dwelling_type": household.dwelling_type,
            "has_elderly_or_infants": household.has_elderly_or_infants,
            "has_respiratory_conditions": household.has_respiratory_conditions,
            "budget_tier": household.budget_tier
        },
        "is_guest_demo": True
    }
