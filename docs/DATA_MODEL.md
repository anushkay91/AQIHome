# Data Model Specification: GharKaGod

## 1. Relational Entities (SQLite / PostgreSQL)

### `users`
- `id` (VARCHAR(36), PK): UUID4.
- `email` (VARCHAR(255), UNIQUE, indexed): User login email.
- `hashed_password` (VARCHAR(255)): Bcrypt password hash.
- `full_name` (VARCHAR(255)): Optional display name (or pseudonym).
- `is_active` (BOOLEAN, default TRUE).
- `created_at` (DATETIME, UTC).
- `updated_at` (DATETIME, UTC).

### `households`
- `id` (VARCHAR(36), PK): UUID4.
- `user_id` (VARCHAR(36), FK -> `users.id`, indexed): Household owner.
- `name` (VARCHAR(100)): Household identifier (e.g. "Sharma Family Apartment").
- `city` (VARCHAR(100)): Approximate location (e.g., "New Delhi", "Patna", "Gurugram", "Lucknow").
- `state_region` (VARCHAR(100), optional).
- `dwelling_type` (VARCHAR(50)): `apartment`, `independent_house`, `slum_cluster_or_informal`, `chawl_or_tenement`, `other`.
- `approx_rooms` (INTEGER): Number of rooms.
- `has_elderly_or_infants` (BOOLEAN, default FALSE): Household vulnerability context.
- `has_respiratory_conditions` (BOOLEAN, default FALSE): Asthma, COPD, or allergy consideration.
- `budget_tier` (VARCHAR(20)): `zero_cost`, `low_cost_under_500`, `moderate_under_3000`, `flexible`.
- `created_at` (DATETIME, UTC).
- `updated_at` (DATETIME, UTC).

### `assessments` (Pollution Detective Submissions)
- `id` (VARCHAR(36), PK): UUID4.
- `household_id` (VARCHAR(36), FK -> `households.id`, indexed).
- `cooking_fuel` (VARCHAR(50)): `lpg`, `biomass_wood_dung`, `kerosene`, `piped_natural_gas`, `electric_induction`, `mixed`.
- `cooking_frequency` (VARCHAR(50)): `daily_heavy_frying`, `daily_light_moderate`, `occasional`.
- `kitchen_ventilation` (VARCHAR(50)): `dedicated_window_outdoors`, `interior_window_only`, `closed_no_window`, `open_plan_living`.
- `exhaust_fan_type` (VARCHAR(50)): `ducted_outdoors`, `recirculating_filter`, `indoor_exhaust_only`, `none`.
- `indoor_smoking` (BOOLEAN, default FALSE).
- `incense_agarbatti_or_camphor` (VARCHAR(50)): `daily_multiple_times`, `daily_once`, `weekly_or_festival`, `never`.
- `mosquito_coils_usage` (VARCHAR(50)): `every_night`, `frequent`, `occasional`, `never`.
- `heating_appliance` (VARCHAR(50)): `none`, `electric_oil_radiator`, `electric_convector_blower`, `unvented_lpg_chullah`, `open_coal_angithi`.
- `visible_dampness_mold` (BOOLEAN, default FALSE).
- `cleaning_products_habit` (VARCHAR(50)): `heavy_scented_bleach_aerosols`, `mild_unscented_soap_water`, `mixed`.
- `raw_sources_json` (TEXT / JSON): Deterministic rule outputs (sources identified, severity, mechanisms).
- `outdoor_aqi_snapshot_json` (TEXT / JSON): Verified outdoor conditions at time of assessment (PM2.5, PM10, AQI, source, timestamp).
- `created_at` (DATETIME, UTC).

### `recommendations`
- `id` (VARCHAR(36), PK): UUID4.
- `assessment_id` (VARCHAR(36), FK -> `assessments.id`, indexed).
- `action_key` (VARCHAR(100)): Deterministic code (e.g., `POT_LID_COOKING`, `OUTDOOR_EXHAUST_DUCT`, `CORSI_ROSENTHAL_BOX`, `WET_MOPPING_ROUTINE`).
- `title` (VARCHAR(200)): Short imperative action name.
- `category` (VARCHAR(50)): `cooking_smoke`, `combustion_heating`, `dust_and_cleaning`, `ventilation_timing`, `air_cleaning`.
- `priority_tier` (VARCHAR(20)): `urgent_safety`, `high_impact`, `routine_improvement`.
- `cost_category` (VARCHAR(30)): `free_no_cost`, `under_500_inr`, `under_3000_inr`.
- `estimated_cost_inr` (INTEGER): Illustrative cost in INR.
- `household_trigger` (VARCHAR(255)): Reason based on questionnaire input.
- `qualitative_impact` (TEXT): Physical mechanism explaining reduction.
- `limitations` (TEXT): Situational boundaries (e.g. "Do not open windows if outdoor AQI is Severe").
- `evidence_reference` (VARCHAR(255)): Authoritative citation ([EPA-COOKING], [WHO-2021], etc.).
- `ai_explanation` (TEXT): Plain-language, vernacular-friendly contextual summary from Gemini (or fallback).
- `created_at` (DATETIME, UTC).

### `tracked_actions` (Impact Tracker)
- `id` (VARCHAR(36), PK): UUID4.
- `household_id` (VARCHAR(36), FK -> `households.id`, indexed).
- `recommendation_id` (VARCHAR(36), FK -> `recommendations.id`, nullable, indexed).
- `action_key` (VARCHAR(100)): Deterministic identifier.
- `title` (VARCHAR(200)): Action title.
- `category` (VARCHAR(50)).
- `status` (VARCHAR(30)): `planned`, `started`, `completed`, `skipped`.
- `completed_at` (DATETIME, UTC, nullable).
- `notes` (TEXT, nullable).
- `habit_frequency` (VARCHAR(50), nullable): e.g. `daily_routine`, `one_time_fix`, `weekly`.
- `created_at` (DATETIME, UTC).
- `updated_at` (DATETIME, UTC).
