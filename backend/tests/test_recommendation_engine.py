import pytest
from backend.app.schemas import IdentifiedSource, OutdoorAqiContext
from backend.app.services.recommendation_engine import generate_recommendations

def test_recommendation_prioritization_and_severe_aqi_boundary():
    identified = [
        IdentifiedSource(
            source_name="Unvented Flame Heating / Coal Angithi",
            severity="urgent_safety",
            household_input="Heating: open_coal_angithi",
            possible_pollutants=["Carbon Monoxide (CO)"],
            why_it_matters="Asphyxiation risk",
            evidence_reference="WHO IAQ (2010)",
            recommended_action_key="ELIMINATE_ANGITHI_ENCLOSED_HEATING",
            confidence_note="Critical"
        ),
        IdentifiedSource(
            source_name="Unvented Gas Stove Combustion",
            severity="priority_review",
            household_input="Cooking: LPG without exhaust",
            possible_pollutants=["NO2"],
            why_it_matters="Airway inflammation",
            evidence_reference="EPA (2023)",
            recommended_action_key="OUTDOOR_EXHAUST_AND_POT_LIDS",
            confidence_note="High"
        )
    ]

    # Severe outdoor air context (AQI 380)
    severe_outdoor = OutdoorAqiContext(
        city="New Delhi",
        aqi=380,
        aqi_category="Very Poor",
        pm25=210.0,
        pm10=360.0,
        source="Open-Meteo",
        timestamp="2026-11-23T12:00:00Z",
        is_live=True,
        uncertainty_note="Ambient reading",
        ventilation_advisory="Keep doors tightly closed."
    )

    recs = generate_recommendations(
        identified_sources=identified,
        outdoor_aqi=severe_outdoor,
        budget_tier="low_cost_under_500"
    )

    # 1. Urgent safety must be ranked first
    assert len(recs) >= 2
    assert recs[0].priority_tier == "urgent_safety"
    assert recs[0].action_key == "ELIMINATE_ANGITHI_ENCLOSED_HEATING"

    # 2. Window sealing action added due to outdoor AQI >= 250
    has_sealing = any(r.action_key == "WINDOW_SEALING_DRAFT_BLOCKERS" for r in recs)
    assert has_sealing

    # 3. Timed ventilation window must NOT be recommended when outdoor AQI is Very Poor/Severe
    assert not any(r.action_key == "TIMED_VENTILATION_WINDOW" for r in recs)

def test_moderate_aqi_allows_timed_ventilation():
    identified = [
        IdentifiedSource(
            source_name="Heavy Scented Cleaning",
            severity="potential_concern",
            household_input="heavy_scented_bleach_aerosols",
            possible_pollutants=["VOCs"],
            why_it_matters="Airway irritation",
            evidence_reference="EPA",
            recommended_action_key="WET_MOPPING_UNSCENTED_SOAP",
            confidence_note="Moderate"
        )
    ]

    moderate_outdoor = OutdoorAqiContext(
        city="Bengaluru",
        aqi=85,
        aqi_category="Satisfactory",
        pm25=28.0,
        pm10=55.0,
        source="Open-Meteo",
        timestamp="2026-11-23T12:00:00Z",
        is_live=True,
        uncertainty_note="Ambient reading",
        ventilation_advisory="Favorable"
    )

    recs = generate_recommendations(
        identified_sources=identified,
        outdoor_aqi=moderate_outdoor,
        budget_tier="zero_cost"
    )

    # In favorable air, timed ventilation should be suggested
    has_timed_ventilation = any(r.action_key == "TIMED_VENTILATION_WINDOW" for r in recs)
    assert has_timed_ventilation
