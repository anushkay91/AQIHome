import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    households = relationship("Household", back_populates="owner", cascade="all, delete-orphan")

class Household(Base):
    __tablename__ = "households"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False, default="New Delhi")
    state_region = Column(String(100), nullable=True)
    dwelling_type = Column(String(50), nullable=False, default="apartment")
    approx_rooms = Column(Integer, default=2)
    has_elderly_or_infants = Column(Boolean, default=False)
    has_respiratory_conditions = Column(Boolean, default=False)
    budget_tier = Column(String(30), default="low_cost_under_500")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    owner = relationship("User", back_populates="households")
    assessments = relationship("Assessment", back_populates="household", cascade="all, delete-orphan")
    tracked_actions = relationship("TrackedAction", back_populates="household", cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    household_id = Column(String(36), ForeignKey("households.id"), index=True, nullable=False)
    
    # Questionnaire responses
    cooking_fuel = Column(String(50), nullable=False)
    cooking_frequency = Column(String(50), nullable=False)
    kitchen_ventilation = Column(String(50), nullable=False)
    exhaust_fan_type = Column(String(50), nullable=False)
    indoor_smoking = Column(Boolean, default=False)
    incense_agarbatti_or_camphor = Column(String(50), nullable=False)
    mosquito_coils_usage = Column(String(50), nullable=False)
    heating_appliance = Column(String(50), nullable=False)
    visible_dampness_mold = Column(Boolean, default=False)
    cleaning_products_habit = Column(String(50), nullable=False)
    
    # Result payload (raw deterministic sources & verified outdoor AQI snapshot)
    raw_sources_json = Column(Text, nullable=False)
    outdoor_aqi_snapshot_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    household = relationship("Household", back_populates="assessments")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), index=True, nullable=False)
    action_key = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    priority_tier = Column(String(30), nullable=False)
    cost_category = Column(String(30), nullable=False)
    estimated_cost_inr = Column(Integer, default=0)
    household_trigger = Column(String(255), nullable=False)
    qualitative_impact = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    evidence_reference = Column(String(255), nullable=False)
    ai_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    assessment = relationship("Assessment", back_populates="recommendations")

class TrackedAction(Base):
    __tablename__ = "tracked_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    household_id = Column(String(36), ForeignKey("households.id"), index=True, nullable=False)
    recommendation_id = Column(String(36), ForeignKey("recommendations.id"), nullable=True)
    action_key = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    status = Column(String(30), default="planned")  # planned, started, completed, skipped
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    habit_frequency = Column(String(50), default="daily_routine")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    household = relationship("Household", back_populates="tracked_actions")
