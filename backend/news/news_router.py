from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# --- 他のファイルから必要なサービスをインポート ---
from .gsi_service import get_prefecture_from_coords
from .gnews_service import get_news_for_prefecture


# --- データ構造（Pydanticモデル）の定義 ---
class LocationRequest(BaseModel):
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str

# ---ルーターの作成 ---
router = APIRouter(prefix="/news", tags=["news"])


# --- エンドポイントの定義 ---
@router.post("/get-news-by-location", response_model=list[NewsArticle])
async def get_news_by_location(location: LocationRequest):
    """緯度経度を受け取り、その場所の都道府県ニュースを返す"""
    
    # 1. 国土地理院サービスを呼び出し
    prefecture = await get_prefecture_from_coords(location.latitude, location.longitude)
    if not prefecture:
        raise HTTPException(status_code=404, detail="座標から都道府県が見つかりません。")
    
    # 2. GNewsサービスを呼び出し
    news_articles = await get_news_for_prefecture(prefecture)
    if not news_articles:
        raise HTTPException(status_code=404, detail=f"{prefecture}のニュースが見つかりません。")
        
    return news_articles