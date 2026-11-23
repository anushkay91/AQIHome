from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Household, Assessment, Recommendation, TrackedAction
from backend.app.schemas import UserRegister, UserLogin, UserOut, TokenOut
from backend.app.security import verify_password, get_password_hash, create_access_token
from backend.app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    hashed = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/login", response_model=TokenOut)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_current_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.delete("/me/data", status_code=status.HTTP_200_OK)
def delete_all_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    User-Controlled Data Deletion (GDPR / DPDP Privacy Compliance).
    Permanently deletes the user account, associated households, assessments, recommendations, and action logs.
    """
    # Cascade delete is handled by relationship, but we explicitly purge for safety
    households = db.query(Household).filter(Household.user_id == current_user.id).all()
    for h in households:
        db.delete(h)
    
    db.delete(current_user)
    db.commit()
    return {"message": "All user and household data have been permanently purged."}
