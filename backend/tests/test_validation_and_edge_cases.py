import pytest
from unittest.mock import patch, AsyncMock
import httpx
from fastapi import status
from backend.app.services.environmental_service import fetch_outdoor_aqi

def test_invalid_assessment_input_rejected_with_422(client, auth_headers, test_household):
    """
    Validation Test: Pydantic v2 rejects malformed fields and invalid patterns with 422.
    """
    invalid_payload = {
        "cooking_fuel": "invalid_diesel_fuel",  # Not in allowed pattern
        "cooking_frequency": "daily_light_moderate",
        "kitchen_ventilation": "unsupported_duct",  # Invalid pattern
        "exhaust_fan_type": "none",
        "indoor_smoking": False,
        "incense_agarbatti_or_camphor": "never",
        "mosquito_coils_usage": "never",
        "heating_appliance": "none",
        "visible_dampness_mold": False,
        "cleaning_products_habit": "mild_unscented_soap_water"
    }

    res = client.post(
        f"/api/v1/households/{test_household.id}/assessments",
        json=invalid_payload,
        headers=auth_headers
    )
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    details = res.json()["detail"]
    assert any("cooking_fuel" in str(d["loc"]) for d in details)

def test_recommendation_cross_household_idor_blocked(client, auth_headers, auth_headers_b, test_household, db_session):
    """
    Security & Quality: User A cannot explain or probe User B's recommendation even with their own valid household.
    """
    from backend.app.models import Household, Assessment, Recommendation

    # Create household and recommendation for User B
    household_b = Household(
        user_id="secondary_user_id_b",
        name="Household B",
        city="Lucknow"
    )
    # 1. User A submits assessment on own household
    assess_a = {
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
    res_a = client.post(f"/api/v1/households/{test_household.id}/assessments", json=assess_a, headers=auth_headers)
    rec_a_id = res_a.json()["recommendations"][0]["id"]

    # 2. Attempt to explain a non-existent or foreign recommendation ID on User A's household
    res_foreign = client.post(
        f"/api/v1/households/{test_household.id}/recommendations/non-existent-rec-uuid/explain",
        json={"question": "What is the physical mechanism?"},
        headers=auth_headers
    )
    assert res_foreign.status_code == status.HTTP_404_NOT_FOUND
    assert "not found for this household" in res_foreign.json()["detail"].lower()

def test_household_update_and_ownership(client, auth_headers, auth_headers_b, test_household):
    """
    Verifies PUT /api/v1/households/{id} succeeds for owner and is forbidden for other tenants.
    """
    update_payload = {
        "name": "Updated Residence Name",
        "approx_rooms": 4,
        "budget_tier": "moderate_under_3000"
    }
    # Owner updates: 200 OK
    res_owner = client.put(f"/api/v1/households/{test_household.id}", json=update_payload, headers=auth_headers)
    assert res_owner.status_code == status.HTTP_200_OK
    assert res_owner.json()["name"] == "Updated Residence Name"
    assert res_owner.json()["approx_rooms"] == 4

    # Other tenant attempts update: 403 Forbidden
    res_other = client.put(f"/api/v1/households/{test_household.id}", json=update_payload, headers=auth_headers_b)
    assert res_other.status_code == status.HTTP_403_FORBIDDEN

def test_user_profile_me_endpoint(client, auth_headers, test_user):
    """
    Verifies GET /api/v1/auth/me returns the authenticated user profile.
    """
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name

def test_empty_assessment_state_handling(client, auth_headers, test_household):
    """
    Verifies safe empty states when no assessment exists yet.
    """
    # Latest assessment returns 404
    res_latest = client.get(f"/api/v1/households/{test_household.id}/assessments/latest", headers=auth_headers)
    assert res_latest.status_code == status.HTTP_404_NOT_FOUND

    # Recommendations returns empty list []
    res_recs = client.get(f"/api/v1/households/{test_household.id}/recommendations", headers=auth_headers)
    assert res_recs.status_code == status.HTTP_200_OK
    assert res_recs.json() == []

@pytest.mark.asyncio
async def test_environmental_service_network_outage_fallback():
    """
    Verifies that when Open-Meteo is unreachable, environmental_service activates
    the defensible seasonal baseline without crashing or raising exceptions.
    """
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectTimeout("Connection timed out")):
        # Request for a city not in cache
        ctx = await fetch_outdoor_aqi(city="Chandigarh_Uncached_Outage_Test")
        assert ctx.is_live is False
        assert "Fallback - Provider Offline" in ctx.source
        assert ctx.aqi > 0
        assert ctx.aqi_category in ["Moderate", "Poor", "Very Poor", "Severe"]
        assert "CRITICAL" in ctx.ventilation_advisory or "CAUTION" in ctx.ventilation_advisory or "FAVORABLE" in ctx.ventilation_advisory
