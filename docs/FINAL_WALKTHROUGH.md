# Final Implementation Walkthrough: GharKaGod

This document outlines the complete verified end-to-end journey of **GharKaGod** for evaluators and competition judges.

---

## 🌐 Live Production Deployment

- **Production Cloud Run URL:** [https://gharkagod-1054042324015.us-central1.run.app](https://gharkagod-1054042324015.us-central1.run.app)
- **GitHub Repository:** [https://github.com/anushkay91/AQIHome](https://github.com/anushkay91/AQIHome)
- **Interactive Swagger Documentation:** [https://gharkagod-1054042324015.us-central1.run.app/docs](https://gharkagod-1054042324015.us-central1.run.app/docs)
- **Health Verification:** [https://gharkagod-1054042324015.us-central1.run.app/health](https://gharkagod-1054042324015.us-central1.run.app/health)
- **Google Cloud Platform Project:** `smartcity-515403` (Project Number: `1054042324015`, Region: `us-central1`)

---

## 1. Starting the Application

### Terminal 1: Backend API
```bash
.\.venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- Verify health: `http://127.0.0.1:8000/api/v1/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### Terminal 2: Frontend Client
```bash
cd frontend
npm run dev
```
- Open browser: `http://localhost:5173`

---

## 2. End-to-End User Journey Walkthrough

### Step 1: The Landing Page
- Visit `http://localhost:5173`.
- Notice the clear value proposition: *"Protect Your Family from Winter Smog Without Costly Gadgets."*
- Review the **Epistemological Distinction Box**, which clearly segregates:
  1. *Verified Outdoor Ambient Data*
  2. *Deterministic Public-Health Rule Engine*
  3. *GenAI Contextualizer with Strict Safety Bounds*
- Notice the **Scientific Transparency Banner** stating that GharKaGod has no indoor sensors.

### Step 2: Instant Guest Demonstration Mode
- Click the amber button **"Launch Interactive Demo"**.
- An ephemeral guest session is immediately bootstrapped.
- You are redirected to `/dashboard` with preloaded data for the *"Sharma Family Residence, New Delhi"*.

### Step 3: Household Dashboard
- Inspect the top card:
  - **Live Outdoor Smog Level**: Displays real-time NAQI for Delhi (e.g. AQI 342, Very Poor) with PM2.5, PM10, and NO2 concentrations.
  - **Dynamic Ventilation Advisory**: Warns users against opening windows during peak smog hours.
- Notice the **Critical Safety Alert** if any acute combustion hazard is active.
- Review the **Habit Progress KPI** showing completed vs planned actions.

### Step 4: Pollution Detective Assessment (Module A)
- Navigate to `/detective`.
- Fill in the 10-point questionnaire:
  - *Cooking Fuel:* LPG
  - *Cooking Frequency:* Daily Heavy Frying / Tadka
  - *Kitchen Ventilation:* Interior window only
  - *Exhaust:* Indoor fan only (no outdoor ducting)
  - *Smoking:* False
  - *Incense:* Daily multiple times
  - *Mosquito Coils:* Frequent
  - *Winter Heating:* Open coal angithi (or electric blower)
  - *Dampness/Mold:* Visible damp patches
  - *Cleaning Habit:* Heavy scented sprays
- Click **"Analyze Pollution Vectors & Get Recommendations"**.
- View `/detective/results`: The deterministic rule engine groups sources into *Urgent Safety*, *Priority for Review*, and *Potential Concerns*, citing peer-reviewed WHO, EPA, and Lancet studies.

### Step 5: Affordable Action Recommendations (Module B)
- Click **"View Tailored Affordable Actions"** (`/recommendations`).
- Notice interventions categorized into *Zero-Cost (₹0)*, *Under ₹500*, and *Under ₹3,000*:
  - **Never Sleep with Unvented Coal Indoors** (Urgent Safety, ₹0)
  - **Cook with Fitted Lids and Use Back Stove Burners** (High Impact, ₹0)
  - **Wet Mop Floors Daily with Water** (Routine Habit, ₹0)
  - **Corsi-Rosenthal Box Air Purifier** (DIY, ~₹2,400)
- Click **"Explain with GharKaGod AI"** on any card:
  - An accessible modal opens.
  - Gemini GenAI generates a plain-language explanation tailored to your dwelling, explaining the physical mechanism, a practical household tip, and a strict safety boundary.
  - You can enter a custom question (e.g. *"What if I don't have duct tape?"*) and receive a contextualized response.

### Step 6: Impact Tracker (Module C)
- Click **"Mark as Adopted"** on recommended habits.
- Navigate to `/tracker`.
- See the updated completion rate percentage and addressed risk vectors.
- Add reflection notes (e.g. *"Switched to microfiber wet mopping every morning"*).
- Notice the directional environmental impact summary explaining the physical mechanism without inventing fake indoor AQI drops.

### Step 7: Settings & Data Sovereignty
- Navigate to `/settings`.
- Update household profile parameters.
- Test the GDPR/DPDP permanent data deletion by clicking **"Delete My Household Data"**, typing `"delete"`, and verifying that the account and all records are wiped clean from the database.

---

## 3. Verification Commands Summary

```bash
# Run 17 pytest unit & integration tests
.\.venv\Scripts\pytest backend/tests -v

# Run 11 end-to-end verification checks
.\.venv\Scripts\python scripts/verify_e2e.py

# Build production frontend bundle
cd frontend; npm run build
```
