import httpx
import json

async def get_prefecture_from_coords(lat: float, lon: float) -> str | None:
    """OpenStreetMap(Nominatim)を使い、緯度経度から都道府県名を取得する"""
    osm_api_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    headers = {"User-Agent": "58_Hackathon_Ritsumei_App/1.0 (contact@example.com)"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(osm_api_url, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # ▼▼▼ ここのロジックを修正 ▼▼▼
            if "address" in data:
                address = data["address"]
                # まず 'state' を探し、なければ 'county' を探す
                prefecture = address.get("state") or address.get("county")
                
                if prefecture:
                    return prefecture

            # 見つからなかった場合、デバッグのために応答全体をログに出力
            print("[OSM Service] Prefecture not found in 'state' or 'county'.")
            print(f"Full Response Body: {json.dumps(data, indent=2, ensure_ascii=False)}")
            return None
            # ▲▲▲ ここまで ▲▲▲

        except httpx.RequestError as e:
            print(f"!!!!!! [OSM Service] ERROR: A request error occurred. !!!!!!")
            print(f"Error details: {e}")
            return None