print("★★★★★ news_router.py is being loaded! ★★★★★")
import os
import httpx
import uuid
import asyncio
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, Field
from backend.news.services.gsi_service import get_prefecture_from_coords
# get_articles_by_prefecture をインポート
from backend.news.services.db_service import save_article_if_not_exists, get_articles_by_prefecture

# --- データ構造（Pydanticモデル）の定義 ---

# GNews APIのレスポンス形式に合わせたモデル
class NewsSource(BaseModel):
    name: str | None = None
    url: str | None = None
class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str
    image: str | None = None
    source: NewsSource | None = None
    publishedAt: str | None = None

# --- ▼▼▼ ここから追加 ▼▼▼ ---
# データベースのテーブル構造に合わせたレスポンスモデル
class ArticleInDB(BaseModel):
    id: str
    title: str | None = None
    description: str | None = None
    content: str | None = None
    url: str | None = None
    image_url: str | None = None
    published_at: str | None = None
    source_name: str | None = None
    source_url: str | None = None
    prefectures: str | None = None
    
    class Config:
        from_attributes = True # ORMオブジェクトからでもPydanticモデルに変換できるようにする設定
# --- ▲▲▲ ここまで追加 ▲▲▲ ---

class LocationRequest(BaseModel):   
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

router = APIRouter(prefix="/news", tags=["news"])

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

@router.get("/test")
def hello_check():
    return {"message": "News router is loaded correctly!"}

# --- ▼▼▼ レスポンスモデルを変更 ▼▼▼ ---
@router.post("/get-news-by-location", response_model=List[ArticleInDB])
async def get_news_by_location(location: LocationRequest):
    """
    指定された都道府県のニュースをGNewsから取得・DB保存し、
    DBに存在するその都道府県の全ニュースを返すエンドポイント
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
        "max": 10, # 少し多めに取得しても良いでしょう
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(gnews_api_url, params=params)
            response.raise_for_status()
            data = response.json()

        articles = data.get("articles", [])
        if articles:
            save_tasks = []
            for article in articles:
                article_to_save = {
                    "id": str(uuid.uuid4()),
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "content": article.get("content"),
                    "url": article.get("url"),
                    "image_url": article.get("image"),
                    "published_at": article.get("publishedAt"),
                    "source_name": article.get("source", {}).get("name"),
                    "source_url": article.get("source", {}).get("url"),
                    "prefectures": prefecture
                }
                save_tasks.append(save_article_if_not_exists(article_to_save))
            
            await asyncio.gather(*save_tasks)
        
        # --- ▼▼▼ 返り値をDBから取得した全記事に変更 ▼▼▼ ---
        all_articles_in_db = await get_articles_by_prefecture(prefecture)
        
        if not all_articles_in_db and not articles:
            raise HTTPException(status_code=404, detail=f"「{prefecture}」に関するニュースが見つかりませんでした。")
            
        return all_articles_in_db
        # --- ▲▲▲ ここまで変更 ▲▲▲ ---

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"GNews APIへの接続に失敗しました: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"内部サーバーエラー: {e}")