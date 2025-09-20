import os
import httpx
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

# --- データ構造（Pydanticモデル）の定義 ---
class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str
    source: str | None = None
    publishedAt: str | None = None

# --- APIRouterの作成 ---
# APIRouterを使うと、機能をファイルごとに分割できます
router = APIRouter(prefix="/news", tags=["news"])

# --- GNews APIキーの取得 ---
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

# --- エンドポイントの定義 ---
@router.get("/news", response_model=List[NewsArticle])
async def get_news(q: str = "日本"):
    """
    指定されたクエリ（キーワード）でニュースを検索して返すエンドポイント
    """
    if not GNEWS_API_KEY:
        raise HTTPException(status_code=500, detail="APIキーが設定されていません。")

    gnews_api_url = "https://gnews.io/api/v4/search"
    params = {
        "q": q,
        "token": GNEWS_API_KEY,
        "lang": "ja",
        "country": "jp",
        "max": 2,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(gnews_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("articles", [])
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"GNews APIへの接続に失敗しました: {e}")