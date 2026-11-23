from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models import TrackedAction, Assessment
from backend.app.schemas import TrackerSummaryOut

SCIENTIFIC_DISCLAIMER = (
    "Scientific Transparency Note: GharKaGod has no indoor environmental sensors. "
    "Marking actions as completed tracks your household's proactive risk-mitigation habits, "
    "but does not calculate or guarantee a specific numerical reduction in indoor pollutant concentrations "
    "(such as PM2.5 or CO2). Real-world indoor levels depend on building airtightness, outdoor infiltration, "
    "and neighboring emissions."
)

def compute_tracker_summary(household_id: str, db: Session) -> TrackerSummaryOut:
    """
    Computes real persisted impact tracking statistics.
    Provides evidence-based directional explanations without fabricated numbers.
    """
    actions: List[TrackedAction] = db.query(TrackedAction).filter(
        TrackedAction.household_id == household_id
    ).all()

    total_actions = len(actions)
    completed_count = sum(1 for a in actions if a.status == "completed")
    started_count = sum(1 for a in actions if a.status == "started")
    planned_count = sum(1 for a in actions if a.status == "planned")
    skipped_count = sum(1 for a in actions if a.status == "skipped")

    completion_rate = (completed_count / total_actions * 100.0) if total_actions > 0 else 0.0

    # Retrieve latest assessment to cross-reference identified sources
    latest_assessment = db.query(Assessment).filter(
        Assessment.household_id == household_id
    ).order_by(Assessment.created_at.desc()).first()

    total_sources_identified = 0
    if latest_assessment:
        try:
            import json
            sources_data = json.loads(latest_assessment.raw_sources_json)
            total_sources_identified = len(sources_data)
        except Exception:
            total_sources_identified = 0

    # Count how many distinct sources have at least one started or completed action
    completed_action_keys = {a.action_key for a in actions if a.status in ["completed", "started"]}
    sources_addressed = min(len(completed_action_keys), total_sources_identified if total_sources_identified > 0 else len(completed_action_keys))

    # Category breakdown
    category_breakdown: Dict[str, Dict[str, int]] = {}
    for a in actions:
        if a.category not in category_breakdown:
            category_breakdown[a.category] = {"total": 0, "completed": 0, "in_progress": 0}
        category_breakdown[a.category]["total"] += 1
        if a.status == "completed":
            category_breakdown[a.category]["completed"] += 1
        elif a.status == "started":
            category_breakdown[a.category]["in_progress"] += 1

    # Formulate directional impact summary based on physical mechanisms
    if completed_count == 0:
        directional_summary = (
            "No mitigation actions have been completed yet. Starting with zero-cost practices like wet mopping "
            "and covering cooking pots will begin reducing particulate resuspension and oil aerosols in your home."
        )
    elif completed_count < 3:
        directional_summary = (
            f"You have adopted {completed_count} protective habits. By curbing localized smoke and dust resuspension, "
            "you are systematically lowering acute peak exposure events during vulnerable morning and evening hours."
        )
    else:
        directional_summary = (
            f"Substantial habit progress! You have completed {completed_count} actions addressing {sources_addressed} "
            "key indoor pollution vectors. Consistent adherence to source control and strategic ventilation provides the most "
            "resilient, affordable defense against winter smog."
        )

    return TrackerSummaryOut(
        total_actions=total_actions,
        completed_count=completed_count,
        started_count=started_count,
        planned_count=planned_count,
        skipped_count=skipped_count,
        completion_rate_percent=round(completion_rate, 1),
        sources_addressed_count=sources_addressed,
        total_sources_identified=total_sources_identified,
        category_breakdown=category_breakdown,
        directional_impact_summary=directional_summary,
        scientific_disclaimer=SCIENTIFIC_DISCLAIMER
    )
