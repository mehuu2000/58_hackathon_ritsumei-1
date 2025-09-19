import os
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --- 設定 ---
# FastAPIアプリの初期化
app = FastAPI(
    title="地域ニュース取得API",
    description="緯度経度からその場所の都道府県ニュースを取得するAPIです。"
)

# NewsAPIのAPIキーをここに設定してください
# 本番環境では環境変数など、より安全な方法で管理するのが一般的です
NEWS_API_KEY = "ここにあなたのNewsAPIキーを貼り付け" 

# --- データ構造の定義 (Pydanticモデル) ---
# フロントエンドから受け取るデータの方（スキーマ）を定義
class LocationRequest(BaseModel):
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

# フロントエンドに返すニュース記事のデータの方を定義
class NewsArticle(BaseModel):
    title: str
    description: str | None = None # descriptionは無い場合もあるのでNoneを許容
    url: str

# --- 外部API連携のロジック ---
# 緯度経度から都道府県名を取得する非同期関数
async def get_prefecture_from_coords(lat: float, lon: float) -> str | None:
    """国土地理院APIを呼び出し、緯度経度から都道府県名を取得する"""
    gsi_api_url = f"https://mreversegeocoding.gsi.go.jp/reverse-geocoding/ds/revgeoinfo?lat={lat}&lon={lon}&outtype=json"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(gsi_api_url)
            response.raise_for_status() # HTTPエラーがあれば例外を発生させる
            data = response.json()
            
            # 結果から都道府県名を取得
            # dataの中に'results'があり、その中に'pref'があればそれを返す
            if "results" in data and "pref" in data["results"]:
                return data["results"]["pref"]
            else:
                return None # 日本国外など、取得できなかった場合
        except httpx.RequestError as e:
            print(f"国土地理院APIへのリクエストでエラーが発生: {e}")
            return None

# 都道府県名からニュースを取得する非同期関数
async def get_news_for_prefecture(prefecture: str) -> list[NewsArticle]:
    """NewsAPIを呼び出し、指定された都道府県のニュースを取得する"""
    news_api_url = "https://newsapi.org/v2/everything"
    params = {
        "q": f"{prefecture} AND (災害 OR イベント OR 経済 OR 観光)", # 検索キーワードを工夫
        "apiKey": NEWS_API_KEY,
        "language": "jp", # 言語を日本語に指定
        "sortBy": "publishedAt", # 公開日でソート
        "pageSize": 10 # 取得する記事の数
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(news_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # 取得した記事をNewsArticleモデルのリストに変換
            articles = [
                NewsArticle(
                    title=article.get("title", "タイトルなし"),
                    description=article.get("description"),
                    url=article.get("url", "")
                )
                for article in data.get("articles", [])
            ]
            return articles
        except httpx.RequestError as e:
            print(f"NewsAPIへのリクエストでエラーが発生: {e}")
            return []

# --- APIエンドポイントの定義 ---
@app.post("/api/get-news-by-location", response_model=list[NewsArticle])
async def get_news_by_location(location: LocationRequest):
    """
    緯度経度を受け取り、その場所の都道府県ニュースを返すエンドポイント
    """
    # 1. 緯度経度から都道府県を取得
    prefecture = await get_prefecture_from_coords(location.latitude, location.longitude)
    
    if not prefecture:
        raise HTTPException(status_code=404, detail="指定された座標から日本の都道府県が見つかりませんでした。")
    
    # 2. 都道府県のニュースを取得
    news_articles = await get_news_for_prefecture(prefecture)
    
    if not news_articles:
        raise HTTPException(status_code=404, detail=f"{prefecture}のニュースが見つかりませんでした。")
        
    # 3. ニュースを返す
    return news_articles