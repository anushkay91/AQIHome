from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==================== User & Auth Schemas ====================
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ==================== Household Schemas ====================
class HouseholdCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    city: str = Field("New Delhi", min_length=2, max_length=100)
    state_region: Optional[str] = Field(None, max_length=100)
    dwelling_type: str = Field("apartment", pattern="^(apartment|independent_house|slum_cluster_or_informal|chawl_or_tenement|other)$")
    approx_rooms: int = Field(2, ge=1, le=20)
    has_elderly_or_infants: bool = False
    has_respiratory_conditions: bool = False
    budget_tier: str = Field("low_cost_under_500", pattern="^(zero_cost|low_cost_under_500|moderate_under_3000|flexible)$")

class HouseholdUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state_region: Optional[str] = None
    dwelling_type: Optional[str] = None
    approx_rooms: Optional[int] = Field(None, ge=1, le=20)
    has_elderly_or_infants: Optional[bool] = None
    has_respiratory_conditions: Optional[bool] = None
    budget_tier: Optional[str] = None

class HouseholdOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    name: str
    city: str
    state_region: Optional[str] = None
    dwelling_type: str
    approx_rooms: int
    has_elderly_or_infants: bool
    has_respiratory_conditions: bool
    budget_tier: str
    created_at: datetime
    updated_at: datetime

# ==================== Assessment Schemas ====================
class AssessmentCreate(BaseModel):
    cooking_fuel: str = Field(..., pattern="^(lpg|biomass_wood_dung|kerosene|piped_natural_gas|electric_induction|mixed)$")
    cooking_frequency: str = Field(..., pattern="^(daily_heavy_frying|daily_light_moderate|occasional)$")
    kitchen_ventilation: str = Field(..., pattern="^(dedicated_window_outdoors|interior_window_only|closed_no_window|open_plan_living)$")
    exhaust_fan_type: str = Field(..., pattern="^(ducted_outdoors|recirculating_filter|indoor_exhaust_only|none)$")
    indoor_smoking: bool = False
    incense_agarbatti_or_camphor: str = Field(..., pattern="^(daily_multiple_times|daily_once|weekly_or_festival|never)$")
    mosquito_coils_usage: str = Field(..., pattern="^(every_night|frequent|occasional|never)$")
    heating_appliance: str = Field(..., pattern="^(none|electric_oil_radiator|electric_convector_blower|unvented_lpg_chullah|open_coal_angithi)$")
    visible_dampness_mold: bool = False
    cleaning_products_habit: str = Field(..., pattern="^(heavy_scented_bleach_aerosols|mild_unscented_soap_water|mixed)$")

class IdentifiedSource(BaseModel):
    source_name: str
    severity: str  # urgent_safety, priority_review, potential_concern
    household_input: str
    possible_pollutants: List[str]
    why_it_matters: str
    evidence_reference: str
    recommended_action_key: str
    confidence_note: str

class OutdoorAqiContext(BaseModel):
    city: str
    aqi: int
    aqi_category: str
    pm25: float
    pm10: float
    no2: Optional[float] = None
    source: str
    timestamp: str
    is_live: bool
    uncertainty_note: str
    ventilation_advisory: str

class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    action_key: str
    title: str
    category: str
    priority_tier: str
    cost_category: str
    estimated_cost_inr: int
    household_trigger: str
    qualitative_impact: str
    limitations: str
    evidence_reference: str
    ai_explanation: Optional[str] = None
    created_at: Optional[datetime] = None

class AssessmentResultOut(BaseModel):
    assessment_id: str
    household_id: str
    created_at: datetime
    outdoor_conditions: OutdoorAqiContext
    identified_sources: List[IdentifiedSource]
    recommendations: List[RecommendationOut]
    scientific_disclaimer: str

# ==================== Impact Tracker Schemas ====================
class TrackedActionCreate(BaseModel):
    recommendation_id: Optional[str] = None
    action_key: str
    title: str
    category: str
    status: str = Field("planned", pattern="^(planned|started|completed|skipped)$")
    notes: Optional[str] = None
    habit_frequency: Optional[str] = "daily_routine"

class TrackedActionUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(planned|started|completed|skipped)$")
    notes: Optional[str] = None
    habit_frequency: Optional[str] = None

class TrackedActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    household_id: str
    recommendation_id: Optional[str] = None
    action_key: str
    title: str
    category: str
    status: str
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    habit_frequency: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TrackerSummaryOut(BaseModel):
    total_actions: int
    completed_count: int
    started_count: int
    planned_count: int
    skipped_count: int
    completion_rate_percent: float
    sources_addressed_count: int
    total_sources_identified: int
    category_breakdown: Dict[str, Dict[str, int]]
    directional_impact_summary: str
    scientific_disclaimer: str

# ==================== AI Explain Schema ====================
class ExplainRequest(BaseModel):
    question: Optional[str] = Field(None, max_length=500)
    language_preference: Optional[str] = Field("en", pattern="^(en|hi|hinglish)$")

class ExplainResponse(BaseModel):
    action_key: str
    title: str
    answer: str
    scientific_rationale: str
    practical_tip: str
    safety_boundary: str
    source_reference: str
    is_ai_generated: bool
