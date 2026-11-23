# Challenge Alignment Matrix: GharKaGod

## 1. Challenge Context
**Challenge Prompt:**
> "Create a GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution. The application should suggest low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to their location and lifestyle, while clearly explaining the direct impact of their choices."

## 2. Approved Product Scope
- **Product Name:** GharKaGod (घर का गॉड / Protector of the Home)
- **Product Category:** GenAI-Powered Household Indoor Air Pollution SaaS.
- **Three Core Modules:**
  1. **Pollution Detective:** Rule-informed household assessment identifying sources without fabricated indoor sensor data; fetches verified outdoor AQI with timestamps, units, and uncertainty flags.
  2. **Affordable Action Recommendations:** Prioritized, low-cost/no-cost interventions personalized via Gemini, explaining why actions matter, limitations, and evidence links.
  3. **Impact Tracker:** Real persisted habit tracking, completion progress, before-and-after comparison, and directional evidence disclaimers.
- **Explicit Exclusions:**
  - No hardware/IoT dependencies or simulated indoor sensor feeds.
  - No separate carbon footprint calculator or generic outdoor event planners.
  - No medical diagnostic claims or absolute disease prevention promises.
  - No fabricated numerical indoor AQI drops (e.g., "AQI reduced by 42 points").

## 3. Alignment Matrix

| Challenge Criterion | GharKaGod Implementation | Module | Verification Method |
| :--- | :--- | :--- | :--- |
| **Navigate Severe Smog** | Real-time outdoor AQI integration via Open-Meteo / WAQI with severe smog alerts and ventilation precautions. | Pollution Detective & Recommendations | Unit/Integration tests with live/mocked AQI conditions. |
| **Indoor Air Quality Hacks** | Deterministic rule engine triggers vetted low-cost mitigations: wet mopping, pot lid use, cross-ventilation timing, exhaust outdoor ducting, DIY air filtration guidance (Corsi-Rosenthal box). | Affordable Action Recommendations | Rule engine unit tests; Evidence citations. |
| **Low-Emission Daily Routines** | Cleaner cooking practices, shifting peak-pollution tasks, minimizing incense/camphor/candles, avoiding unvented biomass/kerosene indoor burning. | Affordable Action Recommendations & Impact Tracker | Habit change tracking; Recommendation pipeline tests. |
| **Tailored to Location & Lifestyle** | Considers city/region outdoor smog level, cooking fuel (LPG, induction, biomass), kitchen structure, vulnerability (elderly, infants, respiratory conditions), and budget (₹0 to modest). | Pollution Detective Form & Profile | Persona tests; Multi-scenario assessment tests. |
| **Explain Direct Impact of Choices** | Gemini GenAI explains qualitative physical mechanisms (e.g., particulate trapping, source reduction) in plain vernacular language with explicit scientific honesty. | GenAI Recommendation Explanation Pipeline | Structured JSON validation; Prompt injection tests; Safety filters. |
| **Scientific Honesty & Trust** | Strict enforcement: No indoor sensor claims, clear disclaimers, authoritative source links (WHO 2021, EPA, MoHFW, CPCB). | System-Wide Architecture | Automated assertions in tests; Security & Accuracy audit. |
