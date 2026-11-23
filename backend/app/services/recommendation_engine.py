from typing import List, Dict, Any, Optional
from backend.app.schemas import IdentifiedSource, RecommendationOut, OutdoorAqiContext

# Action Master Catalog with authoritative citations and physics-informed impacts
ACTION_CATALOG: Dict[str, Dict[str, Any]] = {
    "ELIMINATE_ANGITHI_ENCLOSED_HEATING": {
        "title": "Never Sleep with Unvented Coal or Angithi Indoors",
        "category": "combustion_heating",
        "priority_tier": "urgent_safety",
        "cost_category": "free_no_cost",
        "estimated_cost_inr": 0,
        "qualitative_impact": (
            "Completely eliminates the immediate risk of acute Carbon Monoxide (CO) poisoning and asphyxiation. "
            "CO binds with hemoglobin 200x faster than oxygen, causing irreversible hypoxia in closed rooms."
        ),
        "limitations": (
            "Requires alternative thermal comfort strategies, such as layered woolen blankets, hot water bottles, "
            "or a sealed oil-filled radiator if electricity is available."
        ),
        "evidence_reference": "WHO Indoor Air Quality Guidelines: Household Fuel Combustion (2014); MoHFW Public Health Advisory",
        "base_action_key": "ELIMINATE_ANGITHI_ENCLOSED_HEATING"
    },
    "SMOKE_FREE_HOME_POLICY": {
        "title": "Establish an Absolute Smoke-Free Indoor Rule",
        "category": "combustion_heating",
        "priority_tier": "urgent_safety",
        "cost_category": "free_no_cost",
        "estimated_cost_inr": 0,
        "qualitative_impact": (
            "Dramatically reduces fine particulate matter (PM2.5) spikes and eliminates dangerous thirdhand smoke "
            "deposition onto curtains, carpets, and mattresses."
        ),
        "limitations": "Requires strict family cooperation; smoking must take place entirely outdoors away from open windows.",
        "evidence_reference": "U.S. Surgeon General Report (2006); WHO Framework Convention on Tobacco Control",
        "base_action_key": "SMOKE_FREE_HOME_POLICY"
    },
    "POT_LID_AND_BACK_BURNER": {
        "title": "Cook with Fitted Lids and Use Back Stove Burners",
        "category": "cooking_smoke",
        "priority_tier": "high_impact",
        "cost_category": "free_no_cost",
        "estimated_cost_inr": 0,
        "qualitative_impact": (
            "Covers trap moisture and vaporized cooking grease before they disperse into the kitchen air. "
            "Cooking on back burners allows wall surfaces or exhaust hoods to capture up to 70% more combustion fumes."
        ),
        "limitations": "Only addresses cooking emissions generated at that moment; does not clean pre-existing ambient air.",
        "evidence_reference": "U.S. EPA Indoor Air Quality Cooking Standards (2023); Lawrence Berkeley National Laboratory (2019)",
        "base_action_key": "POT_LID_COOKING"
    },
    "DUCTED_OUTDOOR_EXHAUST_FIX": {
        "title": "Install or Vent Kitchen Exhaust Directly Outdoors",
        "category": "cooking_smoke",
        "priority_tier": "high_impact",
        "cost_category": "under_3000_inr",
        "estimated_cost_inr": 1200,
        "qualitative_impact": (
            "Physically expels Nitrogen Dioxide (NO2), carbon particles, and oil vapors outside rather than "
            "recirculating them through living rooms and bedrooms."
        ),
        "limitations": (
            "Requires an exterior-facing wall aperture or glass cutout. If outdoor air is Severe, run exhaust fan "
            "strictly while the gas stove is active and shut it immediately afterwards to prevent outdoor smog backdraft."
        ),
        "evidence_reference": "ASHRAE Standard 62.2 (Ventilation for Acceptable Indoor Air Quality in Residential Buildings)",
        "base_action_key": "OUTDOOR_EXHAUST_DUCT"
    },
    "REDUCE_INCENSE_BURN_TIME": {
        "title": "Shorten Incense Burn Time or Switch to Flameless Aromatics",
        "category": "combustion_heating",
        "priority_tier": "high_impact",
        "cost_category": "free_no_cost",
        "estimated_cost_inr": 0,
        "qualitative_impact": (
            "Eliminates continuous sub-micron particulate emissions. Burning a stick for 5 minutes instead of 45 minutes "
            "reduces indoor respirable soot generation by over 80%."
        ),
        "limitations": "Requires adapting religious or spiritual rituals; keep prayer altar near a dedicated exhaust window.",
        "evidence_reference": "Atmospheric Environment (2020) Emission Rates of Agarbatti Combustion; CPCB Air Quality Studies",
        "base_action_key": "REDUCE_INCENSE_BURN_TIME"
    },
    "SWITCH_TO_BED_NETS_OR_VAPORIZERS": {
        "title": "Replace Smoldering Mosquito Coils with Mesh Nets or Liquid Repellents",
        "category": "combustion_heating",
        "priority_tier": "high_impact",
        "cost_category": "under_500_inr",
        "estimated_cost_inr": 350,
        "qualitative_impact": (
            "Stops the overnight inhalation of dense synthetic pyrethroid smoke and particulate mass comparable to "
            "dozens of cigarettes in unventilated sleeping rooms."
        ),
        "limitations": "Bed nets require proper tucking and physical maintenance; window mesh screens require fitting.",
        "evidence_reference": "Environmental Health Perspectives (2003): Mosquito Coil Combustion Byproducts; WHO Vector Control",
        "base_action_key": "SWITCH_TO_BED_NETS_OR_VAPORIZERS"
    },
    "MOISTURE_CONTROL_AND_VINEGAR_CLEAN": {
        "title": "Treat Visible Mold with Diluted White Vinegar and Ventilate Wet Zones",
        "category": "dust_and_cleaning",
        "priority_tier": "high_impact",
        "cost_category": "under_500_inr",
        "estimated_cost_inr": 150,
        "qualitative_impact": (
            "Mild acetic acid penetrates porous surfaces and kills fungal hyphae without releasing toxic hypochlorite gases "
            "associated with chlorine bleach."
        ),
        "limitations": "Severe structural water seepage requires masonry repair and plumbing leak rectification.",
        "evidence_reference": "WHO Guidelines for Indoor Air Quality: Dampness and Mould (2009); EPA Mold Remediation Guide",
        "base_action_key": "MOISTURE_CONTROL_AND_VINEGAR_CLEAN"
    },
    "WET_MOPPING_UNSCENTED_SOAP": {
        "title": "Wet Mop Floors Daily with Water or Mild Dish Soap (Avoid Dry Sweeping)",
        "category": "dust_and_cleaning",
        "priority_tier": "routine_improvement",
        "cost_category": "free_no_cost",
        "estimated_cost_inr": 0,
        "qualitative_impact": (
            "Wet mopping physically binds settled coarse and fine dust particles (PM10 and PM2.5), preventing them "
            "from resuspending into the breathing zone compared to traditional dry broom sweeping (jhadu)."
        ),
        "limitations": "Mop heads must be rinsed frequently in clean water to prevent spreading dissolved dirt across floors.",
        "evidence_reference": "Journal of Aerosol Science (2018): Resuspension of Indoor Dust by Human Activities and Cleaning",
        "base_action_key": "WET_MOPPING_ROUTINE"
    },
    "CORSI_ROSENTHAL_BOX_DIY": {
        "title": "Build a Low-Cost Corsi-Rosenthal Box Air Purifier",
        "category": "air_cleaning",
        "priority_tier": "high_impact",
        "cost_category": "under_3000_inr",
        "estimated_cost_inr": 2400,
        "qualitative_impact": (
            "Assembling 4 MERV-13 filters around a standard 20-inch box fan delivers 400-600 CFM of clean air delivery rate (CADR), "
            "drastically filtering fine particulate smog at a fraction of commercial purifier prices."
        ),
        "limitations": "Requires sourcing MERV-13 pleated filter panels and duct tape; filters must be replaced every 4-6 months.",
        "evidence_reference": "UC Davis / EPA Studies on DIY Air Cleaners (2021-2023); Journal of Occupational & Environmental Hygiene",
        "base_action_key": "CORSI_ROSENTHAL_BOX"
    },
    "TIMED_VENTILATION_WINDOW": {
        "title": "Strategic Window Timing During Afternoon Dispersal",
        "category": "ventilation_timing",
        "priority_tier": "routine_improvement",
        "cost_category": "free_no_cost",
        "estimated_cost_inr": 0,
        "qualitative_impact": (
            "Opening windows strictly during peak solar heating (1:00 PM - 3:30 PM) takes advantage of atmospheric boundary layer "
            "expansion, flushing indoor stale CO2 when ambient smog is lowest."
        ),
        "limitations": (
            "NEVER open windows during early morning (6:00 AM - 10:00 AM) or late evening winter smog peaks when thermal inversion "
            "traps ground-level pollution."
        ),
        "evidence_reference": "Central Pollution Control Board (CPCB) Diurnal Winter Smog Dynamics; IMD Meteorological Advisories",
        "base_action_key": "TIMED_VENTILATION_WINDOW"
    },
    "WINDOW_SEALING_AND_DRAFT_BLOCKERS": {
        "title": "Seal Door Cracks and Window Gaps with Rolled Towels or Foam Strips",
        "category": "ventilation_timing",
        "priority_tier": "routine_improvement",
        "cost_category": "under_500_inr",
        "estimated_cost_inr": 180,
        "qualitative_impact": (
            "Reduces uncontrolled outdoor smog infiltration (air leakage) through exterior door thresholds and window frames "
            "during hazardous winter smog episodes."
        ),
        "limitations": "Must be balanced with brief afternoon ventilation to prevent excessive metabolic CO2 accumulation indoors.",
        "evidence_reference": "Lawrence Berkeley National Lab: Infiltration and Building Envelopes in Urban Smog Basins",
        "base_action_key": "WINDOW_SEALING_DRAFT_BLOCKERS"
    }
}

