from typing import List, Dict, Any
from backend.app.schemas import AssessmentCreate, IdentifiedSource

def evaluate_pollution_sources(
    assessment: AssessmentCreate,
    has_elderly_or_infants: bool = False,
    has_respiratory_conditions: bool = False
) -> List[IdentifiedSource]:
    """
    Deterministic rule engine that identifies potential household pollution sources.
    Strictly evidence-based (WHO, EPA, CPCB).
    NO indoor sensors are claimed or simulated.
    """
    sources: List[IdentifiedSource] = []

    # 1. Unvented Solid Fuel or Kerosene Cooking
    if assessment.cooking_fuel in ["biomass_wood_dung", "kerosene"]:
        sources.append(IdentifiedSource(
            source_name="Unvented Solid Fuel / Biomass Combustion",
            severity="urgent_safety",
            household_input=f"Cooking fuel reported: {assessment.cooking_fuel}",
            possible_pollutants=["PM2.5", "Carbon Monoxide (CO)", "PAHs", "Black Carbon"],
            why_it_matters=(
                "Combustion of wood, dung, or kerosene inside living spaces generates hazardous levels of "
                "fine particulate matter and lethal carbon monoxide without proper chimney venting."
            ),
            evidence_reference="WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014); Lancet Commission (2022)",
            recommended_action_key="SAFE_COMBUSTION_VENTILATION",
            confidence_note="High confidence: solid fuel combustion without flue is universally classified as a primary indoor risk."
        ))

    # 2. Open Coal Angithi or Unvented LPG Chullah Heating
    if assessment.heating_appliance in ["open_coal_angithi", "unvented_lpg_chullah"]:
        sources.append(IdentifiedSource(
            source_name="Unvented Flame Heating / Coal Angithi",
            severity="urgent_safety",
            household_input=f"Heating appliance reported: {assessment.heating_appliance}",
            possible_pollutants=["Carbon Monoxide (CO)", "Nitrogen Dioxide (NO2)", "Soot", "Ultrafine Particles"],
            why_it_matters=(
                "Burning coal or unvented gas heaters in enclosed bedrooms produces deadly odorless Carbon Monoxide (CO). "
                "Sleeping with an open angithi in an unventilated room is a known acute asphyxiation hazard."
            ),
            evidence_reference="WHO IAQ Guidelines (2010); MoHFW Winter Heating Safety Advisories",
            recommended_action_key="ELIMINATE_ANGITHI_ENCLOSED_HEATING",
            confidence_note="Critical safety rule: unvented indoor coal combustion presents immediate acute poisoning danger."
        ))

    # 3. Gas / LPG Cooking with Inadequate Exhaust
    if assessment.cooking_fuel in ["lpg", "piped_natural_gas", "mixed"]:
        if assessment.exhaust_fan_type in ["none", "indoor_exhaust_only"]:
            sources.append(IdentifiedSource(
                source_name="Unvented Gas Stove Combustion & Oil Fumes",
                severity="priority_review",
                household_input=f"Cooking with {assessment.cooking_fuel} with exhaust: {assessment.exhaust_fan_type}",
                possible_pollutants=["Nitrogen Dioxide (NO2)", "Ultrafine Particles", "Acrolein"],
                why_it_matters=(
                    "LPG and piped gas release Nitrogen Dioxide (NO2) during burning. Without an exhaust fan ducted outside, "
                    "NO2 accumulates rapidly in kitchens and living quarters, irritating bronchial airways."
                ),
                evidence_reference="U.S. EPA Indoor Air Quality Cooking Standards (2023); Rocky Mountain Institute (2020)",
                recommended_action_key="OUTDOOR_EXHAUST_AND_POT_LIDS",
                confidence_note="High confidence: gas combustion generates NO2 regardless of stove brand."
            ))

    # 4. Heavy Frying / Tadka without Outdoor Ventilation
    if assessment.cooking_frequency == "daily_heavy_frying" and assessment.kitchen_ventilation in ["closed_no_window", "interior_window_only"]:
        sources.append(IdentifiedSource(
            source_name="High-Heat Cooking & Frying Aerosols",
            severity="priority_review",
            household_input="Daily heavy frying with restricted kitchen ventilation",
            possible_pollutants=["PM2.5", "Volatile Fatty Acids", "Acrolein", "Polycyclic Aromatic Hydrocarbons"],
            why_it_matters=(
                "Deep frying, tempering spices (tadka), and charring oil exceed the oil's smoke point, "
                "generating dense aerosol clouds of fine and ultrafine lipid particles."
            ),
            evidence_reference="Environmental Health Perspectives (2019): Cooking Oil Fumes and Respiratory Health",
            recommended_action_key="LID_COOKING_AND_TIMED_EXHAUST",
            confidence_note="High confidence: thermal breakdown of cooking oils produces respirable aerosols."
        ))

    # 5. Indoor Smoking
    if assessment.indoor_smoking:
        sources.append(IdentifiedSource(
            source_name="Environmental Tobacco Smoke (Secondhand Smoke)",
            severity="urgent_safety",
            household_input="Indoor smoking confirmed",
            possible_pollutants=["PM2.5", "Nicotine", "Benzene", "Formaldehyde", "Cadmium"],
            why_it_matters=(
                "Secondhand tobacco smoke settles on walls, fabrics, and dust (thirdhand smoke) and is a Class 1 carcinogen. "
                "No air purifier or ventilation system can completely eliminate tobacco risks indoors."
            ),
            evidence_reference="WHO Global Report on Tobacco Epidemic (2021); U.S. Surgeon General Report",
            recommended_action_key="SMOKE_FREE_HOME_POLICY",
            confidence_note="Absolute consensus: zero safe threshold for secondhand indoor tobacco smoke."
        ))

    # 6. Incense (Agarbatti), Dhoop, or Camphor Burning
    if assessment.incense_agarbatti_or_camphor in ["daily_multiple_times", "daily_once"]:
        sources.append(IdentifiedSource(
            source_name="Incense & Camphor Combustion",
            severity="priority_review",
            household_input=f"Incense/camphor frequency: {assessment.incense_agarbatti_or_camphor}",
            possible_pollutants=["PM2.5", "Benzene", "Toluene", "Formaldehyde", "Aldehydes"],
            why_it_matters=(
                "Smoldering incense sticks (agarbatti) and camphor produce concentrated plumes of sub-micron particulate matter "
                "and aromatic hydrocarbons directly into prayer and living spaces."
            ),
            evidence_reference="Atmospheric Environment Journal (2020): Characterization of emissions from incense burning; CPCB Study",
            recommended_action_key="REDUCE_INCENSE_BURN_TIME",
            confidence_note="High confidence: continuous smoldering organic material releases respirable particles."
        ))

    # 7. Mosquito Coil Burning
    if assessment.mosquito_coils_usage in ["every_night", "frequent"]:
        sources.append(IdentifiedSource(
            source_name="Mosquito Coil Pyrolysis Smog",
            severity="priority_review",
            household_input=f"Mosquito coil frequency: {assessment.mosquito_coils_usage}",
            possible_pollutants=["PM2.5", "Octachlorodipropyl ether (S-2)", "Bis-chloromethyl ether", "Formaldehyde"],
            why_it_matters=(
                "Burning one mosquito coil overnight in a closed bedroom releases fine particulate matter equivalent to "
                "smoking 75 to 100 cigarettes, severely inflaming respiratory passages."
            ),
            evidence_reference="Environmental Health Perspectives (2003): Mosquito Coil Smoke and Health; WHO Vector Control Guidelines",
            recommended_action_key="SWITCH_TO_BED_NETS_OR_VAPORIZERS",
            confidence_note="High confidence: coil binders and pyrethroids emit substantial smoke volume."
        ))

    # 8. Visible Dampness or Fungal Mold
    if assessment.visible_dampness_mold:
        sources.append(IdentifiedSource(
            source_name="Indoor Dampness & Fungal Bioaerosols",
            severity="priority_review" if (has_respiratory_conditions or has_elderly_or_infants) else "potential_concern",
            household_input="Visible dampness or mold patches reported",
            possible_pollutants=["Mold Spores", "Mycotoxins", "Endotoxins", "Dust Mites"],
            why_it_matters=(
                "Moisture accumulation on walls or seepage enables mold proliferation. Spores trigger asthma flare-ups, "
                "chronic nocturnal coughing, and allergic rhinitis, especially in children and seniors."
            ),
            evidence_reference="WHO Guidelines for Indoor Air Quality: Dampness and Mould (2009)",
            recommended_action_key="MOISTURE_CONTROL_AND_VINEGAR_CLEAN",
            confidence_note="High confidence: visual dampness correlates directly with elevated fungal spore counts."
        ))

    # 9. Harsh Scented Cleaning Aerosols & Bleach Habit
    if assessment.cleaning_products_habit == "heavy_scented_bleach_aerosols":
        sources.append(IdentifiedSource(
            source_name="Scented Aerosols & Volatile Cleaning Agents",
            severity="potential_concern",
            household_input="Heavy scented cleaning products and bleach sprays used",
            possible_pollutants=["Volatile Organic Compounds (VOCs)", "Terpenes", "Chloramines", "Aerosol Propellants"],
            why_it_matters=(
                "Fragrances and chemical cleaning aerosols react with ambient indoor ozone to create secondary organic aerosols (SOAs) "
                "and throat-irritating chloramines."
            ),
            evidence_reference="EPA Indoor Air Quality Guide on VOCs (2022); American Journal of Respiratory and Critical Care Medicine",
            recommended_action_key="WET_MOPPING_UNSCENTED_SOAP",
            confidence_note="Moderate confidence: product composition varies, but aerosol sprays universally increase VOCs."
        ))

    return sources
