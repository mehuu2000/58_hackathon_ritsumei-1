import httpx
import json

async def get_prefecture_from_coords(lat: float, lon: float) -> str | None:
    """国土地理院のAPIを使い、緯度経度から都道府県名を取得する"""
    gsi_api_url = f"https://mreversegeocoding.gsi.go.jp/reverse-geocoding/ds/revgeoinfo?lat={lat}&lon={lon}&outtype=json"
    
    async with httpx.AsyncClient() as client:
        
        print("--- GSI Service Debug ---")
        print(f"Requesting URL: {gsi_api_url}")
        
        try:
            response = await client.get(gsi_api_url)
            print(f"Response Status Code: {response.status_code}")
            
            try:
                # レスポンスがJSON形式であれば、整形して表示
                print(f"Response Body: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            except json.JSONDecodeError:
                # JSONでなければそのまま表示
                print(f"Response Body (not JSON): {response.text}")
            print("-------------------------")

            response.raise_for_status()
            data = response.json()
            
            # APIの応答から都道府県名 (pref) を取り出す
            if "results" in data and "pref" in data["results"]:
                return data["results"]["pref"]
            return None # 日本国外など、取得できなかった場合
        except httpx.RequestError:
            # 通信に失敗した場合
            return None