import pytest
from backend.app.schemas import AssessmentCreate
from backend.app.services.rule_engine import evaluate_pollution_sources

def test_rule_engine_identifies_biomass_fuel_hazard():
    assessment = AssessmentCreate(
        cooking_fuel="biomass_wood_dung",
        cooking_frequency="daily_heavy_frying",
        kitchen_ventilation="closed_no_window",
        exhaust_fan_type="none",
        indoor_smoking=False,
        incense_agarbatti_or_camphor="never",
        mosquito_coils_usage="never",
        heating_appliance="none",
        visible_dampness_mold=False,
        cleaning_products_habit="mild_unscented_soap_water"
    )
    sources = evaluate_pollution_sources(assessment)
    assert any(s.severity == "urgent_safety" and "Biomass" in s.source_name for s in sources)
    biomass_source = next(s for s in sources if "Biomass" in s.source_name)
    assert "Carbon Monoxide (CO)" in biomass_source.possible_pollutants
    assert "WHO" in biomass_source.evidence_reference

def test_rule_engine_identifies_coal_angithi_deadly_hazard():
    assessment = AssessmentCreate(
        cooking_fuel="lpg",
        cooking_frequency="daily_light_moderate",
        kitchen_ventilation="dedicated_window_outdoors",
        exhaust_fan_type="ducted_outdoors",
        indoor_smoking=False,
        incense_agarbatti_or_camphor="never",
        mosquito_coils_usage="never",
        heating_appliance="open_coal_angithi",
        visible_dampness_mold=False,
        cleaning_products_habit="mild_unscented_soap_water"
    )
    sources = evaluate_pollution_sources(assessment)
    angithi_source = next((s for s in sources if "Angithi" in s.source_name), None)
    assert angithi_source is not None
    assert angithi_source.severity == "urgent_safety"
    assert "Carbon Monoxide" in angithi_source.why_it_matters

def test_rule_engine_identifies_secondhand_smoke():
    assessment = AssessmentCreate(
        cooking_fuel="electric_induction",
        cooking_frequency="occasional",
        kitchen_ventilation="dedicated_window_outdoors",
        exhaust_fan_type="ducted_outdoors",
        indoor_smoking=True,
        incense_agarbatti_or_camphor="never",
        mosquito_coils_usage="never",
        heating_appliance="none",
        visible_dampness_mold=False,
        cleaning_products_habit="mild_unscented_soap_water"
    )
    sources = evaluate_pollution_sources(assessment)
    smoke_source = next((s for s in sources if "Tobacco" in s.source_name), None)
    assert smoke_source is not None
    assert smoke_source.severity == "urgent_safety"

def test_rule_engine_identifies_mosquito_coils_and_incense():
    assessment = AssessmentCreate(
        cooking_fuel="electric_induction",
        cooking_frequency="occasional",
        kitchen_ventilation="dedicated_window_outdoors",
        exhaust_fan_type="ducted_outdoors",
        indoor_smoking=False,
        incense_agarbatti_or_camphor="daily_multiple_times",
        mosquito_coils_usage="every_night",
        heating_appliance="none",
        visible_dampness_mold=False,
        cleaning_products_habit="mild_unscented_soap_water"
    )
    sources = evaluate_pollution_sources(assessment)
    source_names = [s.source_name for s in sources]
    assert any("Incense" in name for name in source_names)
    assert any("Mosquito Coil" in name for name in source_names)

def test_rule_engine_never_fabricates_numerical_sensor_data():
    assessment = AssessmentCreate(
        cooking_fuel="lpg",
        cooking_frequency="daily_heavy_frying",
        kitchen_ventilation="interior_window_only",
        exhaust_fan_type="none",
        indoor_smoking=False,
        incense_agarbatti_or_camphor="daily_once",
        mosquito_coils_usage="frequent",
        heating_appliance="electric_convector_blower",
        visible_dampness_mold=True,
        cleaning_products_habit="heavy_scented_bleach_aerosols"
    )
    sources = evaluate_pollution_sources(assessment)
    for source in sources:
        # None of the descriptions should claim to measure an exact indoor microgram reading
        assert "indoor AQI is" not in source.why_it_matters.lower()
        assert "measured at" not in source.why_it_matters.lower()
