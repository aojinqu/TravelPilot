"""
Supabase数据库客户端
"""
import os
from supabase import create_client, Client
from typing import Optional, Dict, List
from datetime import datetime
import json

class SupabaseClient:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        # 使用service_role key以绕过RLS（因为我们使用Google OAuth）
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set in environment variables")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def create_travel_plan(self, user_id: str, plan_data: Dict) -> Optional[Dict]:
        """
        创建旅游计划
        
        Args:
            user_id: 用户ID
            plan_data: 计划数据，包含完整的行程信息
        
        Returns:
            创建的计划数据
        """
        try:
            # 提取基本字段用于数据库列
            # plan_data包含完整的计划数据（trip_overview, flights, hotels等）
            data = {
                "user_id": user_id,
                "title": plan_data.get("title", ""),
                "destination": plan_data.get("destination", ""),
                "departure": plan_data.get("departure", ""),
                "num_days": plan_data.get("num_days", 0),
                "num_people": plan_data.get("num_people", 0),
                "budget": plan_data.get("budget", 0),
                "start_date": plan_data.get("start_date", ""),
                "end_date": plan_data.get("end_date", ""),
                "plan_data": json.dumps(plan_data),  # 存储完整的plan_data（包含trip_overview, flights, hotels等）
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # 调试：打印保存的数据结构
            print(f"保存到数据库的数据结构:")
            print(f"  title: {data['title']}")
            print(f"  destination: {data['destination']}")
            print(f"  plan_data (JSON字符串长度): {len(data['plan_data'])}")
            # 检查plan_data中是否包含关键字段
            plan_data_obj = json.loads(data['plan_data']) if isinstance(data['plan_data'], str) else data['plan_data']
            print(f"  plan_data包含trip_overview: {'trip_overview' in plan_data_obj}")
            print(f"  plan_data包含flights: {'flights' in plan_data_obj}")
            print(f"  plan_data包含hotels: {'hotels' in plan_data_obj}")
            if 'trip_overview' in plan_data_obj:
                print(f"  trip_overview: {plan_data_obj['trip_overview'] is not None}")
            if 'flights' in plan_data_obj:
                print(f"  flights数量: {len(plan_data_obj.get('flights', []))}")
            if 'hotels' in plan_data_obj:
                print(f"  hotels数量: {len(plan_data_obj.get('hotels', []))}")
            
            response = self.client.table("travel_plans").insert(data).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"创建旅游计划失败: {e}")
            raise
    
    def get_user_plans(self, user_id: str) -> List[Dict]:
        """
        获取用户的所有旅游计划
        
        Args:
            user_id: 用户ID
        
        Returns:
            计划列表
        """
        try:
            response = self.client.table("travel_plans")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            
            if response.data:
                # 解析JSON数据
                for plan in response.data:
                    if plan.get("plan_data"):
                        try:
                            plan["plan_data"] = json.loads(plan["plan_data"])
                        except:
                            pass
                return response.data
            return []
        except Exception as e:
            print(f"获取旅游计划失败: {e}")
            return []
    
    def get_plan_by_id(self, plan_id: str, user_id: str) -> Optional[Dict]:
        """
        根据ID获取旅游计划
        
        Args:
            plan_id: 计划ID
            user_id: 用户ID（用于验证权限）
        
        Returns:
            计划数据
        """
        try:
            response = self.client.table("travel_plans")\
                .select("*")\
                .eq("id", plan_id)\
                .eq("user_id", user_id)\
                .execute()
            
            if response.data and len(response.data) > 0:
                plan = response.data[0]
                if plan.get("plan_data"):
                    try:
                        # 解析JSON字符串
                        parsed_plan_data = json.loads(plan["plan_data"]) if isinstance(plan["plan_data"], str) else plan["plan_data"]
                        plan["plan_data"] = parsed_plan_data
                        
                        # 调试：打印加载的数据
                        print(f"加载计划 {plan_id}:")
                        print(f"  plan_data类型: {type(parsed_plan_data)}")
                        print(f"  plan_data包含trip_overview: {'trip_overview' in parsed_plan_data}")
                        print(f"  plan_data包含flights: {'flights' in parsed_plan_data}")
                        print(f"  plan_data包含hotels: {'hotels' in parsed_plan_data}")
                        if 'trip_overview' in parsed_plan_data:
                            print(f"  trip_overview值: {parsed_plan_data['trip_overview'] is not None}")
                        if 'flights' in parsed_plan_data:
                            print(f"  flights数量: {len(parsed_plan_data.get('flights', []))}")
                        if 'hotels' in parsed_plan_data:
                            print(f"  hotels数量: {len(parsed_plan_data.get('hotels', []))}")
                    except Exception as e:
                        print(f"解析plan_data失败: {e}")
                        import traceback
                        traceback.print_exc()
                return plan
            return None
        except Exception as e:
            print(f"获取旅游计划失败: {e}")
            return None
    
    def delete_plan(self, plan_id: str, user_id: str) -> bool:
        """
        删除旅游计划
        
        Args:
            plan_id: 计划ID
            user_id: 用户ID（用于验证权限）
        
        Returns:
            是否删除成功
        """
        try:
            response = self.client.table("travel_plans")\
                .delete()\
                .eq("id", plan_id)\
                .eq("user_id", user_id)\
                .execute()
            
            return True
        except Exception as e:
            print(f"删除旅游计划失败: {e}")
            return False

