import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

load_dotenv()

# --- 設定 ---
app = FastAPI(
    title="地域ニュース取得API (GNews版)",
    description="緯度経度からその場所の都道府県ニュースをGNews APIを使って取得します。"
)

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

if not GNEWS_API_KEY:
    raise ValueError("環境変数 'GNEWS_API_KEY' が設定されていません。")

class LocationRequest(BaseModel):
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str


# --- 外部APIと通信する関数 ---
async def get_prefecture_from_coords(lat: float, lon: float) -> str | None:
    """国土地理院APIを使い、緯度経度から都道府県名を取得する"""
    gsi_api_url = f"https://mreversegeocoding.gsi.go.jp/reverse-geocoding/ds/revgeoinfo?lat={lat}&lon={lon}&outtype=json"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(gsi_api_url)
            response.raise_for_status()
            data = response.json()
            
            if "results" in data and "pref" in data["results"]:
                return data["results"]["pref"]
            return None
        except httpx.RequestError:
            return None

# 都道府県名からニュースを取得する (GNews API版)
async def get_news_for_prefecture(prefecture: str) -> list[NewsArticle]:
    """GNews APIを使い、指定された都道府県のニュースを取得する"""
    gnews_api_url = "https://gnews.io/api/v4/search"
    params = {
        "q": prefecture,
        "token": GNEWS_API_KEY,
        "lang": "ja",
        "country": "jp",
        "max": 10,
        "sortby": "publishedAt",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(gnews_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # GNews APIのレスポンス構造も同じ "articles" キーを持つ
            return [
                NewsArticle(
                    title=article.get("title", ""),
                    description=article.get("description"),
                    url=article.get("url", "")
                )
                for article in data.get("articles", [])
            ]
        except httpx.RequestError:
            return []


@app.post("/api/get-news-by-location", response_model=list[NewsArticle])
async def get_news_by_location(location: LocationRequest):
    """緯度経度を受け取り、その場所の都道府県ニュースを返す"""
    prefecture = await get_prefecture_from_coords(location.latitude, location.longitude)
    
    if not prefecture:
        raise HTTPException(status_code=404, detail="座標から都道府県が見つかりません。")
    
    news_articles = await get_news_for_prefecture(prefecture)
    
    if not news_articles:
        raise HTTPException(status_code=404, detail=f"{prefecture}のニュースが見つかりません。")
        
    return news_articles