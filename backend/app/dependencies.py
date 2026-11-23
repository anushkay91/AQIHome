from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User, Household
from backend.app.security import decode_access_token

security_bearer = HTTPBearer(auto_error=False)

def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    token_cookie: Optional[str] = Cookie(None, alias="gharkagod_token"),
    db: Session = Depends(get_db)
) -> User:
    token = None
    if auth_header and auth_header.credentials:
        token = auth_header.credentials
    elif token_cookie:
        token = token_cookie

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def verify_household_owner(
    household_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Household:
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Household with ID '{household_id}' does not exist"
        )
    
    if household.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to view or modify this household"
        )
    
    return household
