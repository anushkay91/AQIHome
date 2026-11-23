from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas import OutdoorAqiContext
from backend.app.services.environmental_service import fetch_outdoor_aqi

router = APIRouter(prefix="/environmental", tags=["Environmental Air Quality"])

@router.get("/outdoor-aqi", response_model=OutdoorAqiContext)
async def get_outdoor_aqi(
    city: str = Query("New Delhi", description="City name"),
    latitude: Optional[float] = Query(None, description="Optional precise latitude"),
    longitude: Optional[float] = Query(None, description="Optional precise longitude")
):
    """
    Fetches real-time outdoor air quality data from Open-Meteo Air Quality API
    with CPCB NAQI calculation, unit formatting, timestamps, and uncertainty notes.
    """
    return await fetch_outdoor_aqi(city=city, lat=latitude, lon=longitude)
