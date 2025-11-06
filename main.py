import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# -----------------------------------------------
# 1. 初始化 FastAPI 应用
# -----------------------------------------------
app = FastAPI()

# -----------------------------------------------
# 2. 配置 CORS (跨域资源共享)
# -----------------------------------------------
# 这至关重要，它允许你的 React 前端 (运行在如 http://localhost:5173)
# 与你的 Python 后端 (运行在 http://localhost:8000) 通信。

# 注意：请将 "http://localhost:5173" 替换为你 React 应用的实际运行地址
origins = [
    "http://localhost:5173",
    "http://localhost:3000",  # 如果你用的是 create-react-app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------
# 3. 定义数据模型 (Pydantic Models)
# -----------------------------------------------
# 这些模型精确定义了 API 的请求和响应 JSON 结构
# 这也是 FastAPI 最大的优势之一

# --- 请求体 ---
class ChatRequest(BaseModel):
    message: str
    vibe: Optional[List[str]] = None
    chat_history: Optional[List[dict]] = None  # (可选) 用于上下文


# --- 响应体 (与你的 UI 完全匹配) ---
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
    """
    这是你的主聊天和行程生成 API。
    目前，它会忽略输入并返回一个写死的“大阪”行程用于测试。
    """

    print(f"✅ 收到前端消息: {request.message}")
    if request.vibe:
        print(f"✅ 收到 Vibe: {request.vibe}")

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

    # --- 返回完整的响应 ---
    return ItineraryResponse(
        ai_response=mock_ai_response,
        trip_overview=mock_overview,
        flights=mock_flights,
        hotels=mock_hotels,
        price_summary=mock_price
    )


@app.get("/")
def read_root():
    return {"message": "Airial Backend is running!"}


# -----------------------------------------------
# 5. (可选) 允许 Uvicorn 在此文件启动
# -----------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)