import asyncio
import json
import os
import re
from datetime import datetime
from datetime import timedelta
from typing import Optional

import certifi
import httpx
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.googlesearch import GoogleSearchTools
from agno.tools.mcp import MultiMCPTools
from dotenv import load_dotenv
from fastapi import Depends, Header
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from icalendar import Calendar, Event

from database.auth import router as auth_router
from database.supabase_client import SupabaseClient
from flight_service import SimpleFlightService
from google_maps_utils import get_place_photo_url
from models import (
    ChatRequest,
    TripOverview,
    DailyItinerary,
    Flight,
    Hotel,
    PriceSummary,
    ItineraryResponse,
    TravelPlanRequest, SocialMediaPost, SocialMediaResponse, SocialMediaRequest
)
from social_service import YouTubeService, GoogleSearchService


def configure_ssl():
    """配置 SSL 证书环境"""
    cert_path = certifi.where()
    os.environ['SSL_CERT_FILE'] = cert_path
    os.environ['REQUESTS_CA_BUNDLE'] = cert_path
    os.environ['CURL_CA_BUNDLE'] = cert_path
    # 强制设置代理环境变量
    os.environ['HTTP_PROXY'] = "http://127.0.0.1:15236"
    os.environ['HTTPS_PROXY'] = "http://127.0.0.1:15236"
    print(f"🔐 SSL 证书已配置: {cert_path}")

temp_output=""

load_dotenv()
# configure_ssl() # 解决 Mac Python SSL证书环境配置问题
# 初始化Supabase客户端
supabase_client = SupabaseClient()

app = FastAPI(title="MCP AI Travel Planner API")

# 配置 CORS，允许 React 前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React 默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 注册认证路由
app.include_router(auth_router)


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
    cal.add('prodid', '-//AI Travel Planner//github.com//')
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


