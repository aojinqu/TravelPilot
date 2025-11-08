import re
import asyncio
from textwrap import dedent
from agno.agent import Agent
from agno.tools.mcp import MultiMCPTools
from agno.tools.googlesearch import GoogleSearchTools
from agno.models.openai import OpenAIChat
from icalendar import Calendar, Event
from datetime import datetime, timedelta
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional


app = FastAPI(title="MCP AI Travel Planner API")

# 配置 CORS，允许 React 前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React 默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_ics_content(plan_text: str, start_date: datetime = None) -> bytes:
    """
    Generate an ICS calendar file from a travel itinerary text.

    Args:
        plan_text: The travel itinerary text
        start_date: Optional start date for the itinerary (defaults to today)

    Returns:
        bytes: The ICS file content as bytes
    """
    cal = Calendar()
    cal.add('prodid','-//AI Travel Planner//github.com//')
    cal.add('version', '2.0')

    if start_date is None:
        start_date = datetime.today()

    # Split the plan into days
    day_pattern = re.compile(r'Day (\d+)[:\s]+(.*?)(?=Day \d+|$)', re.DOTALL)
    days = day_pattern.findall(plan_text)

    if not days:  # If no day pattern found, create a single all-day event with the entire content
        event = Event()
        event.add('summary', "Travel Itinerary")
        event.add('description', plan_text)
        event.add('dtstart', start_date.date())
        event.add('dtend', start_date.date())
        event.add("dtstamp", datetime.now())
        cal.add_component(event)
    else:
        # Process each day
        for day_num, day_content in days:
            day_num = int(day_num)
            current_date = start_date + timedelta(days=day_num - 1)

            # Create a single event for the entire day
            event = Event()
            event.add('summary', f"Day {day_num} Itinerary")
            event.add('description', day_content.strip())

            # Make it an all-day event
            event.add('dtstart', current_date.date())
            event.add('dtend', current_date.date())
            event.add("dtstamp", datetime.now())
            cal.add_component(event)

    return cal.to_ical()


async def run_mcp_travel_planner(destination: str, num_days: int, num_people: int, budget: int, openai_key: str, google_maps_key: str):
    """Run the MCP-based travel planner agent with real-time data access."""
    # for test
    print("@@@@@@@@@@@@@@@@  Start  @@@@@@@@@@@@@@@@@@@@@@@@")
    try:
        # Set Google Maps API key environment variable
        os.environ["GOOGLE_MAPS_API_KEY"] = google_maps_key
        # Initialize MCPTools with Airbnb MCP
        mcp_tools = MultiMCPTools(
            [
                #Windows
                "cmd /c npx -y @openbnb/mcp-server-airbnb --ignore-robots-txt",
                "cmd /c npx -y @gongrzhe/server-travelplanner-mcp",
                # Linux
                #"npx -y @openbnb/mcp-server-airbnb --ignore-robots-txt",
                #"npx @gongrzhe/server-travelplanner-mcp",
            ],
            env={
                "GOOGLE_MAPS_API_KEY": google_maps_key,
            },
            timeout_seconds=100,
        )

        # Connect to Airbnb MCP server
        await mcp_tools.connect()
        

        travel_planner = Agent(
            name="Travel Planner",
            model=OpenAIChat(
            id="openai/gpt-4o", 
            api_key=openai_key,
            base_url="https://openrouter.ai/api/v1"
            ),
            tools=[mcp_tools, GoogleSearchTools()],
            markdown=True
        )
        print("Success create Agent")

        # Create the planning prompt
        prompt = f"""
        You are a professional travel consultant AI that creates highly detailed travel itineraries directly without asking questions.

        You have access to:
        🏨 Airbnb listings with real availability and current pricing
        🗺️ Google Maps MCP for location services, directions, distance calculations, and local navigation
        🔍 Web search capabilities for current information.

        IMMEDIATELY create an extremely detailed and comprehensive travel itinerary for:

        **Destination:** {destination}
        **Duration:** {num_days} days
        **People:** {num_people} 
        **Total Budget:** ${budget} HKD

        DO NOT ask any questions. Generate a complete, highly detailed itinerary now using all available tools.

        **CRITICAL REQUIREMENTS:**
        - Use Google Maps MCP to calculate distances and travel times between ALL locations
        - Include specific addresses for every location, restaurant, and attraction
        - Calculate precise costs for transportation between each location
        - Include opening hours, ticket prices, and best visiting times for all attractions

        **REQUIRED OUTPUT FORMAT:**
        1. **Trip Overview** - Summary about this trip including main scenic spots.
        2. **Accommodation** - 3 specific Airbnb options with real prices, addresses, amenities, links
        3. **Day-by-Day Itinerary** - Extremely detailed schedule with:
           - For each day, include:
             - Start and end times for each activity (e.g., 12:00am-1:15am)
             - Activity names and descriptions with detailed addresses
             - Cost breakdown for each activity (e.g., cost: $100)
             - Include exact distances and travel times between locations (use Google Maps MCP)(e.g., car:15min)
             - Mention the opening hours, ticket prices, and the best visiting times for each location
           - Continue this format for each day of the trip (e.g., Day 1, Day 2, etc.)

        Use Airbnb MCP for real accommodation data, Google Maps MCP for ALL distance calculations and location services, and web search for current information.
        
        """

        response = await travel_planner.arun(prompt)
        # test
        print(response.content)

        return response.content

    finally:
        await mcp_tools.close()

# Request models
class TravelPlanRequest(BaseModel):
    destination: str
    departure: str
    num_days: int
    num_people: int
    # preferences: str
    budget: float
    # start_date: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "MCP AI Travel Planner API"}


