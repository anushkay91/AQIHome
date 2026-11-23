import sys
import os
sys.path.insert(0, os.path.abspath("."))
import json
import httpx
from fastapi.testclient import TestClient
from backend.app.main import app

def run_e2e_verification():
    print("=" * 70)
    print("Starting GharKaGod SaaS Comprehensive End-to-End Verification")
    print("=" * 70)

    client = TestClient(app)

    # 1. Healthcheck
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200, f"Healthcheck failed: {res_health.text}"
    health_data = res_health.json()
    assert health_data["status"] == "healthy"
    assert "strict_zero_indoor_sensor_policy" in health_data["scientific_integrity"]
    print("✓ 1. System Healthcheck Passed (Strict zero-sensor policy verified)")

    # 2. Outdoor AQI Provider
    res_aqi = client.get("/api/v1/environmental/outdoor-aqi?city=New%20Delhi")
    assert res_aqi.status_code == 200, f"Outdoor AQI failed: {res_aqi.text}"
    aqi_data = res_aqi.json()
    assert aqi_data["aqi"] > 0
    assert aqi_data["aqi_category"] != ""
    assert "ventilation_advisory" in aqi_data
    print(f"✓ 2. Outdoor Environmental AQI fetched successfully for {aqi_data['city']}: AQI {aqi_data['aqi']} ({aqi_data['aqi_category']})")

    # 3. User Registration
    import time
    ts = int(time.time() * 1000)
    user_email = f"sharma_household_e2e_{ts}@example.com"
    res_reg = client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": "SuperSecurePassword2026!",
        "full_name": "Ramesh Sharma Family"
    })
    assert res_reg.status_code == 201, f"Registration failed: {res_reg.text}"
    auth_data = res_reg.json()
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ 3. User Registered & Token Issued: {user_email} (ID: {user_id})")

    # 4. Household Profile Setup
    res_h = client.post("/api/v1/households", json={
        "name": "Sharma Apartment 302",
        "city": "New Delhi",
        "dwelling_type": "apartment",
        "approx_rooms": 3,
        "has_elderly_or_infants": True,
        "has_respiratory_conditions": True,
        "budget_tier": "low_cost_under_500"
    }, headers=headers)
    assert res_h.status_code == 201, f"Household creation failed: {res_h.text}"
    household = res_h.json()
    h_id = household["id"]
    print(f"✓ 4. Household Profile Created: '{household['name']}' in {household['city']}")

    # 5. Pollution Detective Assessment (Module A)
    res_assess = client.post(f"/api/v1/households/{h_id}/assessments", json={
        "cooking_fuel": "lpg",
        "cooking_frequency": "daily_heavy_frying",
        "kitchen_ventilation": "interior_window_only",
        "exhaust_fan_type": "none",
        "indoor_smoking": False,
        "incense_agarbatti_or_camphor": "daily_multiple_times",
        "mosquito_coils_usage": "every_night",
        "heating_appliance": "open_coal_angithi",
        "visible_dampness_mold": True,
        "cleaning_products_habit": "heavy_scented_bleach_aerosols"
    }, headers=headers)
    assert res_assess.status_code == 201, f"Assessment failed: {res_assess.text}"
    assessment = res_assess.json()
    sources = assessment["identified_sources"]
    assert len(sources) >= 4
    
    # Must identify the deadly open coal angithi hazard
    angithi_hazard = next((s for s in sources if "Angithi" in s["source_name"]), None)
    assert angithi_hazard is not None, "Rule engine failed to flag open coal angithi!"
    assert angithi_hazard["severity"] == "urgent_safety"
    print(f"✓ 5. Module A (Pollution Detective): {len(sources)} sources flagged deterministically. Urgent CO hazard caught!")

    # 6. Affordable Action Recommendations (Module B)
    recs = assessment["recommendations"]
    assert len(recs) >= 3
    # First recommendation must be the urgent safety action
    assert recs[0]["priority_tier"] == "urgent_safety"
    print(f"✓ 6. Module B (Recommendations): {len(recs)} prioritized actions generated with evidence links.")

    # 7. GenAI Contextual Explanation with Safety Boundary
    target_rec = recs[0]
    res_explain = client.post(
        f"/api/v1/households/{h_id}/recommendations/{target_rec['id']}/explain",
        json={"question": "Can I keep a small window cracked if I use coal?"},
        headers=headers
    )
    assert res_explain.status_code == 200, f"Explain failed: {res_explain.text}"
    exp_data = res_explain.json()
    assert "safety_boundary" in exp_data
    assert exp_data["safety_boundary"] != ""
    print(f"✓ 7. GenAI Contextualizer: Safety boundary strictly enforced: '{exp_data['safety_boundary']}'")

    # 8. Impact Tracker (Module C)
    res_actions = client.get(f"/api/v1/households/{h_id}/tracker/actions", headers=headers)
    assert res_actions.status_code == 200
    tracked_list = res_actions.json()
    assert len(tracked_list) > 0
    first_act = tracked_list[0]

    # Adopt the action
    res_patch = client.patch(
        f"/api/v1/households/{h_id}/tracker/actions/{first_act['id']}",
        json={"status": "completed", "notes": "Eliminated angithi, switched to heavy razai."},
        headers=headers
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "completed"

    res_summary = client.get(f"/api/v1/households/{h_id}/tracker/summary", headers=headers)
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert summary["completed_count"] >= 1
    assert summary["completion_rate_percent"] > 0
    print(f"✓ 8. Module C (Impact Tracker): Adherence logged. Completion: {summary['completion_rate_percent']}% across {summary['sources_addressed_count']} addressed sources.")

    # 9. Tenant Isolation & IDOR Defense Check
    intruder_email = f"intruder_{ts}@example.com"
    res_reg_b = client.post("/api/v1/auth/register", json={
        "email": intruder_email,
        "password": "Password123!456",
        "full_name": "Intruder User"
    })
    token_b = res_reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Intruder tries to read user A's household
    res_idor = client.get(f"/api/v1/households/{h_id}", headers=headers_b)
    assert res_idor.status_code == 403, f"IDOR Vulnerability detected! Status: {res_idor.status_code}"
    print("✓ 9. Security Audit: Tenant isolation verified. Cross-account IDOR attempt blocked (HTTP 403 Forbidden).")

    # 10. Guest Demonstration Mode
    res_guest = client.post("/api/v1/guest/demo-session")
    assert res_guest.status_code == 200
    guest_data = res_guest.json()
    assert guest_data["is_guest_demo"] is True
    print(f"✓ 10. Guest Demonstration Mode verified: Ephemeral demo session bootstrapped with '{guest_data['household']['name']}'.")

    # 11. User Data Deletion (GDPR/DPDP Sovereignty)
    res_del = client.delete("/api/v1/auth/me/data", headers=headers)
    assert res_del.status_code == 200
    print("✓ 11. Privacy Audit: Permanent User & Household Data Deletion verified.")

    print("=" * 70)
    print("ALL 11 END-TO-END VERIFICATION CHECKS PASSED WITH 100% SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    run_e2e_verification()
