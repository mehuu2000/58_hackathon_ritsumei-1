print("★★★★★ news_router.py is being loaded! ★★★★★")
import os
import httpx
import uuid
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, Field
from backend.news.services.gsi_service import get_prefecture_from_coords
from backend.news.services.db_service import save_article_if_not_exists

# --- データ構造（Pydanticモデル）の定義 ---
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

class LocationRequest(BaseModel):   
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

# --- APIRouterの作成 ---
# APIRouterを使うと、機能をファイルごとに分割できます
router = APIRouter(prefix="/news", tags=["news"])

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

@router.get("/test")
def hello_check():
    return {"message": "News router is loaded correctly!"}

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
            
            for article in articles:
                # データベースの設計図に合わせてデータを整形
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
                # ループの中で、1件ずつデータベース保存サービスを呼び出す
                await save_article_if_not_exists(article_to_save)
            
            # ★ すべてのループ処理が終わった後に、結果を返す
            return articles
        
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"GNews APIへの接続に失敗しました: {e}")
    
            # データベース保存サービスを呼び出す