def generate_recommendations(
    identified_sources: List[IdentifiedSource],
    outdoor_aqi: OutdoorAqiContext,
    budget_tier: str = "low_cost_under_500",
    has_respiratory_conditions: bool = False,
    has_elderly_or_infants: bool = False
) -> List[RecommendationOut]:
    """
    Ranks and selects recommendations based on:
    1. Safety & source triggers
    2. Qualitative physical impact
    3. Budget compatibility
    4. Outdoor air constraints
    5. Evidence quality
    """
    selected_actions: List[RecommendationOut] = []
    added_keys = set()

    def add_action(catalog_key: str, trigger_reason: str):
        if catalog_key in ACTION_CATALOG and catalog_key not in added_keys:
            spec = ACTION_CATALOG[catalog_key]
            
            # Contextualize limitations if outdoor AQI is Severe
            custom_limitations = spec["limitations"]
            if outdoor_aqi.aqi >= 300 and "window" in catalog_key.lower():
                custom_limitations += f" Outdoor AQI is currently {outdoor_aqi.aqi} ({outdoor_aqi.aqi_category}) - exercise maximum caution before unsealing windows."

            selected_actions.append(RecommendationOut(
                action_key=spec["base_action_key"],
                title=spec["title"],
                category=spec["category"],
                priority_tier=spec["priority_tier"],
                cost_category=spec["cost_category"],
                estimated_cost_inr=spec["estimated_cost_inr"],
                household_trigger=trigger_reason,
                qualitative_impact=spec["qualitative_impact"],
                limitations=custom_limitations,
                evidence_reference=spec["evidence_reference"],
                ai_explanation=None
            ))
            added_keys.add(catalog_key)

    # Trigger actions based on identified sources
    for source in identified_sources:
        if source.recommended_action_key == "ELIMINATE_ANGITHI_ENCLOSED_HEATING":
            add_action("ELIMINATE_ANGITHI_ENCLOSED_HEATING", source.household_input)
        elif source.recommended_action_key == "SMOKE_FREE_HOME_POLICY":
            add_action("SMOKE_FREE_HOME_POLICY", source.household_input)
        elif source.recommended_action_key in ["OUTDOOR_EXHAUST_AND_POT_LIDS", "LID_COOKING_AND_TIMED_EXHAUST"]:
            add_action("POT_LID_AND_BACK_BURNER", source.household_input)
            if budget_tier in ["moderate_under_3000", "flexible"]:
                add_action("DUCTED_OUTDOOR_EXHAUST_FIX", source.household_input)
        elif source.recommended_action_key == "REDUCE_INCENSE_BURN_TIME":
            add_action("REDUCE_INCENSE_BURN_TIME", source.household_input)
        elif source.recommended_action_key == "SWITCH_TO_BED_NETS_OR_VAPORIZERS":
            add_action("SWITCH_TO_BED_NETS_OR_VAPORIZERS", source.household_input)
        elif source.recommended_action_key == "MOISTURE_CONTROL_AND_VINEGAR_CLEAN":
            add_action("MOISTURE_CONTROL_AND_VINEGAR_CLEAN", source.household_input)
        elif source.recommended_action_key == "WET_MOPPING_UNSCENTED_SOAP":
            add_action("WET_MOPPING_UNSCENTED_SOAP", source.household_input)

    # Universal low-cost baseline actions
    add_action("WET_MOPPING_UNSCENTED_SOAP", "Standard low-cost dust mitigation habit for all urban households")
    
    # Outdoor smog specific actions
    if outdoor_aqi.aqi >= 250:
        add_action("WINDOW_SEALING_AND_DRAFT_BLOCKERS", f"Current outdoor ambient air is {outdoor_aqi.aqi_category} (AQI {outdoor_aqi.aqi})")
        if budget_tier in ["moderate_under_3000", "flexible"]:
            add_action("CORSI_ROSENTHAL_BOX_DIY", "High outdoor smog infiltration in poorly sealed rooms")
    elif outdoor_aqi.aqi < 200:
        add_action("TIMED_VENTILATION_WINDOW", f"Outdoor AQI is {outdoor_aqi.aqi_category} - safe for scheduled afternoon flushing")

    # Sort priorities: urgent_safety > high_impact > routine_improvement
    priority_order = {"urgent_safety": 0, "high_impact": 1, "routine_improvement": 2}
    selected_actions.sort(key=lambda x: priority_order.get(x.priority_tier, 3))

    return selected_actions
