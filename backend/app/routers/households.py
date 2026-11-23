from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Household
from backend.app.schemas import HouseholdCreate, HouseholdUpdate, HouseholdOut
from backend.app.dependencies import get_current_user, verify_household_owner

router = APIRouter(prefix="/households", tags=["Households"])

@router.get("", response_model=List[HouseholdOut])
def list_households(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    households = db.query(Household).filter(Household.user_id == current_user.id).all()
    return [HouseholdOut.model_validate(h) for h in households]

@router.post("", response_model=HouseholdOut, status_code=status.HTTP_201_CREATED)
def create_household(
    household_in: HouseholdCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    household = Household(
        user_id=current_user.id,
        name=household_in.name,
        city=household_in.city,
        state_region=household_in.state_region,
        dwelling_type=household_in.dwelling_type,
        approx_rooms=household_in.approx_rooms,
        has_elderly_or_infants=household_in.has_elderly_or_infants,
        has_respiratory_conditions=household_in.has_respiratory_conditions,
        budget_tier=household_in.budget_tier
    )
    db.add(household)
    db.commit()
    db.refresh(household)
    return HouseholdOut.model_validate(household)

@router.get("/{household_id}", response_model=HouseholdOut)
def get_household(
    household_id: str,
    household: Household = Depends(verify_household_owner)
):
    return HouseholdOut.model_validate(household)

@router.put("/{household_id}", response_model=HouseholdOut)
def update_household(
    household_id: str,
    update_in: HouseholdUpdate,
    household: Household = Depends(verify_household_owner),
    db: Session = Depends(get_db)
):
    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(household, field, value)
    
    db.commit()
    db.refresh(household)
    return HouseholdOut.model_validate(household)
