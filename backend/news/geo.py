import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --- FastAPIアプリの初期化 ---
app = FastAPI(
    title="都道府県コード取得API",
    description="国土地理院APIを利用して、緯度経度から都道府県コードを取得します。"
)

# --- データ構造（モデル）の定義 ---

# リクエストとして受け取るJSONの型を定義
class LocationRequest(BaseModel):
    latitude: float = Field(..., example=35.6895, description="緯度")
    longitude: float = Field(..., example=139.6917, description="経度")

# レスポンスとして返すJSONの型を定義
class PrefectureResponse(BaseModel):
    prefecture_code: str = Field(..., example="13", description="都道府県コード (JIS X 0401)")

# --- APIエンドポイントの定義 ---

@app.post("/api/prefecture-code", response_model=PrefectureResponse)
async def get_prefecture_code_from_location(location: LocationRequest):
    """
    緯度経度から市区町村コードを取得し、そこから都道府県コードを抽出して返す。
    """
    # 1. 緯度経度から市区町村コード(muniCd)を取得する
    gsi_api_url = f"https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat={location.latitude}&lon={location.longitude}"
    
    muni_cd = None
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(gsi_api_url)
            # APIからのレスポンスがエラーだった場合は例外を発生させる
            response.raise_for_status()
            data = response.json()
            
            # JSONの構造をチェックし、安全にmuniCdを取得
            if "results" in data and "muniCd" in data["results"]:
                muni_cd = data["results"]["muniCd"]
                
        except httpx.RequestError as e:
            # 国土地理院APIとの通信に失敗した場合
            raise HTTPException(status_code=503, detail=f"地理院APIへの接続に失敗しました: {e}")
        except Exception as e:
            # その他の予期せぬエラー
            raise HTTPException(status_code=500, detail=f"サーバー内部でエラーが発生しました: {e}")

    # 2. 市区町村コードが取得できなかった場合はエラーを返す
    if not muni_cd:
        raise HTTPException(status_code=404, detail="指定された座標から市区町村コードが見つかりませんでした。")

    # 3. 市区町村コードの先頭2桁を都道府県コードとして抽出する
    prefecture_code = muni_cd[:2]

    # 4. 結果をレスポンスとして返す
    return PrefectureResponse(prefecture_code=prefecture_code)