class ProgressManager:
    def __init__(self):
        self.progress_queues = {}

    async def add_progress(self, request_id: str, message: str, progress_type: str = "info"):
        """添加进度消息"""
        if request_id in self.progress_queues:
            progress_data = {
                "type": progress_type,
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
            await self.progress_queues[request_id].put(progress_data)

    async def get_progress_stream(self, request_id: str):
        """获取进度流"""
        self.progress_queues[request_id] = asyncio.Queue()
        try:
            while True:
                progress_data = await self.progress_queues[request_id].get()
                yield f"data: {json.dumps(progress_data)}\n\n"
        except asyncio.CancelledError:
            del self.progress_queues[request_id]


progress_manager = ProgressManager()


def extract_tags(text: str, destination: str):
    """
    从文本中提取标签
    """
    text_lower = text.lower()
    destination_lower = destination.lower()

    tags = [destination_lower, "travel"]

    # 常见旅行标签
    travel_keywords = {
        "food": ["food", "restaurant", "eat", "dining", "cuisine", "meal"],
        "attraction": ["attraction", "landmark", "sight", "tour", "visit"],
        "adventure": ["adventure", "hiking", "explore", "outdoor"],
        "culture": ["culture", "historical", "museum", "temple", "shrine"],
        "shopping": ["shopping", "market", "mall", "store"],
        "nightlife": ["nightlife", "bar", "club", "night", "party"],
        "budget": ["budget", "cheap", "affordable", "save"],
        "luxury": ["luxury", "premium", "expensive", "luxurious"]
    }

    for category, keywords in travel_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            tags.append(category)

    return list(set(tags))[:5]  # 去重并限制数量


@app.post("/api/social-media-content", response_model=SocialMediaResponse)
async def get_social_media_content(request: SocialMediaRequest):
    """
    获取真实的社交媒体旅行内容
    """
    try:
        google_api_key = os.getenv("GOOGLE_MAP_KEY")  # 使用你已有的 Google API Key
        posts = []

        # 1. 使用 YouTube Data API 获取视频
        youtube_service = YouTubeService(google_api_key)
        # configure_ssl()
        youtube_videos = await youtube_service.search_travel_videos(
            destination=request.destination,
            categorytags=request.tags,
            max_results=request.limit // 4
        )

        # 转换 YouTube 视频格式
        for i, video in enumerate(youtube_videos):
            post = SocialMediaPost(
                id=f"youtube_{video['video_id']}",
                title=video['title'],
                description=video['description'][:200] + "..." if len(video['description']) > 200 else video[
                    'description'],
                creator=video['channel_title'],
                likes=video['likes'],
                duration=video['duration'],
                thumbnail=video['thumbnail'],
                video_url=f"https://www.youtube.com/watch?v={video['video_id']}",
                tags=extract_tags(video['title'] + " " + video['description'], request.destination),
                platform="youtube"
            )
            posts.append(post)

        search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
        if search_engine_id and len(posts) < request.limit:
            google_search = GoogleSearchService(google_api_key, search_engine_id)
            # configure_ssl()
            # 尝试搜索特定网站的内容
            site_results = await google_search.search_travel_content(
                destination=request.destination,
                categorytags=request.tags,
                max_results=request.limit - len(posts)
            )

            for i, result in enumerate(site_results):
                # 确保有缩略图
                thumbnail = result['thumbnail']
                if not thumbnail:
                    thumbnail = f"https://via.placeholder.com/200x350/6A5ACD/FFFFFF?text={request.destination}"

                post = SocialMediaPost(
                    id=f"{result['platform']}_{hash(result['link'])}",
                    title=result['title'],
                    description=result['snippet'],
                    creator=result['platform'].title(),
                    likes="1K+",
                    duration="2:00",
                    thumbnail=thumbnail,
                    video_url=result['link'],
                    tags=extract_tags(result['title'] + " " + result['snippet'], request.destination),
                    platform=result['platform']
                )
                posts.append(post)

            # 如果还不够，搜索一般旅行内容
            if len(posts) < request.limit:
                general_results = await google_search.search_general_travel_content(
                    destination=request.destination,
                    max_results=request.limit - len(posts)
                )

                for result in general_results:
                    thumbnail = result['thumbnail']
                    if not thumbnail:
                        thumbnail = f"https://via.placeholder.com/200x350/4ECDC4/FFFFFF?text={request.destination}"

                    post = SocialMediaPost(
                        id=f"web_{hash(result['link'])}",
                        title=result['title'],
                        description=result['snippet'],
                        creator="Travel Blogger",
                        likes="500+",
                        duration="3:00",
                        thumbnail=thumbnail,
                        video_url=result['link'],
                        tags=extract_tags(result['title'] + " " + result['snippet'], request.destination),
                        platform=result['platform']
                    )
                    posts.append(post)

        # 3. 如果真实API没有返回足够内容，用模拟数据补充
        if len(posts) < request.limit:
            fallback_posts = get_fallback_content(request.destination, request.limit - len(posts)).posts
            posts.extend(fallback_posts)

        return SocialMediaResponse(
            posts=posts[:request.limit],
            destination=request.destination,
            total_count=len(posts)
        )

    except Exception as e:
        print(f"获取社交媒体内容失败: {e}")
        # 返回降级内容
        return get_fallback_content(request.destination, request.limit)


# 更新降级内容生成函数
def get_fallback_content(destination: str, limit: int):
    import random

    themes = [
        {
            "title": f"Ultimate {destination} Travel Guide",
            "description": f"Everything you need to know before visiting {destination} - from must-see attractions to hidden gems!",
            "tags": ["guide", "tips", "itinerary"]
        },
        {
            "title": f"{destination} Food Tour",
            "description": f"Exploring the best local cuisine and street food in {destination}. Don't miss these delicious dishes!",
            "tags": ["food", "cuisine", "streetfood"]
        },
        {
            "title": f"Hidden Gems in {destination}",
            "description": f"Discover secret spots and local favorites that most tourists never find in {destination}.",
            "tags": ["hidden", "local", "secret"]
        },
        {
            "title": f"{destination} on a Budget",
            "description": f"How to experience the best of {destination} without breaking the bank. Money-saving tips included!",
            "tags": ["budget", "cheap", "affordable"]
        },
        {
            "title": f"{destination} Nightlife Experience",
            "description": f"From cozy bars to vibrant clubs - experience {destination}'s amazing nightlife scene.",
            "tags": ["nightlife", "bars", "entertainment"]
        },
        {
            "title": f"{destination} Cultural Journey",
            "description": f"Immerse yourself in the rich culture and traditions of {destination}. Historical sites and local experiences.",
            "tags": ["culture", "history", "traditional"]
        }
    ]

    creators = ["@TravelExpert", "@Wanderlust", "@LocalGuide", "@FoodieAdventures",
                "@BudgetTraveler", "@LuxuryExplorer", "@CultureSeeker", "@AdventureTime"]

    posts = []
    for i in range(min(limit, len(themes))):
        theme = themes[i]
        creator = random.choice(creators)
        likes = f"{random.randint(5, 150)}K"
        duration = f"{random.randint(1, 4)}:{random.randint(0, 59):02d}"

        post = SocialMediaPost(
            id=f"fallback_{i}",
            title=theme["title"],
            description=theme["description"],
            creator=creator,
            likes=likes,
            duration=duration,
            thumbnail=f"https://via.placeholder.com/200x350/{random.choice(['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FECA57', 'FF9FF3'])}/FFFFFF?text={destination.replace(' ', '+')}",
            video_url="#",
            tags=[destination.lower()] + theme["tags"],
            platform=random.choice(["tiktok", "youtube", "instagram"])
        )
        posts.append(post)

    return SocialMediaResponse(
        posts=posts,
        destination=destination,
        total_count=len(posts)
    )


@app.get("/api/debug-ssl")
async def debug_ssl():
    """调试 SSL 配置状态"""
    return {
        "SSL_CERT_FILE": os.environ.get('SSL_CERT_FILE'),
        "REQUESTS_CA_BUNDLE": os.environ.get('REQUESTS_CA_BUNDLE'),
        "CURL_CA_BUNDLE": os.environ.get('CURL_CA_BUNDLE'),
        "HTTP_PROXY": os.environ.get('HTTP_PROXY'),
        "HTTPS_PROXY": os.environ.get('HTTPS_PROXY'),
        "certifi_path": certifi.where(),
        "cert_file_exists": os.path.exists(certifi.where()) if certifi.where() else False
    }


# 添加 SSE 端点
@app.get("/api/progress/{request_id}")
async def progress_stream(request_id: str):
    """进度流端点"""
    return StreamingResponse(
        progress_manager.get_progress_stream(request_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )


async def run_mcp_travel_planner(destination: str, num_days: int, num_people: int, budget: int, openai_key: str,
                                 google_maps_key: str, first_complete_flag: int, user_new_requirements: str, request_id: str = None):
    """Run the MCP-based travel planner agent with real-time data access."""
    global temp_output
    # for test
    print("@@@@@@@@@@@@@@@@  Start  @@@@@@@@@@@@@@@@@@@@@@@@")
    try:
        # Set Google Maps API key environment variable
        os.environ["GOOGLE_MAPS_API_KEY"] = google_maps_key
        # Initialize MCPTools with Airbnb MCP
        mcp_tools = MultiMCPTools(
            [
                # Windows
                "cmd /c npx -y @openbnb/mcp-server-airbnb --ignore-robots-txt",
                "cmd /c npx -y @gongrzhe/server-travelplanner-mcp",
                # Linux
                # "npx -y @openbnb/mcp-server-airbnb --ignore-robots-txt",
                # "npx @gongrzhe/server-travelplanner-mcp",
            ],
            env={
                "GOOGLE_MAPS_API_KEY": google_maps_key,
            },
            timeout_seconds=100,
        )

        # Connect to Airbnb MCP server
        await mcp_tools.connect()

        if request_id:
            await progress_manager.add_progress(request_id, "🤖 Create an AI travel agent", "info")

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

        # 根据标志选择模板并处理不同参数
        if first_complete_flag == 0:
            # 使用 prompt.md，需要基础行程参数
            with open('./prompt.md', "r", encoding="utf-8") as f:
                prompt_template = f.read()
            prompt = prompt_template.format(
                destination=destination,
                num_days=num_days,
                num_people=num_people,
                budget=budget
            )
        else:
            # 使用 change.md，需要用户新需求和原始行程参数
            with open('./change.md', "r", encoding="utf-8") as f:
                prompt_template = f.read()
            prompt = prompt_template.format(
                user_new_requirements=user_new_requirements,
                destination=destination,
                num_days=num_days,
                num_people=num_people,
                budget=budget,
                temp_output=temp_output
            )

        response = await travel_planner.arun(prompt)

        if request_id:
            await progress_manager.add_progress(request_id, "Identifying the best possible route", "info")
            await asyncio.sleep(1)
            await progress_manager.add_progress(request_id,
                                                f"{num_days} full days to explore {destination}'s iconic spots andhidden gems.",
                                                "detail")

        temp_output=response.content
        return response.content

    finally:
        await mcp_tools.close()


@app.get("/")
async def root():
    return {"message": "MCP AI Travel Planner API"}


async def generate_itinerary(request: TravelPlanRequest, user_new_requirements: str, first_complete_flag: int, request_id: str = None):
    """
    生成旅行行程
    """
    openai_key = os.getenv("OPENROUTER_API_KEY")
    googlemap_key = os.getenv("GOOGLE_MAP_KEY")
    try:
        itinerary = await run_mcp_travel_planner(
            destination=request.destination,
            num_days=request.num_days,
            num_people=request.num_people,
            budget=request.budget,
            openai_key=openai_key,
            google_maps_key=googlemap_key,
            request_id=request_id,
            first_complete_flag=first_complete_flag,
            user_new_requirements=user_new_requirements,
        )

        return {
            "success": True,
            "itinerary": itinerary,
            "message": "行程生成成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成行程时出错: {str(e)}")


async def get_airbnb_images(room_url: str):
    """
    获取 Airbnb 房源图片的代理接口
    """
    try:
        print(f"正在获取 Airbnb 房源图片: {room_url}")

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }

            response = await client.get(room_url, headers=headers)
            response.raise_for_status()

            # 查找JSON-LD数据
            json_ld_pattern = r'<script type="application/ld\+json">(.*?)</script>'
            matches = re.findall(json_ld_pattern, response.text, re.DOTALL)

            image_urls = []
            for match in matches:
                try:
                    data = json.loads(match)
                    if 'image' in data:
                        if isinstance(data['image'], str):
                            image_urls.append(data['image'])
                        elif isinstance(data['image'], list):
                            image_urls.extend(data['image'][:3])
                except:
                    continue

            print(f"找到 {len(image_urls)} 张图片")
            return image_urls[:1]  # 返回第一张图片

    except Exception as e:
        print(f"获取 Airbnb 图片失败: {e}")
        return []


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

    if request.travel_info:
        print(f"✅ 收到 request_id: {request.request_id}")
        request_id = request.request_id

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
            nonstop=True
        )
    ]

    flight_service = SimpleFlightService()
    travel_info = request.travel_info

    user_new_requirements = ""
    if request.chat_history and len(request.chat_history) > 0:
        last_msg = request.chat_history[-1]
        if last_msg.get("role") == "user":
            user_new_requirements = last_msg.get("content", "")

    response = await generate_itinerary(
        TravelPlanRequest(
            destination=travel_info.destination,
            departure=travel_info.departure,
            num_days=travel_info.num_days,
            num_people=travel_info.num_people,
            budget=travel_info.budget
        ),
        request_id=request_id,  # 传递请求ID
        user_new_requirements=user_new_requirements,
        first_complete_flag=request.first_complete_flag
    )

    itinerary_data = json.loads(response.get("itinerary", {}))

    start_date = datetime.strptime(travel_info.start_date, '%a %b %d %Y')
    end_date = datetime.strptime(travel_info.end_date, '%a %b %d %Y')
    departure_date = start_date.strftime('%Y-%m-%d')
    return_date = end_date.strftime('%Y-%m-%d')

    overview = itinerary_data["trip_overview"]
    real_overview = TripOverview(
        title=overview['title'],
        image_url=get_place_photo_url(overview["destination"], os.getenv("GOOGLE_MAP_KEY")),
        location=overview['destination'],
        date_range=travel_info.start_date + ' - ' + travel_info.end_date,
        description=overview['summary']
    )

    # 每日行程信息
    daily_data = []
    days_info = itinerary_data["daily_itinerary"]
    for day_info in days_info:
        for activity in day_info["activities"]:
            url = get_place_photo_url(activity["address"], os.environ["GOOGLE_MAPS_API_KEY"])
            if (url == None):
                url = ""
            daily_itinerary = DailyItinerary(
                start_time=activity["start_time"],
                end_time=activity["end_time"],
                activity=activity["activity_name"],
                image_url=url
            )
            daily_data.append({
                "day": day_info["day"],
                "itinerary": daily_itinerary
            })

    # 搜索航班
    if request_id:
        await asyncio.sleep(1)
        await progress_manager.add_progress(request_id, "Searching for flights", "info")

    outbound_flights, inbound_flights = flight_service.get_round_trip_flights(
        departure_city=travel_info.departure.lower(),
        destination_city=travel_info.destination.lower(),
        num_people=travel_info.num_people,
        budget=travel_info.budget,
        departure_date=departure_date,
        return_date=return_date
    )

    real_flights = []

    if outbound_flights and inbound_flights:
        best_outbound = outbound_flights[0]
        best_inbound = inbound_flights[0]

        # 解析去程/返程航段
        seg_out = best_outbound['itineraries'][0]['segments'][0]
        seg_in = best_inbound['itineraries'][0]['segments'][0]
        dur_out = best_outbound['itineraries'][0]['duration']
        dur_in = best_inbound['itineraries'][0]['duration']

        real_flights = [
            flight_service.extract_flight(seg_out, dur_out, travel_info.departure, travel_info.destination),
            flight_service.extract_flight(seg_in, dur_in, travel_info.destination, travel_info.departure)
        ]
    else:
        real_flights = mock_flights

    if request_id:
        await progress_manager.add_progress(request_id,
                                            f"Direct flights from {travel_info.departure} to {travel_info.destination} take about {dur_out.replace('PT', '').lower()} each way.",
                                            "detail")

    if request_id:
        await asyncio.sleep(1)
        await progress_manager.add_progress(request_id, "Searching for hotels", "info")

    real_hotels = []
    accommodation_data = itinerary_data["accommodation"]
    for acc in accommodation_data:
        # 获取 Airbnb 图片
        image_url = ""
        if acc.get("link") and "airbnb.com" in acc["link"]:
            images = await get_airbnb_images(acc["link"])
            if images:
                image_url = images[0]
        hotel = Hotel(
            name=acc.get("name", ""),
            image_url=image_url,
            rating=acc.get("rating", 0),
            review_count=acc.get("review_count", 0),
            price_per_night=int(acc.get("price_per_night_hkd", 0)),
            currency="HKD",
            address=acc.get("address", ""),
            amenities=acc.get("amenities", []),
            link=acc.get("link", "")
        )

        real_hotels.append(hotel)

    real_price = PriceSummary(
        flights_total=int(float(best_outbound['price']['total']) + float(best_inbound['price']['total'])) * 9,
        hotels_total=int(itinerary_data["budget_breakdown"]["accommodation_total_hkd"]),
        grand_total=int(travel_info.budget - itinerary_data["budget_breakdown"]["remaining_budget_hkd"]),  # 332 + 221
        currency="HKD"
    )

    if request_id:
        await asyncio.sleep(1)
        await progress_manager.add_progress(request_id, "Creating an itinerary", "info")
        await asyncio.sleep(1)
        await progress_manager.add_progress(request_id,
                                            f"I've focused on {travel_info.destination}'s iconic highlights perfect for your short visit.",
                                            "detail")
        await progress_manager.add_progress(request_id,
                                            "I made sure to include must-see attractions for that iconic experience!",
                                            "detail")
        await asyncio.sleep(1)
        await progress_manager.add_progress(request_id, "Trip Generated!", "success")

    # --- 返回完整的响应 ---
    return ItineraryResponse(
        # ai_response=response.get("itinerary"),
        ai_response="",
        trip_overview=real_overview,
        daily_itinerary=daily_data,
        flights=real_flights,
        hotels=real_hotels,
        price_summary=real_price
    )


