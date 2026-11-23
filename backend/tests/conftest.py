import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.models import User, Household
from backend.app.security import get_password_hash, create_access_token

# In-memory SQLite engine for fast, isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session):
    user = User(
        email="user_primary@example.com",
        hashed_password=get_password_hash("testSecret123!"),
        full_name="Primary Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_user_b(db_session):
    user = User(
        email="user_secondary@example.com",
        hashed_password=get_password_hash("testSecret456!"),
        full_name="Secondary Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def auth_headers(test_user):
    token = create_access_token({"sub": test_user.id, "email": test_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def auth_headers_b(test_user_b):
    token = create_access_token({"sub": test_user_b.id, "email": test_user_b.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def test_household(db_session, test_user):
    household = Household(
        user_id=test_user.id,
        name="Primary Residence",
        city="New Delhi",
        dwelling_type="apartment",
        approx_rooms=2,
        has_elderly_or_infants=True,
        has_respiratory_conditions=False,
        budget_tier="low_cost_under_500"
    )
    db_session.add(household)
    db_session.commit()
    db_session.refresh(household)
    return household
