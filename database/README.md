# 数据库设置说明

## Supabase配置

### 1. 创建表结构

在Supabase Dashboard的SQL Editor中执行 `supabase_schema.sql` 文件中的SQL语句。

### 2. 环境变量配置

在项目的 `.env` 文件中添加以下配置：

```env
# Google OAuth
GOOGLE_CLIENT_ID=341568145597-gir74h16a82ov009msuq844a12g72ulk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# Supabase
SUPABASE_URL=https://vgpzzrvyvmdzpjgeaaxo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncHp6cnZ5dm1kenBqZ2VhYXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzYyNTQsImV4cCI6MjA3ODUxMjI1NH0.r-sSxaCQmi2Q1nGluf5k1lcwtuMPIyQehcYyoEOykL8
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncHp6cnZ5dm1kenBqZ2VhYXhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzNjI1NCwiZXhwIjoyMDc4NTEyMjU0fQ.1wV_p_OzUwOlw2fo_tjWJ1saeSY_AOSvDWtIt-62hnE
```

### 3. Google OAuth配置

1. 在 [Google Cloud Console](https://console.cloud.google.com/) 中创建OAuth 2.0客户端ID
2. 添加授权重定向URI: `http://localhost:8000/api/auth/callback`
3. 将Client ID和Client Secret添加到环境变量中

### 4. Row Level Security (RLS)

由于我们使用Google OAuth而不是Supabase Auth，建议：

1. **选项A（推荐）**: 禁用RLS，在后端使用service_role key进行验证
   ```sql
   ALTER TABLE travel_plans DISABLE ROW LEVEL SECURITY;
   ```

2. **选项B**: 保持RLS启用，但修改策略以允许所有操作（后端会验证user_id）
   ```sql
   CREATE POLICY "Allow all for service role"
       ON travel_plans
       FOR ALL
       USING (true);
   ```

### 5. 测试

启动后端服务后，可以测试以下端点：

- `GET /api/auth/google` - 启动Google登录
- `POST /api/plans/save` - 保存计划（需要Authorization header）
- `GET /api/plans` - 获取所有计划（需要Authorization header）
- `GET /api/plans/{plan_id}` - 获取单个计划（需要Authorization header）
- `DELETE /api/plans/{plan_id}` - 删除计划（需要Authorization header）

