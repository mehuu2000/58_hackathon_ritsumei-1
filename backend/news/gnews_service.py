import os
import httpx
from dotenv import load_dotenv
# ★ インポート元を変更
from backend.news.news_router import NewsArticle

# .envファイルから環境変数を読み込む
load_dotenv()

# 環境変数からAPIキーを取得
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

if not GNEWS_API_KEY:
    raise ValueError("環境変数 'GNEWS_API_KEY' が設定されていません。")

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