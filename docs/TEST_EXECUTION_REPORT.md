# Test Execution Report: GharKaGod

**Execution Date:** 2026-11-23  
**Frameworks:** Pytest 9.2.0, FastAPI TestClient, Vitest/TypeScript Compiler, Python asyncio  
**Status:** 100% Passed (17 Unit/Integration Tests + 11 End-to-End User Journey Tests)

---

## 1. Pytest Automated Test Suite Results

```text
============================= test session starts =============================
platform win32 -- Python 3.14.6, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Users\Lenovo\Desktop\AllP\AQIhome
configfile: pytest.ini
plugins: anyio-4.16.0, asyncio-1.5.0
asyncio: mode=Mode.AUTO

backend/tests/test_assessments.py::test_full_assessment_flow_and_persistence PASSED [  5%]
backend/tests/test_assessments.py::test_impact_tracker_lifecycle PASSED  [ 11%]
backend/tests/test_auth_and_isolation.py::test_user_registration_and_login PASSED [ 17%]
backend/tests/test_auth_and_isolation.py::test_tenant_isolation_cross_account_access_forbidden PASSED [ 23%]
backend/tests/test_auth_and_isolation.py::test_user_data_permanent_deletion PASSED [ 29%]
backend/tests/test_recommendation_engine.py::test_recommendation_prioritization_and_severe_aqi_boundary PASSED [ 35%]
backend/tests/test_recommendation_engine.py::test_moderate_aqi_allows_timed_ventilation PASSED [ 41%]
backend/tests/test_rule_engine.py::test_rule_engine_identifies_biomass_fuel_hazard PASSED [ 47%]
backend/tests/test_rule_engine.py::test_rule_engine_identifies_coal_angithi_deadly_hazard PASSED [ 52%]
backend/tests/test_rule_engine.py::test_rule_engine_identifies_secondhand_smoke PASSED [ 58%]
backend/tests/test_rule_engine.py::test_rule_engine_identifies_mosquito_coils_and_incense PASSED [ 64%]
backend/tests/test_rule_engine.py::test_rule_engine_never_fabricates_numerical_sensor_data PASSED [ 70%]
backend/tests/test_security_resilience.py::test_cpcb_aqi_breakpoints PASSED [ 76%]
backend/tests/test_security_resilience.py::test_ventilation_advisory_logic PASSED [ 82%]
backend/tests/test_security_resilience.py::test_prompt_injection_sanitization PASSED [ 88%]
backend/tests/test_security_resilience.py::test_deterministic_fallback_explanation PASSED [ 94%]
backend/tests/test_security_resilience.py::test_guest_demo_session_bootstrap PASSED [100%]

======================= 17 passed in 7.07s ========================
```

---

## 2. End-to-End Verification Pipeline (`scripts/verify_e2e.py`)

Executed across live network services:
1. `GET /api/v1/health` -> HTTP 200 OK (`strict_zero_indoor_sensor_policy` verified)
2. `GET /api/v1/environmental/outdoor-aqi?city=New%20Delhi` -> HTTP 200 OK (Live Open-Meteo European Atmosphere Service, CPCB breakpoint calculation verified)
3. `POST /api/v1/auth/register` -> HTTP 201 Created (User registered and JWT Bearer token issued)
4. `POST /api/v1/households` -> HTTP 201 Created (Household bound to user)
5. `POST /api/v1/households/{id}/assessments` -> HTTP 201 Created (Deterministic rule engine flagged 7 sources including deadly coal angithi CO hazard)
6. `GET /api/v1/households/{id}/recommendations` -> HTTP 200 OK (Prioritized recommendations generated with evidence citations)
7. `POST /api/v1/households/{id}/recommendations/{rec_id}/explain` -> HTTP 200 OK (GenAI Contextualizer returned safety boundaries and practical tips)
8. `GET /api/v1/households/{id}/tracker/actions` & `PATCH ...` -> HTTP 200 OK (Habit status updated from planned to completed)
9. `GET /api/v1/households/{id}/tracker/summary` -> HTTP 200 OK (Accurate completion rate and directional impact summary)
10. `GET /api/v1/households/{id_A}` with User B's Token -> **HTTP 403 Forbidden** (Strict tenant isolation / IDOR protection confirmed)
11. `POST /api/v1/guest/demo-session` -> HTTP 200 OK (Instant guest demonstration session bootstrapped with zero credentials)
12. `DELETE /api/v1/auth/me/data` -> HTTP 200 OK (Permanent user and household data erasure verified)

---

## 3. Frontend Production Build Verification

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 2152 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-ByHHUYY8.css   27.28 kB │ gzip:   5.51 kB
dist/assets/index-DmbEF1bT.js   365.03 kB │ gzip: 106.22 kB
✓ built in 1.15s
```
- **Strict TypeScript:** Zero `any` escapes, zero compilation warnings.
- **Bundle Efficiency:** Compressed JavaScript bundle is **106 KB (gzip)**.
