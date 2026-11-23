import time
import httpx

BASE_URL = "https://gharkagod-1054042324015.us-central1.run.app"
API_URL = f"{BASE_URL}/api/v1"

def run_cloudrun_verification():
    print("=" * 70)
    print("Starting GharKaGod Live Google Cloud Run Verification")
    print("Target:", BASE_URL)
    print("=" * 70)

    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Root SPA HTML check
        res_root = client.get("/")
        assert res_root.status_code == 200, f"Root SPA failed: {res_root.status_code}"
        assert "<div id=\"root\">" in res_root.text or "GharKaGod" in res_root.text or "html" in res_root.text
        print("✓ 1. Live SPA Frontend Root successfully served (HTTP 200)")

        # 2. Healthcheck
        res_health = client.get("/health")
        assert res_health.status_code == 200, f"Healthcheck failed: {res_health.text}"
        health_data = res_health.json()
        assert health_data["status"] == "healthy"
        assert health_data["scientific_integrity"] == "strict_zero_indoor_sensor_policy"
        print("✓ 2. Production Healthcheck verified (Strict Zero Sensor Policy active)")

        # 3. Ambient Environmental AQI
        res_aqi = client.get("/api/v1/environmental/outdoor-aqi?city=New%20Delhi")
        assert res_aqi.status_code == 200, f"AQI failed: {res_aqi.text}"
        aqi_data = res_aqi.json()
        print(f"✓ 3. Live Ambient AQI: {aqi_data['city']} AQI={aqi_data['aqi']} ({aqi_data['aqi_category']})")

        # 4. Guest Demonstration Mode
        res_guest = client.post("/api/v1/guest/demo-session")
        assert res_guest.status_code == 200, f"Guest bootstrap failed: {res_guest.text}"
        guest_data = res_guest.json()
        assert "access_token" in guest_data
        print(f"✓ 4. Guest Demonstration Session bootstrapped: Household '{guest_data['household']['name']}'")

        # 5. Full authenticated user lifecycle on Cloud Run
        test_email = f"cloud_run_{int(time.time()*1000)}@gharkagod.prod"
        res_reg = client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": "CloudRunPassword2026!",
            "full_name": "Cloud Run Production Tester"
        })
        assert res_reg.status_code in (200, 201), f"Registration failed: {res_reg.text}"
        token = res_reg.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        print("✓ 5. Production User Registered & JWT issued")

        # 6. Household Creation
        res_hh = client.post("/api/v1/households", json={
            "name": "Cloud Run Test Family",
            "city": "Gurugram",
            "dwelling_type": "apartment",
            "approx_rooms": 3,
            "has_elderly_or_infants": True,
            "has_respiratory_conditions": False,
            "budget_tier": "low_cost_under_500"
        }, headers=auth_headers)
        assert res_hh.status_code in (200, 201), f"Household creation failed: {res_hh.text}"
        household_id = res_hh.json()["id"]
        print(f"✓ 6. Production Household created: ID={household_id}")

        # 7. Pollution Detective Assessment
        res_assess = client.post(f"/api/v1/households/{household_id}/assessments", json={
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
        }, headers=auth_headers)
        assert res_assess.status_code in (200, 201), f"Assessment failed: {res_assess.text}"
        assess_data = res_assess.json()
        sources = assess_data["identified_sources"]
        angithi_hazard = next((s for s in sources if "Angithi" in s["source_name"]), None)
        assert angithi_hazard is not None, "Rule engine failed to flag open coal angithi!"
        assert angithi_hazard["severity"] == "urgent_safety"
        print(f"✓ 7. Pollution Detective identified {len(sources)} household risk factors (Angithi hazard caught: {angithi_hazard['source_name']})")

        # 8. Affordable Recommendations
        recs_data = assess_data["recommendations"]
        assert len(recs_data) > 0
        first_rec = recs_data[0]
        print(f"✓ 8. Recommendations Engine generated {len(recs_data)} prioritized actions (Top tier: {first_rec['priority_tier']})")

        # 9. GenAI Contextualizer Explanation
        res_explain = client.post(
            f"/api/v1/households/{household_id}/recommendations/{first_rec['id']}/explain",
            json={"question": "Can I keep a small window cracked if I use coal?"},
            headers=auth_headers
        )
        assert res_explain.status_code == 200, f"Explain failed: {res_explain.text}"
        exp_data = res_explain.json()
        print(f"✓ 9. GenAI Contextualizer verified: Safety Boundary='{exp_data['safety_boundary']}'")

        # 10. Impact Tracker
        res_actions = client.get(f"/api/v1/households/{household_id}/tracker/actions", headers=auth_headers)
        assert res_actions.status_code == 200, f"Tracker failed: {res_actions.text}"
        actions_list = res_actions.json()
        target_action = actions_list[0]

        # Update action status
        res_upd = client.patch(
            f"/api/v1/households/{household_id}/tracker/actions/{target_action['id']}",
            json={"status": "completed", "notes": "Verified directly on live Google Cloud Run instance"},
            headers=auth_headers
        )
        assert res_upd.status_code == 200, f"Update failed: {res_upd.text}"
        print(f"✓ 10. Impact Tracker updated habit '{target_action['title']}' to completed")

        # 11. Impact Summary
        res_sum = client.get(f"/api/v1/households/{household_id}/tracker/summary", headers=auth_headers)
        assert res_sum.status_code == 200, f"Summary failed: {res_sum.text}"
        sum_data = res_sum.json()
        assert sum_data["completed_count"] >= 1
        print(f"✓ 11. Impact Summary: {sum_data['completed_count']}/{sum_data['total_actions']} completed ({sum_data['completion_rate_percent']}%) (Disclaimer: '{sum_data['scientific_disclaimer'][:45]}...')")

    print("=" * 70)
    print("ALL 10 PRODUCTION CHECKS ON GOOGLE CLOUD RUN PASSED 100%!")
    print("=" * 70)

if __name__ == "__main__":
    run_cloudrun_verification()
