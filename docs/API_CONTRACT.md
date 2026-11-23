# API Contract Specification: GharKaGod

Base URL: `/api/v1`

## 1. Authentication & User Profile
- `POST /auth/register`
  - Body: `{ email, password, full_name? }`
  - Response: `{ access_token, token_type, user: { id, email, full_name } }`
- `POST /auth/login`
  - Body: `{ username (email), password }` (OAuth2 compatible form or JSON)
  - Response: `{ access_token, token_type, user: { id, email, full_name } }`
- `GET /auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ id, email, full_name, created_at }`
- `DELETE /auth/me/data`
  - Headers: `Authorization: Bearer <token>`
  - Purpose: Permanent user-controlled data deletion (GDPR/DPDP compliance). Purges user, households, assessments, and actions.
  - Response: `{ message: "All household data permanently deleted." }`

## 2. Households
- `GET /households`
  - Response: `List[HouseholdOut]`
- `POST /households`
  - Body: `HouseholdCreate`
  - Response: `HouseholdOut`
- `GET /households/{household_id}`
  - Response: `HouseholdOut` (Enforces ownership check: 404/403 if unauthorized)
- `PUT /households/{household_id}`
  - Body: `HouseholdUpdate`
  - Response: `HouseholdOut`

## 3. Pollution Detective (Assessments & Outdoor AQI)
- `GET /environmental/outdoor-aqi?city={city}&latitude={lat}&longitude={lon}`
  - Response: `{ city, aqi, aqi_category, pm25, pm10, no2, source, timestamp, uncertainty_note, ventilation_advisory }`
  - Caching: 30 minutes in-memory cache to prevent provider abuse.
- `POST /households/{household_id}/assessments`
  - Body: `AssessmentInput`
  - Processing:
    1. Deterministic Rule Engine evaluates 12+ risk vectors.
    2. Fetches verified outdoor AQI context.
    3. Categorizes sources (`urgent_safety`, `priority_review`, `potential_concern`).
    4. Generates prioritized candidate actions.
    5. Dispatches contextual personalization prompt to Gemini (with fallback).
    6. Stores assessment and generated recommendations.
  - Response: `AssessmentResultOut` (Includes `identified_sources`, `outdoor_conditions`, `recommendations`, `scientific_disclaimer`)
- `GET /households/{household_id}/assessments/latest`
  - Response: `AssessmentResultOut`

## 4. Affordable Action Recommendations
- `GET /households/{household_id}/recommendations`
  - Query params: `category?`, `max_cost_tier?`, `status?`
  - Response: `List[RecommendationOut]`
- `POST /households/{household_id}/recommendations/{recommendation_id}/explain`
  - Body: `{ question?: string }`
  - Purpose: GenAI explanation / Q&A for specific recommendation with safety guards.
  - Response: `{ answer: string, reference: string, limitations: string }`

## 5. Impact Tracker
- `GET /households/{household_id}/tracker/summary`
  - Response: `{ total_actions, completed_count, planned_count, started_count, completion_rate_percent, sources_addressed_count, total_sources_count, directional_impact_summary, scientific_disclaimer }`
- `GET /households/{household_id}/tracker/actions`
  - Response: `List[TrackedActionOut]`
- `POST /households/{household_id}/tracker/actions`
  - Body: `{ recommendation_id?, action_key, title, category, status, notes? }`
  - Response: `TrackedActionOut`
- `PATCH /households/{household_id}/tracker/actions/{action_id}`
  - Body: `{ status?: "planned" | "started" | "completed" | "skipped", notes?: string }`
  - Response: `TrackedActionOut`

## 6. Guest Demonstration Mode
- `POST /guest/demo-session`
  - Purpose: Initialize an interactive session without registration.
  - Returns sample household, runs live assessment with live/cached AQI, and returns real recommendations and tracker state.
