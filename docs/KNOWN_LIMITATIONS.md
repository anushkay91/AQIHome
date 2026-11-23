# Known Limitations & Future Improvements: GharKaGod

## 1. Scientific & Environmental Boundaries

1. **Absence of Real-Time Indoor Sensors:**
   - **Boundary:** By design and PromptWar challenge rules, GharKaGod has zero indoor environmental sensors. The application cannot detect sudden transient spikes (e.g. burning toast, incense lit 5 minutes ago) unless reported by the user.
   - **Mitigation:** Transparent disclaimer banners appear on every screen, repeatedly reminding users that assessments evaluate behavioral risk patterns rather than live indoor concentrations.

2. **Outdoor Ambient AQI Spatial Resolution:**
   - **Boundary:** Outdoor AQI is fetched from regional atmospheric monitoring stations (Open-Meteo European Atmosphere Monitoring Service / CPCB stations). A monitoring station 5–10 km away may differ slightly from a home located adjacent to a high-traffic highway or industrial kiln.
   - **Future Improvement:** Incorporate hyper-local satellite aerosol optical depth (AOD) re-analysis models for sub-kilometer neighborhood downscaling.

---

## 2. Technical & Feature Roadmaps

1. **Community Volunteer Cohort Administration:**
   - **Current Scope:** Volunteers can evaluate households using the guest demo or create individual accounts for families.
   - **Future Improvement:** Implement a dedicated "Community Volunteer" role allowing trained field workers to manage 50+ household profiles in an informal settlement or apartment association with bulk export reports.

2. **Multilingual Audio Guidance:**
   - **Current Scope:** Text-based multilingual support for English, Hindi, and Hinglish.
   - **Future Improvement:** Integrate Web Speech API text-to-speech for vernacular audio guidance to assist families with lower written literacy levels.

3. **Offline Progressive Web App (PWA) Mode:**
   - **Current Scope:** Client-side SPA with offline-friendly styles.
   - **Future Improvement:** Add a Service Worker cache to enable full questionnaire completion and offline habit logging even during complete cellular network outages.
