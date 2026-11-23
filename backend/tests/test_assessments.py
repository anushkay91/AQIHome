import pytest
from fastapi import status

def test_full_assessment_flow_and_persistence(client, auth_headers, test_household):
    assessment_payload = {
        "cooking_fuel": "lpg",
        "cooking_frequency": "daily_heavy_frying",
        "kitchen_ventilation": "interior_window_only",
        "exhaust_fan_type": "none",
        "indoor_smoking": False,
        "incense_agarbatti_or_camphor": "daily_once",
        "mosquito_coils_usage": "every_night",
        "heating_appliance": "none",
        "visible_dampness_mold": True,
        "cleaning_products_habit": "heavy_scented_bleach_aerosols"
    }

    res = client.post(
        f"/api/v1/households/{test_household.id}/assessments",
        json=assessment_payload,
        headers=auth_headers
    )
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()

    assert "assessment_id" in data
    assert data["household_id"] == test_household.id
    assert len(data["identified_sources"]) >= 3
    assert len(data["recommendations"]) >= 3
    assert "outdoor_conditions" in data
    assert "scientific_disclaimer" in data
    assert "no indoor environmental sensors" in data["scientific_disclaimer"].lower()

    # Query latest assessment
    res_latest = client.get(
        f"/api/v1/households/{test_household.id}/assessments/latest",
        headers=auth_headers
    )
    assert res_latest.status_code == status.HTTP_200_OK
    assert res_latest.json()["assessment_id"] == data["assessment_id"]

def test_impact_tracker_lifecycle(client, auth_headers, test_household):
    # 1. First submit assessment to populate recommendations & seed tracked actions
    assessment_payload = {
        "cooking_fuel": "lpg",
        "cooking_frequency": "daily_light_moderate",
        "kitchen_ventilation": "dedicated_window_outdoors",
        "exhaust_fan_type": "ducted_outdoors",
        "indoor_smoking": False,
        "incense_agarbatti_or_camphor": "daily_once",
        "mosquito_coils_usage": "never",
        "heating_appliance": "none",
        "visible_dampness_mold": False,
        "cleaning_products_habit": "mild_unscented_soap_water"
    }
    client.post(f"/api/v1/households/{test_household.id}/assessments", json=assessment_payload, headers=auth_headers)

    # 2. Get list of tracked actions
    actions_res = client.get(f"/api/v1/households/{test_household.id}/tracker/actions", headers=auth_headers)
    assert actions_res.status_code == status.HTTP_200_OK
    actions = actions_res.json()
    assert len(actions) > 0

    first_action = actions[0]
    assert first_action["status"] == "planned"

    # 3. Transition to started, then completed
    patch_res = client.patch(
        f"/api/v1/households/{test_household.id}/tracker/actions/{first_action['id']}",
        json={"status": "completed", "notes": "Covered all pots today during dinner prep."},
        headers=auth_headers
    )
    assert patch_res.status_code == status.HTTP_200_OK
    updated = patch_res.json()
    assert updated["status"] == "completed"
    assert updated["completed_at"] is not None
    assert updated["notes"] == "Covered all pots today during dinner prep."

    # 4. Check tracker summary statistics
    summary_res = client.get(f"/api/v1/households/{test_household.id}/tracker/summary", headers=auth_headers)
    assert summary_res.status_code == status.HTTP_200_OK
    summary = summary_res.json()
    assert summary["completed_count"] >= 1
    assert summary["completion_rate_percent"] > 0
    assert "scientific_disclaimer" in summary
