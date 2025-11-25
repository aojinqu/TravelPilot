from pydantic import BaseModel
from typing import List, Optional
import random

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
    first_complete_flag:int

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
    activity_description:str
    activity_cost:str
    activity_transport:str
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

class SocialMediaRequest(BaseModel):
    destination: str
    tags: Optional[List[str]] = []
    limit: Optional[int] = 12

class SocialMediaPost(BaseModel):
    id: str
    title: str
    description: str
    creator: str
    likes: str
    duration: str
    thumbnail: str
    video_url: str
    tags: List[str]
    platform: str  # "tiktok", "youtube", "instagram"



class SocialMediaResponse(BaseModel):
    posts: List[SocialMediaPost]
    destination: str
    total_count: int

# --- 小红书相关模型 ---
class XiaohongshuRequest(BaseModel):
    destination: str
    preferences: Optional[List[str]] = None

class XiaohongshuPost(BaseModel):
    title: str
    author: str
    link: str
    summary: str
    places_mentioned: List[str] = []
    restaurants_mentioned: List[str] = []
    activities_mentioned: List[str] = []
    key_tips: List[str] = []

class XiaohongshuSummary(BaseModel):
    popular_opinions: str
    key_recommendations: str
    notable_patterns: str
    top_places: List[str] = []
    top_restaurants: List[str] = []
    top_activities: List[str] = []

class XiaohongshuResponse(BaseModel):
    success: bool
    data: dict
    message: str


