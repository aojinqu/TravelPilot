-- Supabase数据库表结构
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- 创建travel_plans表
CREATE TABLE IF NOT EXISTS travel_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    destination TEXT,
    departure TEXT,
    num_days INTEGER,
    num_people INTEGER,
    budget NUMERIC,
    start_date TEXT,
    end_date TEXT,
    plan_data JSONB,  -- 存储完整的计划JSON数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at DESC);

-- 启用Row Level Security (RLS)
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的计划
CREATE POLICY "Users can view their own plans"
    ON travel_plans FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own plans"
    ON travel_plans FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own plans"
    ON travel_plans FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own plans"
    ON travel_plans FOR DELETE
    USING (auth.uid()::text = user_id);

-- 注意：如果使用Google OAuth而不是Supabase Auth，你可能需要：
-- 1. 禁用RLS，或者
-- 2. 修改策略以使用自定义的user_id字段而不是auth.uid()

-- 如果使用Google OAuth，可以禁用RLS或使用以下策略：
-- DROP POLICY IF EXISTS "Users can view their own plans" ON travel_plans;
-- DROP POLICY IF EXISTS "Users can insert their own plans" ON travel_plans;
-- DROP POLICY IF EXISTS "Users can update their own plans" ON travel_plans;
-- DROP POLICY IF EXISTS "Users can delete their own plans" ON travel_plans;
-- 
-- 然后创建基于user_id的策略（如果使用service_role key，可以绕过RLS）：
-- CREATE POLICY "Users can manage their own plans by user_id"
--     ON travel_plans
--     FOR ALL
--     USING (true);  -- 使用service_role key时，后端会验证user_id

