import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple
import httpx
from backend.app.config import settings
from backend.app.schemas import OutdoorAqiContext

# Well-known coordinates for prominent Indian urban hubs affected by winter smog
KNOWN_CITIES: Dict[str, Tuple[float, float, str]] = {
    "delhi": (28.6139, 77.2090, "Delhi (NCR)"),
    "new delhi": (28.6139, 77.2090, "New Delhi (NCR)"),
    "gurugram": (28.4595, 77.0266, "Gurugram, Haryana"),
    "noida": (28.5355, 77.3910, "Noida, Uttar Pradesh"),
    "ghaziabad": (28.6692, 77.4538, "Ghaziabad, Uttar Pradesh"),
    "faridabad": (28.4089, 77.3178, "Faridabad, Haryana"),
    "patna": (25.5941, 85.1376, "Patna, Bihar"),
    "lucknow": (26.8467, 80.9462, "Lucknow, Uttar Pradesh"),
    "kanpur": (26.4499, 80.3319, "Kanpur, Uttar Pradesh"),
    "kolkata": (22.5726, 88.3639, "Kolkata, West Bengal"),
    "mumbai": (19.0760, 72.8777, "Mumbai, Maharashtra"),
    "jaipur": (26.9124, 75.7873, "Jaipur, Rajasthan"),
    "chandigarh": (30.7333, 76.7794, "Chandigarh, Punjab/Haryana"),
    "bengaluru": (12.9716, 77.5946, "Bengaluru, Karnataka"),
    "chennai": (13.0827, 80.2707, "Chennai, Tamil Nadu"),
    "hyderabad": (17.3850, 78.4867, "Hyderabad, Telangana"),
    "pune": (18.5204, 73.8567, "Pune, Maharashtra"),
    "ahmedabad": (23.0225, 72.5714, "Ahmedabad, Gujarat"),
}

# In-memory thread-safe cache: (city_key) -> (timestamp, OutdoorAqiContext)
_aqi_cache: Dict[str, Tuple[float, OutdoorAqiContext]] = {}

def calculate_cpcb_aqi(pm25: float, pm10: float) -> Tuple[int, str]:
    """
    Computes Indian CPCB National Air Quality Index (NAQI) sub-index for PM2.5 and PM10.
    Standard breakpoints (CPCB 2015):
    Good (0-50): PM2.5 0-30, PM10 0-50
    Satisfactory (51-100): PM2.5 31-60, PM10 51-100
    Moderate (101-200): PM2.5 61-90, PM10 101-250
    Poor (201-300): PM2.5 91-120, PM10 251-350
    Very Poor (301-400): PM2.5 121-250, PM10 351-430
    Severe (401-500): PM2.5 250+, PM10 430+
    """
    def sub_index(val: float, b_lo: float, b_hi: float, i_lo: int, i_hi: int) -> float:
        if b_hi == b_lo:
            return float(i_lo)
        return ((i_hi - i_lo) / (b_hi - b_lo)) * (val - b_lo) + i_lo

    # PM2.5 sub-index
    if pm25 <= 30:
        i_pm25 = sub_index(pm25, 0, 30, 0, 50)
    elif pm25 <= 60:
        i_pm25 = sub_index(pm25, 31, 60, 51, 100)
    elif pm25 <= 90:
        i_pm25 = sub_index(pm25, 61, 90, 101, 200)
    elif pm25 <= 120:
        i_pm25 = sub_index(pm25, 91, 120, 201, 300)
    elif pm25 <= 250:
        i_pm25 = sub_index(pm25, 121, 250, 301, 400)
    else:
        i_pm25 = sub_index(pm25, 251, 400, 401, 500)

    # PM10 sub-index
    if pm10 <= 50:
        i_pm10 = sub_index(pm10, 0, 50, 0, 50)
    elif pm10 <= 100:
        i_pm10 = sub_index(pm10, 51, 100, 51, 100)
    elif pm10 <= 250:
        i_pm10 = sub_index(pm10, 101, 250, 101, 200)
    elif pm10 <= 350:
        i_pm10 = sub_index(pm10, 251, 350, 201, 300)
    elif pm10 <= 430:
        i_pm10 = sub_index(pm10, 351, 430, 301, 400)
    else:
        i_pm10 = sub_index(pm10, 431, 500, 401, 500)

    aqi_val = int(max(i_pm25, i_pm10))
    aqi_val = min(500, max(1, aqi_val))

    if aqi_val <= 50:
        category = "Good"
    elif aqi_val <= 100:
        category = "Satisfactory"
    elif aqi_val <= 200:
        category = "Moderate"
    elif aqi_val <= 300:
        category = "Poor"
    elif aqi_val <= 400:
        category = "Very Poor"
    else:
        category = "Severe"

    return aqi_val, category

