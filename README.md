## TravelPilot: A LLM-Based Agent for customized Travelling  

一个使用 React 前端和 FastAPI 后端的 AI 旅行规划器，支持通过 MCP 服务器访问实时数据。

### 功能特性

- 🏨 **实时 Airbnb 数据**：使用 Airbnb MCP 服务器获取真实的住宿信息和价格
- 🗺️ **Google Maps 集成**：精确计算距离和旅行时间
- 🔍 **实时网络搜索**：获取最新的旅行信息、评论和更新
- 📅 **日历导出**：将行程导出为 ICS 文件，可导入 Google Calendar、Apple Calendar 或 Outlook
- ⚡ **现代化前端**：使用 React 构建的响应式用户界面

**Trip Overview**

![Trip Overview](./prompt/TripOverview.png)

**Trip Detail**

![Trip Detail](./prompt/TripDetail.png)

**Flight Ticket**

![Flight Ticket](./prompt/FlightTicket.png)

**Social Media**

![SocialMedia](./prompt/SocialMedia.png)

**Preference**

![Preference](./prompt/Preference.png)

### 系统架构

**Tools**: GPT 4o, Google Maps API, Airbnb MCP

**Input**:Departure, destination,start/end date of the trip, travel duration, number of travelers, total budget, travel preference

**Output**: 

A JSON follows the structure with "trip_overview", "accommodation", "daily_itinerary", and "budget_breakdown".

**Implementation Procedure**:

1. Receive user input and check if mandatory information (departure location, travel dates, travel duration) is complete; prompt the user to supplement if incomplete.
2. Call GPT model with complete information, which invokes Google Maps API (for route planning) and Airbnb MCP API (for accommodation matching) to generate the structured JSON itinerary as specified.

![Architect](./prompt/Architect.png)

### 系统要求

1. **API Keys** (两者都需要):
    - **OpenAI API Key**: 从 [OpenAI Platform](https://platform.openai.com/api-keys) 获取 
    - **Google Maps API Key**: 从 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 获取 （新增：需要在API限制中加入YouTube Data API v3 和 Custom Search API）
    - **Google Search Engine ID**: 从 [Google Console](https://cse.google.com/controlpanel/all)获取 （新增）

2. **Python 3.10+**: 确保已安装 Python 3.10 或更高版本

3. **Node.js 16+**: 用于运行 React 前端（建议使用 npm 或 yarn）

4. **MCP Servers**: 应用会自动连接到:
    - **Airbnb MCP Server**: 提供真实的 Airbnb 房源和价格数据
    - **Custom Google Maps MCP**: 实现精确的距离计算和位置服务

### 快速开始

#### 1. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

#### 2. 安装 Node.js 依赖

```bash
cd frontend
npm install
cd ..
```

#### 3. 启动应用

**终端 1 - 启动后端服务器：**
```bash
python main.py
```
后端将在 http://localhost:8000 运行

**终端 2 - 启动前端开发服务器：**
```bash
cd frontend
npm run dev
```
前端将在 http://localhost:3000 运行

**终端 3 - 启动前端开发服务器：**

```bash
npm install -g rednote-mind-mcp
# 首次使用，运行登录向导
rednote-init
# 或
rednote-mind-mcp init

# 运行代码
python xhs.py
```

[rednote-mind-mcp配置指南](https://www.npmjs.com/package/rednote-mind-mcp)

#### 4. 使用应用

1. 在浏览器中访问 http://localhost:3000
2. 在左侧边栏输入您的 **OpenAI API key** 和 **Google Maps API key**
3. 填写旅行信息（目的地、天数、预算、偏好等）
4. 点击"🎯 生成行程"按钮创建详细的旅行计划
5. （可选）点击"📅 下载为日历"导出 ICS 文件



