# GharKaGod (घर का गॉड)
> **GenAI-Powered Household Indoor Air Pollution SaaS for South Asian Winter Smog**
> Developed for the **PromptWar GenAI Challenge**.

[![Backend Tests](https://img.shields.io/badge/pytest-17%20passed-emerald)](backend/tests)
[![E2E Verification](https://img.shields.io/badge/E2E%20Tests-11%2F11%20passed-emerald)](scripts/verify_e2e.py)
[![Frontend Build](https://img.shields.io/badge/Vite%20Bundle-365%20KB%20(106%20KB%20gzip)-blue)](frontend)
[![Accessibility](https://img.shields.io/badge/WCAG%202.2-AA%20Compliant-purple)](docs/ACCESSIBILITY_AUDIT.md)
[![Zero Fake Sensors](https://img.shields.io/badge/Scientific%20Honesty-Strict%20Zero%20Sensor%20Policy-orange)](docs/CHALLENGE_ALIGNMENT.md)
[![Live Demo](https://img.shields.io/badge/Cloud%20Run-Live%20Production-success)](https://gharkagod-1054042324015.us-central1.run.app)

---

## 🚀 Live Production & Repository Links

- **Live Cloud Run Deployment:** [https://gharkagod-1054042324015.us-central1.run.app](https://gharkagod-1054042324015.us-central1.run.app)
- **GitHub Repository:** [https://github.com/anushkay91/AQIHome](https://github.com/anushkay91/AQIHome)
- **GCP Project:** `smartcity-515403` (Project Number: `1054042324015`)
- **API Documentation (Swagger):** [https://gharkagod-1054042324015.us-central1.run.app/docs](https://gharkagod-1054042324015.us-central1.run.app/docs)
- **Healthcheck:** [https://gharkagod-1054042324015.us-central1.run.app/health](https://gharkagod-1054042324015.us-central1.run.app/health)

---

## 1. Executive Summary

During severe winter smog across northern India and South Asia (Indo-Gangetic Plain), outdoor AQI frequently surges above 400 ("Severe"). Millions of families lack high-end ₹20,000–₹40,000 electronic air purifiers and rely on misleading smartphone "AQI hacks".

**GharKaGod** is a production-grade, accessible SaaS application designed to help households navigate severe winter smog through **affordable, evidence-backed daily routines and indoor air quality mitigations**.

### The Three Approved Core Modules:
1. **Pollution Detective:** A 10-point household questionnaire evaluating cooking fuels, exhaust ducting, heating appliances, incense burning, mosquito coils, and visible mold. Evaluated via a deterministic, peer-reviewed public-health rule engine (WHO/EPA/Lancet). Fetches verified ambient outdoor air quality from Open-Meteo European Atmosphere Monitoring Service with CPCB NAQI standard indexing.
2. **Affordable Action Recommendations:** Prioritized low-cost interventions (₹0 to ₹3,000), including pot-lid cooking, wet mopping dust binding, strategic timed ventilation windows, and DIY Corsi-Rosenthal box purifiers. Contextualized and explained in plain language via Google Gemini GenAI with strict prompt injection sandboxing and deterministic fallback.
3. **Impact Tracker:** Persisted habit tracking comparing household practices before and after interventions, tracking completion rates and addressed risk vectors with strict scientific honesty on directional physical mechanisms.

---

## 2. Non-Negotiable Scientific Honesty

**The application has NO indoor environmental sensors.**

- ❌ Never pretends to measure indoor AQI, PM2.5, PM10, CO, or VOCs.
- ❌ Never presents fabricated live indoor readings.
- ❌ Never equates outdoor AQI with indoor air quality.
- ❌ Never invents numerical emission reduction percentages (e.g. "reduced AQI by 42 points").
- ❌ Never diagnoses medical conditions or promises that an intervention prevents disease.
- ⚠️ Treats dangerous combustion situations (open coal *angithis*, unvented biomass) with urgent emergency safety guidance.
- 🪟 Windows are NEVER recommended to be opened without considering outdoor smog conditions.

---

## 3. Technology Stack

- **Frontend:** React 19 / 18, TypeScript (Strict Mode), Vite, Tailwind CSS, Lucide React icons, React Router v7/v6.
- **Backend:** Python FastAPI, Pydantic v2 validation, SQLAlchemy 2.0 ORM, SQLite (local development) with documented PostgreSQL migration path.
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) through a secure server-side pipeline with strict structured JSON schemas and robust deterministic fallbacks.
- **Environmental Data:** Open-Meteo Air Quality API (Hourly PM2.5, PM10, NO2, O3) benchmarked against India Central Pollution Control Board (CPCB) NAQI breakpoints.
- **Security & Privacy:** Bcrypt password hashing, JWT authentication, strict server-side tenant isolation (IDOR protection), prompt injection sanitization, and one-click GDPR/DPDP permanent user data deletion.

---

## 4. Quickstart Guide (Local Development)

### Prerequisites
- Python 3.12+ (or Python 3.14)
- Node.js v18+ and npm

### 1. Clone & Setup Backend
```bash
# In the project root:
py -m venv .venv

# Activate Virtual Environment:
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install backend dependencies:
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If `GEMINI_API_KEY` is omitted, the application automatically uses the verified deterministic evidence fallback seamlessly).*

### 3. Start the Backend API Server
```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be accessible at:
- API Base: `http://127.0.0.1:8000/api/v1`
- Swagger Interactive Docs: `http://127.0.0.1:8000/docs`
- Healthcheck: `http://127.0.0.1:8000/health`

### 4. Setup & Start Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 5. Instant Guest Demonstration Mode

GharKaGod includes a **zero-credential Guest Demonstration Mode**.
1. Open `http://localhost:5173`.
2. Click **"Launch Interactive Demo"** or **"Instant Guest Demo"**.
3. An isolated demo session is bootstrapped with realistic household data ("Sharma Family Residence, New Delhi"), live ambient AQI, an evaluated Pollution Detective assessment, and sample tracked habits.

---

## 6. Running the Verification & Test Suite

### Unit & Integration Tests (Pytest)
```bash
.\.venv\Scripts\pytest backend/tests -v
```
*(Runs 17 comprehensive tests verifying rule engine, recommendation prioritization, CPCB breakpoints, tenant isolation, and security sanitization).*

### End-to-End System Verification
```bash
.\.venv\Scripts\python scripts/verify_e2e.py
```
*(Exercises all 11 critical user journeys from registration and assessment to GenAI explanation, action tracking, and data deletion).*

### Frontend Production Build & TypeScript Verification
```bash
cd frontend
npm run build
```

---

## 7. Documentation Index

- [Architecture Decision Record & Solution Design](docs/ARCHITECTURE.md)
- [Challenge Alignment Matrix](docs/CHALLENGE_ALIGNMENT.md)
- [Evidence Library & Citations](docs/EVIDENCE_LIBRARY.md)
- [API Contract & Endpoints Specification](docs/API_DOCUMENTATION.md)
- [Database Schema & PostgreSQL Upgrade Path](docs/DATABASE_SCHEMA.md)
- [Threat Model & Security / Privacy Audit](docs/SECURITY_PRIVACY_AUDIT.md)
- [WCAG 2.2 AA Accessibility Audit](docs/ACCESSIBILITY_AUDIT.md)
- [Performance & Efficiency Audit](docs/PERFORMANCE_AUDIT.md)
- [Test Execution Report](docs/TEST_EXECUTION_REPORT.md)
- [Known Limitations & Future Improvements](docs/KNOWN_LIMITATIONS.md)
- [Final Implementation Walkthrough](docs/FINAL_WALKTHROUGH.md)
