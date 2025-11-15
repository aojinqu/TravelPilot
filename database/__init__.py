"""
Database package initialization
"""
from .supabase_client import SupabaseClient
from .auth import router as auth_router

__all__ = ["SupabaseClient", "auth_router"]
# 这个文件让 database 目录被识别为 Python 包
# 目前代码使用直接导入方式（from database.xxx import），所以这里不需要导出内容

