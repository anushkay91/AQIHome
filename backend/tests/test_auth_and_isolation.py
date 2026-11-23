import pytest
from fastapi import status
from backend.app.models import Household

def test_user_registration_and_login(client):
    reg_payload = {
        "email": "newuser@example.com",
        "password": "strongPassword123!",
        "full_name": "Test Onboarding"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"

    # Login with same credentials
    login_payload = {
        "email": "newuser@example.com",
        "password": "strongPassword123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == status.HTTP_200_OK
    assert "access_token" in res_login.json()

def test_tenant_isolation_cross_account_access_forbidden(client, auth_headers, auth_headers_b, test_household):
    """
    Security Test: User B attempts to access or mutate User A's household (IDOR vulnerability check).
    Must return 403 Forbidden.
    """
    # User A accesses own household: 200 OK
    res_a = client.get(f"/api/v1/households/{test_household.id}", headers=auth_headers)
    assert res_a.status_code == status.HTTP_200_OK
    assert res_a.json()["id"] == test_household.id

    # User B attempts to access User A's household: 403 Forbidden
    res_b = client.get(f"/api/v1/households/{test_household.id}", headers=auth_headers_b)
    assert res_b.status_code == status.HTTP_403_FORBIDDEN
    assert "permission" in res_b.json()["detail"].lower()

    # User B attempts to submit assessment for User A's household: 403 Forbidden
    assessment_payload = {
        "cooking_fuel": "lpg",
        "cooking_frequency": "daily_light_moderate",
        "kitchen_ventilation": "dedicated_window_outdoors",
        "exhaust_fan_type": "ducted_outdoors",
        "indoor_smoking": False,
        "incense_agarbatti_or_camphor": "never",
        "mosquito_coils_usage": "never",
        "heating_appliance": "none",
        "visible_dampness_mold": False,
        "cleaning_products_habit": "mild_unscented_soap_water"
    }
    res_b_assess = client.post(
        f"/api/v1/households/{test_household.id}/assessments",
        json=assessment_payload,
        headers=auth_headers_b
    )
    assert res_b_assess.status_code == status.HTTP_403_FORBIDDEN

def test_user_data_permanent_deletion(client, auth_headers, test_user, test_household, db_session):
    """
    Privacy test: user deletes all data; user and household records must be permanently purged.
    """
    del_res = client.delete("/api/v1/auth/me/data", headers=auth_headers)
    assert del_res.status_code == status.HTTP_200_OK
    assert "purged" in del_res.json()["message"]

    # Household should be deleted
    h = db_session.query(Household).filter(Household.id == test_household.id).first()
    assert h is None