async def generate_itinerary(request: TravelPlanRequest):
    """
    生成旅行行程
    """
    openai_key=os.getenv("OPENROUTER_API_KEY")
    googlemap_key=os.getenv("GOOGLE_MAP_KEY")
    try:
        itinerary = await run_mcp_travel_planner(
            destination=request.destination,
            num_days=request.num_days,
            num_people=request.num_people,
            budget=request.budget,
            openai_key=openai_key,
            google_maps_key=googlemap_key
            #openai_key=request.openai_key,
            #google_maps_key=request.google_maps_key
        )
        
        return {
            "success": True,
            "itinerary": itinerary,
            "message": "行程生成成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成行程时出错: {str(e)}")


@app.post("/api/download-calendar")
async def download_calendar(request: dict):
    """
    生成并返回 ICS 日历文件
    """
    try:
        itinerary_text = request.get("itinerary")
        start_date_str = request.get("start_date")
        
        if not itinerary_text:
            raise HTTPException(status_code=400, detail="缺少行程内容")
        
        # 解析开始日期
        start_date = None
        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            except:
                start_date = datetime.today()
        else:
            start_date = datetime.today()
        
        ics_content = generate_ics_content(itinerary_text, start_date)
        
        from fastapi.responses import Response
        return Response(
            content=ics_content,
            media_type="text/calendar",
            headers={
                "Content-Disposition": "attachment; filename=travel_itinerary.ics"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成日历文件时出错: {str(e)}")




# --- 请求体 ---
class TravelInfo(BaseModel):
    destination: str
    departure: str
    num_days: int
    num_people: int
    budget: float

class ChatRequest(BaseModel):
    message: str
    vibe: Optional[List[str]] = None
    chat_history: Optional[List[dict]] = None  # (可选) 用于上下文
    travel_info:Optional[TravelInfo] = None

# --- 响应体 (与 UI 完全匹配) ---


class TripOverview(BaseModel):
    title: str
    image_url: str
    location: str
    country: str
    date_range: str
    description: str


class Flight(BaseModel):
    origin: str
    destination: str
    departure_time: str
    departure_date: str
    arrival_time: str
    arrival_date: str
    duration: str
    airline: str
    airline_logo_url: str  # UI 上的航空公司 Logo
    nonstop: bool


class Hotel(BaseModel):
    name: str
    image_url: str
    rating: float
    review_count: int
    price_per_night: int
    currency: str


class PriceSummary(BaseModel):
    flights_total: int
    hotels_total: int
    grand_total: int
    currency: str


class ItineraryResponse(BaseModel):
    ai_response: str
    trip_overview: TripOverview
    flights: List[Flight]
    hotels: List[Hotel]
    price_summary: PriceSummary


# -----------------------------------------------
# 4. 创建 API 终结点 (Endpoint)
# -----------------------------------------------
@app.post("/api/chat", response_model=ItineraryResponse)
async def handle_chat(request: ChatRequest):

    print(f"✅ 收到前端消息: {request.message}")
    if request.vibe:
        print(f"✅ 收到 Vibe: {request.vibe}")
    if request.travel_info:
        print(f"✅ 收到 Travel Info: {request.travel_info}")        

    # --- 这是模拟数据 (Mock Data) ---
    # 你的 AI (Gemini / GPT) 和 RAG 流程最终会生成这些数据。
    # 现在，我们先返回图片中的内容。

    mock_overview = TripOverview(
        title="Winter Feasts in Osaka's Food Paradise",
        image_url="https://example.com/images/osaka_castle.jpg",  # 替换为真实的图片 URL
        location="Osaka",
        country="Japan",
        date_range="Feb 6 - 12",
        description="Dive into thrills at Universal Studios Japan, silver street food and noon at Dotonbori, and most sacred door at Na..."
    )

    mock_flights = [
        Flight(
            origin="Hong Kong",
            destination="Osaka",
            departure_time="14:55",
            departure_date="Feb 6",
            arrival_time="19:20",
            arrival_date="Feb 6",
            duration="3h25m",
            airline="Cathay Pacific",
            airline_logo_url="https://example.com/logo/cx.png",  # 替换为 Logo URL
            nonstop=True
        ),
        Flight(
            origin="Osaka",
            destination="Hong Kong",
            departure_time="09:55",
            departure_date="Feb 12",
            arrival_time="13:20",
            arrival_date="Feb 12",
            duration="4h25m",
            airline="HK Express",
            airline_logo_url="https://example.com/logo/hk.png",  # 替换为 Logo URL
            nonstop=True
        )
    ]

    mock_hotels = [
        Hotel(
            name="The Royal Park Hotel Iconic Osaka Midosuji",
            image_url="https://example.com/images/hotel_room.jpg",  # 替换为真实的图片 URL
            rating=4.7,
            review_count=1234,
            price_per_night=37,  # (221 / 6 nights ≈ 37 per night)
            currency="SGD"
        )
    ]

    mock_price = PriceSummary(
        flights_total=332,
        hotels_total=221,
        grand_total=554,  # 332 + 221
        currency="SGD"
    )

    mock_ai_response = "Osaka in February - plum blossoms and amazing winter comfort food! Here are some incredible experiences waiting for you in Japan's kitchen."
    
    travel_info=request.travel_info

    print(travel_info)

    response = await generate_itinerary(
        TravelPlanRequest(
            destination=travel_info.destination,
            departure=travel_info.departure,
            num_days=travel_info.num_days, 
            num_people=travel_info.num_people, 
            budget=travel_info.budget
        )
    )

    # --- 返回完整的响应 ---
    return ItineraryResponse(
        ai_response=response.get("itinerary"),
        trip_overview=mock_overview,
        flights=mock_flights,
        hotels=mock_hotels,
        price_summary=mock_price
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

