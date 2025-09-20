import httpx

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