# ============================================
# 历史记录相关API端点
# ============================================

def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """从请求头中提取用户ID"""
    if not authorization:
        return None
    try:
        # 格式: "Bearer <token>" 或直接是user_id
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
            # 验证Google ID token并提取user_id
            try:
                from google.oauth2 import id_token
                from google.auth.transport import requests
                import os

                google_client_id = os.getenv("GOOGLE_CLIENT_ID")
                if google_client_id:
                    idinfo = id_token.verify_oauth2_token(
                        token,
                        requests.Request(),
                        google_client_id
                    )
                    return idinfo.get("sub")  # Google user ID
            except:
                # 如果验证失败，尝试直接使用token作为user_id（简化处理）
                pass
            return token
        return authorization
    except:
        return None


@app.post("/api/plans/save")
async def save_plan(
        plan_data: dict,
        user_id: Optional[str] = Depends(get_user_id_from_token)
):
    """保存旅游计划"""
    if not user_id:
        raise HTTPException(status_code=401, detail="未授权，请先登录")

    try:
        # 调试：打印接收到的数据
        print(f"收到保存请求，user_id: {user_id}")
        print(f"plan_data keys: {plan_data.keys()}")
        print(f"trip_overview: {plan_data.get('trip_overview')}")
        print(f"flights: {len(plan_data.get('flights', []))} 条")
        print(f"hotels: {len(plan_data.get('hotels', []))} 条")
        print(f"daily_itinerary: {len(plan_data.get('daily_itinerary', []))} 条")

        # 构建保存的数据
        # 注意：plan_data已经包含了所有需要的信息（title, destination, trip_overview, flights等）
        # 直接传递plan_data，让create_travel_plan提取需要的字段并保存完整的plan_data
        result = supabase_client.create_travel_plan(user_id, plan_data)

        if result:
            print(f"保存成功，plan_id: {result.get('id')}")
            return {
                "success": True,
                "message": "计划保存成功",
                "plan_id": result.get("id")
            }
        else:
            raise HTTPException(status_code=500, detail="保存失败")
    except Exception as e:
        print(f"保存计划时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"保存计划时出错: {str(e)}")


@app.get("/api/plans")
async def get_plans(
        user_id: Optional[str] = Depends(get_user_id_from_token)
):
    """获取用户的所有旅游计划"""
    if not user_id:
        raise HTTPException(status_code=401, detail="未授权，请先登录")

    try:
        plans = supabase_client.get_user_plans(user_id)
        return {
            "success": True,
            "plans": plans
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取计划列表时出错: {str(e)}")


@app.get("/api/plans/{plan_id}")
async def get_plan(
        plan_id: str,
        user_id: Optional[str] = Depends(get_user_id_from_token)
):
    """获取单个旅游计划"""
    if not user_id:
        raise HTTPException(status_code=401, detail="未授权，请先登录")

    try:
        plan = supabase_client.get_plan_by_id(plan_id, user_id)
        if plan:
            return {
                "success": True,
                "plan": plan
            }
        else:
            raise HTTPException(status_code=404, detail="计划不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取计划时出错: {str(e)}")


@app.delete("/api/plans/{plan_id}")
async def delete_plan(
        plan_id: str,
        user_id: Optional[str] = Depends(get_user_id_from_token)
):
    """删除旅游计划"""
    if not user_id:
        raise HTTPException(status_code=401, detail="未授权，请先登录")

    try:
        success = supabase_client.delete_plan(plan_id, user_id)
        if success:
            return {
                "success": True,
                "message": "计划删除成功"
            }
        else:
            raise HTTPException(status_code=500, detail="删除失败")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除计划时出错: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
