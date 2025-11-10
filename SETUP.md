# MCP AI Travel Planner - 设置指南

本指南将帮助您设置和运行使用 React 前端的 MCP AI Travel Planner。

## 项目结构

```
final_project/
├── backend.py          # FastAPI 后端服务器
├── frontend/           # React 前端应用
│   ├── src/
│   │   ├── App.jsx     # 主应用组件
│   │   ├── App.css     # 样式文件
│   │   ├── main.jsx    # 入口文件
│   │   └── index.css   # 全局样式
│   ├── package.json    # Node.js 依赖
│   └── vite.config.js  # Vite 配置
├── requirements.txt    # Python 依赖
└── README.md          # 项目说明
```

## 安装步骤

### 1. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 2. 安装 Node.js 依赖

```bash
cd frontend
npm install
cd ..
```

## 运行应用

### 方式一：分别启动后端和前端（推荐用于开发）

#### 终端 1：启动后端服务器

```bash
python backend.py
```

后端服务器将在 http://localhost:8000 上运行。

#### 终端 2：启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端应用将在 http://localhost:3000 上运行。

### 方式二：使用 uvicorn 启动后端（推荐用于生产）

```bash
uvicorn backend:app --reload --host 0.0.0.0 --port 8000
```

## 使用说明

1. **打开浏览器**：访问 http://localhost:3000

2. **配置 API 密钥**：
   - 在左侧边栏输入您的 OpenAI API Key
   - 输入您的 Google Maps API Key

3. **填写旅行信息**：
   - 目的地
   - 旅行天数
   - 预算（USD）
   - 开始日期
   - 旅行偏好

4. **生成行程**：
   - 点击"生成行程"按钮
   - 等待 AI 生成详细的旅行计划

5. **下载日历**：
   - 生成行程后，可以点击"下载为日历"按钮
   - 将生成 ICS 格式的日历文件，可导入到 Google Calendar、Outlook 等

## API 端点

后端提供以下 API 端点：

- `GET /` - API 健康检查
- `POST /api/generate-itinerary` - 生成旅行行程
- `POST /api/download-calendar` - 下载 ICS 日历文件

## 注意事项

- 确保后端服务器运行在端口 8000
- 前端默认运行在端口 3000
- 如果端口冲突，可以修改 `frontend/vite.config.js` 中的端口配置
- 需要有效的 OpenAI API Key 和 Google Maps API Key

## 故障排除

### 后端无法启动
- 检查 Python 版本（建议 3.8+）
- 确认所有依赖已安装：`pip install -r requirements.txt`
- 检查端口 8000 是否被占用

### 前端无法启动
- 检查 Node.js 版本（建议 16+）
- 确认所有依赖已安装：`cd frontend && npm install`
- 检查端口 3000 是否被占用

### CORS 错误
- 确认后端和前端都正常运行
- 检查 `backend.py` 中的 CORS 配置

### API 调用失败
- 检查 API 密钥是否正确
- 确认后端服务器正在运行
- 查看浏览器控制台的错误信息

