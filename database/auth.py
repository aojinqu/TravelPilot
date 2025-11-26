"""
Google OAuth认证模块
"""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from google.oauth2 import id_token
from google.auth.transport import requests
import httpx
from typing import Optional

router = APIRouter()

def get_google_config():
    """获取Google OAuth配置（延迟加载）"""
    from dotenv import load_dotenv
    load_dotenv()  # 确保环境变量已加载
    return {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")
    }

def get_google_auth_url() -> str:
    """生成Google OAuth授权URL"""
    config = get_google_config()
    if not config["client_id"]:
        raise HTTPException(status_code=500, detail="Google OAuth未配置")
    
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={config['client_id']}&"
        "response_type=code&"
        "scope=openid email profile&"
        f"redirect_uri={config['redirect_uri']}&"
        "access_type=offline&"
        "prompt=consent"
    )
    return auth_url

@router.get("/api/auth/google")
async def google_login():
    """Google登录入口"""
    config = get_google_config()
    if not config["client_id"]:
        raise HTTPException(status_code=500, detail="Google OAuth未配置")
    
    auth_url = get_google_auth_url()
    return RedirectResponse(url=auth_url)

@router.get("/api/auth/callback")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None):
    """Google OAuth回调处理"""
    if error:
        # 如果用户拒绝授权，重定向到前端并显示错误
        frontend_url_env = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            url=f"{frontend_url_env}/auth/callback?error={error}"
        )
    
    if not code:
        raise HTTPException(status_code=400, detail="缺少授权码")
    
    config = get_google_config()
    if not config["client_id"] or not config["client_secret"]:
        raise HTTPException(status_code=500, detail="Google OAuth未配置")
    
    try:
        # 交换授权码获取token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": config["client_id"],
            "client_secret": config["client_secret"],
            "redirect_uri": config["redirect_uri"],
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
        
        id_token_str = tokens.get("id_token")
        if not id_token_str:
            raise HTTPException(status_code=400, detail="未获取到ID token")
        
        # 验证ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_str,
                requests.Request(),
                config["client_id"]
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="无效的ID token")
        
        # 提取用户信息
        user_email = idinfo.get("email")
        user_name = idinfo.get("name", "")
        user_picture = idinfo.get("picture", "")
        user_id = idinfo.get("sub")
        
        # 创建JWT token用于后续认证（可选，这里简化处理）
        # 在实际应用中，你可能需要将用户信息存储到数据库
        
        # 重定向到前端，携带用户信息
        # 从环境变量获取前端URL，默认为localhost:3000
        frontend_url_env = os.getenv("FRONTEND_URL", "http://localhost:3000")
        frontend_url = (
            f"{frontend_url_env}/auth/callback?"
            f"token={id_token_str}&"
            f"email={user_email}&"
            f"name={user_name}&"
            f"picture={user_picture}&"
            f"user_id={user_id}"
        )
        
        return RedirectResponse(url=frontend_url)
        
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=500, detail=f"OAuth token交换失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"认证失败: {str(e)}")

@router.get("/api/auth/verify")
async def verify_token(token: str):
    """验证token并返回用户信息"""
    config = get_google_config()
    if not config["client_id"]:
        raise HTTPException(status_code=500, detail="Google OAuth未配置")
    
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            config["client_id"]
        )
        
        return {
            "valid": True,
            "user": {
                "email": idinfo.get("email"),
                "name": idinfo.get("name", ""),
                "picture": idinfo.get("picture", ""),
                "user_id": idinfo.get("sub")
            }
        }
    except ValueError:
        return {"valid": False, "error": "无效的token"}

@router.post("/api/auth/logout")
async def logout():
    """登出（前端清除token即可）"""
    return {"success": True, "message": "已登出"}