def get_ventilation_guidance(aqi: int, category: str) -> str:
    if aqi >= 300:
        return (
            "CRITICAL: Outdoor air is Very Poor to Severe. Keep doors and windows tightly closed. "
            "Do NOT open windows for cross-ventilation during smog hours. Rely on localized exhaust only when actively cooking."
        )
    elif aqi >= 150:
        return (
            "CAUTION: Outdoor air is Unhealthy/Moderate. Limit window opening to 15-20 minute intervals "
            "during mid-afternoon (1:00 PM - 3:30 PM) when thermal inversion disperses ground-level smog."
        )
    else:
        return (
            "FAVORABLE: Outdoor AQI is acceptable. Moderate daytime cross-ventilation is recommended "
            "to purge indoor moisture and cooking odors."
        )

async def fetch_outdoor_aqi(city: str, lat: Optional[float] = None, lon: Optional[float] = None) -> OutdoorAqiContext:
    """
    Fetches real-time outdoor air quality from Open-Meteo Air Quality API.
    Falls back gracefully to cached or defensible baseline data with transparent uncertainty notes.
    """
    city_normalized = city.strip().lower()
    now_ts = time.time()

    # 1. Check in-memory cache
    if city_normalized in _aqi_cache:
        cached_ts, cached_ctx = _aqi_cache[city_normalized]
        if (now_ts - cached_ts) < settings.AQI_CACHE_TTL_SECONDS:
            return cached_ctx

    # 2. Determine target coordinates
    target_lat = lat
    target_lon = lon
    display_name = city.title()

    if target_lat is None or target_lon is None:
        if city_normalized in KNOWN_CITIES:
            target_lat, target_lon, display_name = KNOWN_CITIES[city_normalized]
        else:
            # Default to Delhi coordinates if unknown city
            target_lat, target_lon, _ = KNOWN_CITIES["delhi"]
            display_name = f"{city.title()} (Regional Proxy: Indo-Gangetic Plain)"

    # 3. Call Open-Meteo Air Quality API
    params = {
        "latitude": target_lat,
        "longitude": target_lon,
        "current": ["pm2_5", "pm10", "nitrogen_dioxide"],
        "timezone": "auto"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(settings.OPEN_METEO_AQI_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                pm25 = float(current.get("pm2_5", 85.0))
                pm10 = float(current.get("pm10", 160.0))
                no2 = float(current.get("nitrogen_dioxide", 35.0)) if current.get("nitrogen_dioxide") is not None else None
                obs_time = current.get("time", datetime.now(timezone.utc).isoformat())

                aqi_val, aqi_cat = calculate_cpcb_aqi(pm25, pm10)
                advisory = get_ventilation_guidance(aqi_val, aqi_cat)

                ctx = OutdoorAqiContext(
                    city=display_name,
                    aqi=aqi_val,
                    aqi_category=aqi_cat,
                    pm25=round(pm25, 1),
                    pm10=round(pm10, 1),
                    no2=round(no2, 1) if no2 else None,
                    source="Open-Meteo Atmosphere Monitoring / CPCB NAQI Breakpoints",
                    timestamp=obs_time,
                    is_live=True,
                    uncertainty_note=(
                        "Live ambient measurement at regional monitoring station. "
                        "Note: Outdoor ambient air is NOT equal to indoor air quality."
                    ),
                    ventilation_advisory=advisory
                )
                _aqi_cache[city_normalized] = (now_ts, ctx)
                return ctx
    except Exception:
        pass

    # 4. Graceful Fallback if API fails or network unavailable
    # Realistic seasonal winter smog baseline with explicit non-live flag
    pm25_fallback = 115.0
    pm10_fallback = 220.0
    aqi_val, aqi_cat = calculate_cpcb_aqi(pm25_fallback, pm10_fallback)
    advisory = get_ventilation_guidance(aqi_val, aqi_cat)

    fallback_ctx = OutdoorAqiContext(
        city=display_name,
        aqi=aqi_val,
        aqi_category=aqi_cat,
        pm25=pm25_fallback,
        pm10=pm10_fallback,
        no2=45.0,
        source="Seasonal Baseline Model (Fallback - Provider Offline)",
        timestamp=datetime.now(timezone.utc).isoformat(),
        is_live=False,
        uncertainty_note=(
            "Estimated regional winter baseline due to temporary external data provider outage. "
            "Never assume this reflects exact indoor air quality."
        ),
        ventilation_advisory=advisory
    )
    return fallback_ctx
