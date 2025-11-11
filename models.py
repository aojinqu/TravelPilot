from pydantic import BaseModel
from typing import List, Optional

# --- 请求体 ---
class TravelInfo(BaseModel):
    destination: str
    departure: str
    num_days: int
    num_people: int
    budget: float
    start_date: str
    end_date: str

class ChatRequest(BaseModel):
    message: str
    vibe: Optional[List[str]] = None
    chat_history: Optional[List[dict]] = None  # (可选) 用于上下文
    travel_info:Optional[TravelInfo] = None
    request_id:Optional[str]

# --- 响应体 (与 UI 完全匹配) ---


class TripOverview(BaseModel):
    title: str
    image_url: str
    location: str
    date_range: str
    description: str

class DailyItinerary(BaseModel):
    start_time:str
    end_time:str
    activity:str
    image_url:str

class DailyItineraryResponse(BaseModel):
    day: int
    itinerary: DailyItinerary

class Flight(BaseModel):
    origin: str
    destination: str
    departure_time: str
    departure_date: str
    arrival_time: str
    arrival_date: str
    duration: str
    airline: str
    nonstop: bool


class Hotel(BaseModel):
    name: str
    image_url: str
    rating: float
    review_count: int
    price_per_night: int
    currency: str
    address:str
    amenities:List[str] = []
    link:str


class PriceSummary(BaseModel):
    flights_total: int
    hotels_total: int
    grand_total: int
    currency: str


class ItineraryResponse(BaseModel):
    ai_response: str
    trip_overview: TripOverview
    daily_itinerary: List[DailyItineraryResponse] = []
    flights: List[Flight]
    hotels: List[Hotel]
    price_summary: PriceSummary


class TravelPlanRequest(BaseModel):
    destination: str
    departure: str
    num_days: int
    num_people: int
    # preferences: str
    budget: float
    # start_date: Optional[str] = None