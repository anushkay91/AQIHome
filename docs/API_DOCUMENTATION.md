# GharKaGod API Documentation

**API Version:** `1.0.0`  
**Base URL:** `/api/v1`  
**Authentication Scheme:** `Bearer <JWT_TOKEN>` in `Authorization` header.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new household user account.
- **Request Body:**
  ```json
  {
    "email": "family@example.com",
    "password": "strongPassword123!",
    "full_name": "Sharma Household"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "uuid-v4",
      "email": "family@example.com",
      "full_name": "Sharma Household",
      "created_at": "2026-11-23T12:00:00Z"
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates existing user and generates access token.
- **Request Body:**
  ```json
  {
    "email": "family@example.com",
    "password": "strongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### `GET /api/v1/auth/me`
Retrieves current authenticated profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User object.

### `DELETE /api/v1/auth/me/data`
**GDPR & DPDP Right to Erasure:** Permanently purges user account, households, assessments, and tracking history.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  { "message": "All user and household data have been permanently purged." }
  ```

---

## 2. Household Profile Endpoints

### `GET /api/v1/households`
Lists households owned by the authenticated user.

### `POST /api/v1/households`
Creates a new household profile.
- **Request Body:**
  ```json
  {
    "name": "Sharma Apartment",
    "city": "New Delhi",
    "dwelling_type": "apartment",
    "approx_rooms": 3,
    "has_elderly_or_infants": true,
    "has_respiratory_conditions": false,
    "budget_tier": "low_cost_under_500"
  }
  ```

### `GET /api/v1/households/{household_id}`
Retrieves household. Enforces server-side ownership (403 if ID belongs to another tenant).

### `PUT /api/v1/households/{household_id}`
Updates household profile attributes.

---

## 3. Pollution Detective (Module A)

### `GET /api/v1/environmental/outdoor-aqi`
Fetches verified ambient air quality.
- **Query Parameters:** `city` (string), `latitude` (float, optional), `longitude` (float, optional).
- **Response (200 OK):**
  ```json
  {
    "city": "New Delhi (NCR)",
    "aqi": 342,
    "aqi_category": "Very Poor",
    "pm25": 182.4,
    "pm10": 340.1,
    "no2": 42.0,
    "source": "Open-Meteo Atmosphere Monitoring / CPCB NAQI Breakpoints",
    "timestamp": "2026-11-23T11:00:00Z",
    "is_live": true,
    "uncertainty_note": "Live ambient measurement at regional monitoring station. Note: Outdoor ambient air is NOT equal to indoor air quality.",
    "ventilation_advisory": "CRITICAL: Outdoor air is Very Poor to Severe. Keep doors and windows tightly closed. Do NOT open windows for cross-ventilation during smog hours."
  }
  ```

### `POST /api/v1/households/{household_id}/assessments`
Submits 10-point household questionnaire. Triggers deterministic rule engine, fetches outdoor AQI, and generates candidate recommendations.
- **Request Body:**
  ```json
  {
    "cooking_fuel": "lpg",
    "cooking_frequency": "daily_heavy_frying",
    "kitchen_ventilation": "interior_window_only",
    "exhaust_fan_type": "indoor_exhaust_only",
    "indoor_smoking": false,
    "incense_agarbatti_or_camphor": "daily_multiple_times",
    "mosquito_coils_usage": "every_night",
    "heating_appliance": "open_coal_angithi",
    "visible_dampness_mold": true,
    "cleaning_products_habit": "heavy_scented_bleach_aerosols"
  }
  ```
- **Response (201 Created):** `AssessmentResultOut` containing `identified_sources`, `outdoor_conditions`, `recommendations`, and `scientific_disclaimer`.

### `GET /api/v1/households/{household_id}/assessments/latest`
Returns latest completed assessment for the household.

---

## 4. Affordable Recommendations (Module B)

### `GET /api/v1/households/{household_id}/recommendations`
Query params: `category`, `cost_category`. Returns list of prioritized recommendations.

### `POST /api/v1/households/{household_id}/recommendations/{rec_id}/explain`
Calls Gemini GenAI (with deterministic fallback) to generate plain-language explanation and answer follow-up questions.
- **Request Body:**
  ```json
  {
    "question": "How do I make a Corsi-Rosenthal box if I don't have duct tape?",
    "language_preference": "en"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "action_key": "CORSI_ROSENTHAL_BOX",
    "title": "Build a Low-Cost Corsi-Rosenthal Box Air Purifier",
    "answer": "...",
    "scientific_rationale": "...",
    "practical_tip": "...",
    "safety_boundary": "This is a particle filter; it does NOT remove Carbon Monoxide or toxic cooking gases.",
    "source_reference": "UC Davis Air Quality Research Center / EPA DIY Air Cleaner Assessments (2021-2023)",
    "is_ai_generated": true
  }
  ```

---

## 5. Impact Tracker (Module C)

### `GET /api/v1/households/{household_id}/tracker/summary`
Returns completion rate, actions count, sources addressed, and qualitative directional impact summary.

### `GET /api/v1/households/{household_id}/tracker/actions`
Returns list of tracked actions.

### `PATCH /api/v1/households/{household_id}/tracker/actions/{action_id}`
Updates action status (`planned`, `started`, `completed`, `skipped`) and notes. Sets or clears `completed_at` timestamp.

---

## 6. Guest Demonstration Mode

### `POST /api/v1/guest/demo-session`
Bootstraps an ephemeral demo session pre-seeded with realistic household profile, live ambient AQI, evaluated assessment, and tracked habits. Returns access token immediately without signup.
