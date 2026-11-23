# Database Schema & Migration Path: GharKaGod

## 1. Entity-Relationship Architecture

```mermaid
erDiagram
    USERS ||--o{ HOUSEHOLDS : owns
    HOUSEHOLDS ||--o{ ASSESSMENTS : evaluates
    ASSESSMENTS ||--o{ RECOMMENDATIONS : produces
    HOUSEHOLDS ||--o{ TRACKED_ACTIONS : logs
    RECOMMENDATIONS ||--o{ TRACKED_ACTIONS : references

    USERS {
        string id PK
        string email UK
        string hashed_password
        string full_name
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    HOUSEHOLDS {
        string id PK
        string user_id FK
        string name
        string city
        string state_region
        string dwelling_type
        int approx_rooms
        boolean has_elderly_or_infants
        boolean has_respiratory_conditions
        string budget_tier
        datetime created_at
        datetime updated_at
    }

    ASSESSMENTS {
        string id PK
        string household_id FK
        string cooking_fuel
        string cooking_frequency
        string kitchen_ventilation
        string exhaust_fan_type
        boolean indoor_smoking
        string incense_agarbatti_or_camphor
        string mosquito_coils_usage
        string heating_appliance
        boolean visible_dampness_mold
        string cleaning_products_habit
        text raw_sources_json
        text outdoor_aqi_snapshot_json
        datetime created_at
    }

    RECOMMENDATIONS {
        string id PK
        string assessment_id FK
        string action_key
        string title
        string category
        string priority_tier
        string cost_category
        int estimated_cost_inr
        string household_trigger
        text qualitative_impact
        text limitations
        string evidence_reference
        text ai_explanation
        datetime created_at
    }

    TRACKED_ACTIONS {
        string id PK
        string household_id FK
        string recommendation_id FK
        string action_key
        string title
        string category
        string status
        datetime completed_at
        text notes
        string habit_frequency
        datetime created_at
        datetime updated_at
    }
```

## 2. Table Definitions & Constraints

1. **`users`:**
   - Primary key: `id` (UUID v4 string, 36 chars)
   - Unique Index: `email` (case-insensitive lookup)
   - Cascade delete: When user is deleted, all associated `households` and child records are deleted via SQLAlchemy ORM cascade.

2. **`households`:**
   - Foreign key: `user_id` -> `users(id)` ON DELETE CASCADE
   - Index: `user_id` for instantaneous user-level tenant lookups
   - Check constraint on `dwelling_type`: `IN ('apartment', 'independent_house', 'slum_cluster_or_informal', 'chawl_or_tenement', 'other')`
   - Check constraint on `budget_tier`: `IN ('zero_cost', 'low_cost_under_500', 'moderate_under_3000', 'flexible')`

3. **`assessments`:**
   - Foreign key: `household_id` -> `households(id)` ON DELETE CASCADE
   - Index: `household_id`, `created_at`

4. **`recommendations`:**
   - Foreign key: `assessment_id` -> `assessments(id)` ON DELETE CASCADE
   - Index: `assessment_id`, `action_key`

5. **`tracked_actions`:**
   - Foreign key: `household_id` -> `households(id)` ON DELETE CASCADE
   - Foreign key: `recommendation_id` -> `recommendations(id)` ON DELETE SET NULL
   - Index: `household_id`, `status`

---

## 3. PostgreSQL Migration Path

For production deployment on managed cloud databases (AWS RDS, Google Cloud SQL, Supabase, Neon), execute the following upgrade steps:

### Connection String Switch:
Change `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql+psycopg2://gharkagod_user:StrongPassword@localhost:5432/gharkagod_db"
```

### PostgreSQL DDL Generation:
```sql
-- PostgreSQL Production DDL
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE households (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_region VARCHAR(100),
    dwelling_type VARCHAR(50) NOT NULL,
    approx_rooms INTEGER DEFAULT 2,
    has_elderly_or_infants BOOLEAN DEFAULT FALSE,
    has_respiratory_conditions BOOLEAN DEFAULT FALSE,
    budget_tier VARCHAR(30) DEFAULT 'low_cost_under_500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_households_user_id ON households(user_id);

CREATE TABLE assessments (
    id VARCHAR(36) PRIMARY KEY,
    household_id VARCHAR(36) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    cooking_fuel VARCHAR(50) NOT NULL,
    cooking_frequency VARCHAR(50) NOT NULL,
    kitchen_ventilation VARCHAR(50) NOT NULL,
    exhaust_fan_type VARCHAR(50) NOT NULL,
    indoor_smoking BOOLEAN DEFAULT FALSE,
    incense_agarbatti_or_camphor VARCHAR(50) NOT NULL,
    mosquito_coils_usage VARCHAR(50) NOT NULL,
    heating_appliance VARCHAR(50) NOT NULL,
    visible_dampness_mold BOOLEAN DEFAULT FALSE,
    cleaning_products_habit VARCHAR(50) NOT NULL,
    raw_sources_json JSONB NOT NULL,
    outdoor_aqi_snapshot_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_assessments_household_id ON assessments(household_id);

CREATE TABLE recommendations (
    id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(36) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    action_key VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority_tier VARCHAR(30) NOT NULL,
    cost_category VARCHAR(30) NOT NULL,
    estimated_cost_inr INTEGER DEFAULT 0,
    household_trigger VARCHAR(255) NOT NULL,
    qualitative_impact TEXT NOT NULL,
    limitations TEXT NOT NULL,
    evidence_reference VARCHAR(255) NOT NULL,
    ai_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_recommendations_assessment_id ON recommendations(assessment_id);

CREATE TABLE tracked_actions (
    id VARCHAR(36) PRIMARY KEY,
    household_id VARCHAR(36) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(36) REFERENCES recommendations(id) ON DELETE SET NULL,
    action_key VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'planned',
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    habit_frequency VARCHAR(50) DEFAULT 'daily_routine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tracked_actions_household ON tracked_actions(household_id, status);
```