# --- Mock数据生成函数 ---
def generate_mock_xhs_data(destination: str, preferences: Optional[List[str]] = None) -> dict:
    """Generate mock Xiaohongshu data for testing."""
    
    # 根据目的地生成不同的测试数据
    destination_lower = destination.lower()
    
    # 餐厅数据（英文名字，带百分比 - 基于前5条帖子中的比例：20%, 40%, 60%, 80%, 100%）
    restaurants_hk = [
        {"name": "Yung Kee Restaurant", "percentage": 100.0},  # 5/5 posts
        {"name": "Luk Yu Tea House", "percentage": 80.0},      # 4/5 posts
        {"name": "Tim Ho Wan", "percentage": 80.0},            # 4/5 posts
        {"name": "Lan Fong Yuen", "percentage": 60.0},         # 3/5 posts
        {"name": "Yat Lok Roast Goose", "percentage": 60.0},   # 3/5 posts
        {"name": "Kau Kee Beef Brisket", "percentage": 40.0},  # 2/5 posts
        {"name": "Lin Heung Tea House", "percentage": 40.0},   # 2/5 posts
        {"name": "Mak's Noodle", "percentage": 20.0}           # 1/5 posts
    ]
    restaurants_jp = [
        {"name": "Ichiran Ramen", "percentage": 100.0},        # 5/5 posts
        {"name": "Kani Doraku", "percentage": 80.0},           # 4/5 posts
        {"name": "Daiwa Sushi", "percentage": 80.0},           # 4/5 posts
        {"name": "Tenpura Shinjuku", "percentage": 60.0},      # 3/5 posts
        {"name": "Ginza Kojyu", "percentage": 60.0},           # 3/5 posts
        {"name": "Sukiyabashi Jiro", "percentage": 40.0},      # 2/5 posts
        {"name": "Nabezo Shabu Shabu", "percentage": 40.0},    # 2/5 posts
        {"name": "Tsunahachi", "percentage": 20.0}             # 1/5 posts
    ]
    restaurants_osaka = [
        {"name": "Dotonbori Takoyaki", "percentage": 100.0},   # 5/5 posts
        {"name": "Kushikatsu Daruma", "percentage": 80.0},     # 4/5 posts
        {"name": "Osaka Ohsho", "percentage": 80.0},           # 4/5 posts
        {"name": "Ippudo", "percentage": 60.0},                # 3/5 posts
        {"name": "Kani Doraku Osaka", "percentage": 60.0},     # 3/5 posts
        {"name": "Honke Shibato", "percentage": 40.0},         # 2/5 posts
        {"name": "Okonomiyaki Chibo", "percentage": 40.0},     # 2/5 posts
        {"name": "Kuromon Ichiba Market", "percentage": 20.0}  # 1/5 posts
    ]
    
    # 景点数据（英文名字，带百分比 - 基于前5条帖子中的比例：20%, 40%, 60%, 80%, 100%）
    places_hk = [
        {"name": "Victoria Harbour", "percentage": 100.0},     # 5/5 posts
        {"name": "The Peak", "percentage": 80.0},              # 4/5 posts
        {"name": "Star Ferry", "percentage": 80.0},            # 4/5 posts
        {"name": "Avenue of Stars", "percentage": 60.0},       # 3/5 posts
        {"name": "Hong Kong Disneyland", "percentage": 60.0},  # 3/5 posts
        {"name": "Ocean Park", "percentage": 40.0},            # 2/5 posts
        {"name": "Lantau Island", "percentage": 40.0},         # 2/5 posts
        {"name": "Lamma Island", "percentage": 20.0}           # 1/5 posts
    ]
    places_jp = [
        {"name": "Tokyo Tower", "percentage": 100.0},          # 5/5 posts
        {"name": "Sensō-ji Temple", "percentage": 80.0},       # 4/5 posts
        {"name": "Shinjuku Gyoen", "percentage": 80.0},        # 4/5 posts
        {"name": "Ueno Park", "percentage": 60.0},             # 3/5 posts
        {"name": "Ginza District", "percentage": 60.0},        # 3/5 posts
        {"name": "Shibuya Crossing", "percentage": 40.0},      # 2/5 posts
        {"name": "Harajuku", "percentage": 40.0},              # 2/5 posts
        {"name": "Meiji Shrine", "percentage": 20.0}           # 1/5 posts
    ]
    places_osaka = [
        {"name": "Osaka Castle", "percentage": 100.0},         # 5/5 posts
        {"name": "Dotonbori", "percentage": 80.0},             # 4/5 posts
        {"name": "Tsutenkaku Tower", "percentage": 80.0},      # 4/5 posts
        {"name": "Universal Studios Japan", "percentage": 60.0}, # 3/5 posts
        {"name": "Shinsaibashi", "percentage": 60.0},          # 3/5 posts
        {"name": "Osaka Castle Keep", "percentage": 40.0},     # 2/5 posts
        {"name": "Umeda Sky Building", "percentage": 40.0},    # 2/5 posts
        {"name": "Shitennoji Temple", "percentage": 20.0}      # 1/5 posts
    ]
    
    # 活动数据（根据目的地调整，英文名字，带百分比 - 基于前5条帖子中的比例：20%, 40%, 60%, 80%, 100%）
    activities_hk = [
        {"name": "Victoria Harbour Night Cruise", "percentage": 100.0},  # 5/5 posts
        {"name": "Peak Tram Ride", "percentage": 80.0},                  # 4/5 posts
        {"name": "Star Ferry Experience", "percentage": 80.0},           # 4/5 posts
        {"name": "Cha Chaan Teng Culture Experience", "percentage": 60.0}, # 3/5 posts
        {"name": "Traditional Handicraft Workshop", "percentage": 60.0}, # 3/5 posts
        {"name": "Cultural Tour", "percentage": 40.0},                   # 2/5 posts
        {"name": "Shopping Experience", "percentage": 40.0},             # 2/5 posts
        {"name": "Food Tour", "percentage": 20.0}                        # 1/5 posts
    ]
    activities_jp = [
        {"name": "Onsen Experience", "percentage": 100.0},               # 5/5 posts
        {"name": "Kimono Rental Experience", "percentage": 80.0},        # 4/5 posts
        {"name": "Tea Ceremony", "percentage": 80.0},                    # 4/5 posts
        {"name": "Japanese Cooking Class", "percentage": 60.0},          # 3/5 posts
        {"name": "Traditional Handicraft Workshop", "percentage": 60.0}, # 3/5 posts
        {"name": "Cultural Tour", "percentage": 40.0},                   # 2/5 posts
        {"name": "Night Sightseeing", "percentage": 40.0},               # 2/5 posts
        {"name": "Shopping Experience", "percentage": 20.0}              # 1/5 posts
    ]
    activities_osaka = [
        {"name": "Osaka Food Tour", "percentage": 100.0},                # 5/5 posts
        {"name": "Onsen Experience", "percentage": 80.0},                # 4/5 posts
        {"name": "Kimono Rental Experience", "percentage": 80.0},        # 4/5 posts
        {"name": "Takoyaki Making Class", "percentage": 60.0},           # 3/5 posts
        {"name": "Traditional Handicraft Workshop", "percentage": 60.0}, # 3/5 posts
        {"name": "Cultural Tour", "percentage": 40.0},                   # 2/5 posts
        {"name": "Night Sightseeing", "percentage": 40.0},               # 2/5 posts
        {"name": "Shopping Experience", "percentage": 20.0}              # 1/5 posts
    ]
    
    # 根据目的地选择活动
    if "hong kong" in destination_lower or "香港" in destination:
        activities = activities_hk
    elif "osaka" in destination_lower or "大阪" in destination:
        activities = activities_osaka
    elif "tokyo" in destination_lower or "东京" in destination:
        activities = activities_jp
    else:
        activities = activities_hk
    
    # 根据目的地选择数据
    if "hong kong" in destination_lower or "香港" in destination:
        restaurants = restaurants_hk
        places = places_hk
    elif "osaka" in destination_lower or "大阪" in destination:
        restaurants = restaurants_osaka
        places = places_osaka
    elif "tokyo" in destination_lower or "东京" in destination:
        restaurants = restaurants_jp
        places = places_jp
    else:
        # 默认使用香港数据
        restaurants = restaurants_hk
        places = places_hk
    
    # 根据 preferences 决定返回哪些数据
    pref_lower = [p.lower() for p in (preferences or [])]
    
    # 构建关键词
    if preferences and len(preferences) > 0:
        keyword = f"{destination} {' '.join(preferences)}"
    else:
        keyword = destination
    
    # 根据 preference 类型选择数据，并按百分比降序排列
    top_restaurants = []
    top_places = []
    top_activities = []
    
    if any(p in pref_lower for p in ['food']):
        selected = random.sample(restaurants, min(6, len(restaurants)))
        top_restaurants = sorted(selected, key=lambda x: x['percentage'], reverse=True)
    
    if any(p in pref_lower for p in ['adventure', 'culture', 'nature', 'history', 'shopping', 'nightlife', 'beach', 'mountain', 'city']):
        selected = random.sample(places, min(6, len(places)))
        top_places = sorted(selected, key=lambda x: x['percentage'], reverse=True)
    
    if any(p in pref_lower for p in ['relaxation', 'family', 'romance']):
        selected = random.sample(activities, min(6, len(activities)))
        top_activities = sorted(selected, key=lambda x: x['percentage'], reverse=True)
    
    # 如果没有 preferences，返回所有类型的数据
    if not preferences or len(preferences) == 0:
        selected_restaurants = random.sample(restaurants, min(5, len(restaurants)))
        top_restaurants = sorted(selected_restaurants, key=lambda x: x['percentage'], reverse=True)
        selected_places = random.sample(places, min(5, len(places)))
        top_places = sorted(selected_places, key=lambda x: x['percentage'], reverse=True)
        selected_activities = random.sample(activities, min(4, len(activities)))
        top_activities = sorted(selected_activities, key=lambda x: x['percentage'], reverse=True)
    
    return {
        "search_keyword": keyword,
        "destination": destination,
        "preferences": preferences or [],
        "posts": [],  # 不需要帖子数据
        "summary": {
            "popular_opinions": f"Based on Xiaohongshu user reviews, {destination} offers amazing experiences for travelers. Many users highly recommend exploring the local culture and cuisine.",
            "key_recommendations": f"Top recommendations for {destination} include must-visit restaurants, iconic landmarks, and unique cultural experiences that showcase the best of the destination.",
            "notable_patterns": "Common themes across posts include authentic local experiences, hidden gems, and popular tourist spots that are worth visiting.",
            "top_places": top_places,
            "top_restaurants": top_restaurants,
            "top_activities": top_activities
        }
    }
