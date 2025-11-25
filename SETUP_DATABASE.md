# 数据库和认证功能设置指南

## 概述

本项目已添加以下功能：
1. **Supabase数据库集成** - 用于存储旅游计划历史
2. **Google OAuth登录** - 用户认证
3. **历史记录管理** - 保存、查看、删除旅游计划

## 设置步骤

### 1. 安装依赖

#### 后端依赖
```bash
pip install -r requirements.txt
```

#### 前端依赖
前端依赖已包含在 `package.json` 中，无需额外安装。

### 2. 配置环境变量

在项目根目录创建或更新 `.env` 文件：

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

### 3. 设置Supabase数据库

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 执行 `database/supabase_schema.sql` 中的SQL语句创建表结构

**重要**: 由于我们使用Google OAuth而不是Supabase Auth，建议禁用RLS或修改策略：

```sql
-- 选项1: 禁用RLS（推荐，因为后端会验证user_id）
ALTER TABLE travel_plans DISABLE ROW LEVEL SECURITY;

-- 或者选项2: 创建允许所有操作的策略
CREATE POLICY "Allow all for service role"
    ON travel_plans
    FOR ALL
    USING (true);
```

### 4. 配置Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目
3. 启用 **Google+ API**
4. 创建 **OAuth 2.0 客户端ID**
5. 添加授权重定向URI: `http://localhost:8000/api/auth/callback`
6. 将Client ID和Client Secret添加到 `.env` 文件

### 5. 启动服务

#### 启动后端
```bash
python backend.py
# 或
uvicorn backend:app --reload --port 8000
```

#### 启动前端
```bash
cd frontend
npm start
```

## 功能说明

### 1. Google登录

- 点击右上角的 **Login** 按钮
- 跳转到Google登录页面
- 登录成功后自动返回应用
- 显示用户头像和名称

### 2. 保存计划

- 生成旅游计划后，右上角会显示 **Save Plan** 按钮（仅登录用户可见）
- 点击保存当前计划到数据库
- 保存成功后显示提示

### 3. 查看历史记录

- 点击左上角的 **History** 按钮
- 左侧面板显示所有保存的旅游计划
- 点击任意计划可加载并查看详情
- 再次点击 **History** 按钮可关闭历史面板

### 4. 删除计划

- 在历史记录面板中，每条记录右侧有删除按钮
- 点击删除按钮并确认即可删除计划

## API端点

### 认证相关
- `GET /api/auth/google` - 启动Google登录
- `GET /api/auth/callback` - OAuth回调处理
- `GET /api/auth/verify` - 验证token
- `POST /api/auth/logout` - 登出

### 计划管理
- `POST /api/plans/save` - 保存计划（需要Authorization header）
- `GET /api/plans` - 获取所有计划（需要Authorization header）
- `GET /api/plans/{plan_id}` - 获取单个计划（需要Authorization header）
- `DELETE /api/plans/{plan_id}` - 删除计划（需要Authorization header）

## 文件结构

```
database/
├── __init__.py              # 包初始化
├── supabase_client.py       # Supabase客户端
├── auth.py                  # Google OAuth认证
├── supabase_schema.sql      # 数据库表结构
└── README.md                # 数据库说明

frontend/src/
├── context/
│   └── AuthContext.js       # 认证上下文
└── components/
    └── HistoryPanel.jsx     # 历史记录面板组件
```

## 故障排除

### 1. 登录失败
- 检查 `.env` 文件中的Google OAuth配置
- 确认重定向URI已添加到Google Cloud Console
- 检查后端日志查看错误信息

### 2. 保存计划失败
- 确认已登录
- 检查Supabase配置是否正确
- 确认数据库表已创建
- 检查RLS策略设置

### 3. 历史记录不显示
- 确认已登录
- 检查网络请求是否成功
- 查看浏览器控制台错误信息

### 4. 数据库连接失败
- 检查Supabase URL和密钥是否正确
- 确认网络连接正常
- 检查Supabase项目状态

## 注意事项

1. **安全性**: 在生产环境中，应该：
   - 使用HTTPS
   - 正确验证JWT token
   - 实施更严格的权限控制
   - 使用环境变量管理敏感信息

2. **RLS策略**: 由于使用Google OAuth，Supabase的RLS策略需要相应调整

3. **Token管理**: 当前实现简化了token验证，生产环境应使用更安全的token管理方案

