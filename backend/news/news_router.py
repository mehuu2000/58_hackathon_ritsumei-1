import os
import httpx
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, Field
from services.gsi_service import get_prefecture_from_coords

# --- データ構造（Pydanticモデル）の定義 ---
class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str
    source: str | None = None
    publishedAt: str | None = None

class LocationRequest(BaseModel):   
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

# --- APIRouterの作成 ---
# APIRouterを使うと、機能をファイルごとに分割できます
router = APIRouter(prefix="/news", tags=["news"])

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")


@router.post("/get-news-by-location", response_model=List[NewsArticle])
async def get_news_by_location(location: LocationRequest):
    """
    指定されたクエリ（キーワード）でニュースを検索して返すエンドポイント
    """

    prefecture = await get_prefecture_from_coords(location.latitude, location.longitude)
    if not prefecture:
        raise HTTPException(status_code=404, detail="指定された座標から都道府県を特定できませんでした。")
    
    if not GNEWS_API_KEY:
        raise HTTPException(status_code=500, detail="APIキーが設定されていません。")

    gnews_api_url = "https://gnews.io/api/v4/search"
    params = {
        "q": prefecture,
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

            articles = data.get("articles", [])
            if not articles:
                 raise HTTPException(status_code=404, detail=f"「{prefecture}」に関するニュースが見つかりませんでした。")
            
            return articles
        
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"GNews APIへの接続に失敗しました: {e}")