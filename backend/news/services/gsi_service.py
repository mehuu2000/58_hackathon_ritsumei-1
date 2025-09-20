import httpx
import json

# JIS X 0401 都道府県コードとISO 3166-2コードの対応表を参考に作成
# https://ja.wikipedia.org/wiki/ISO_3166-2:JP
ISO_JP_PREF_MAP = {
    "JP-01": "北海道", "JP-02": "青森県", "JP-03": "岩手県", "JP-04": "宮城県",
    "JP-05": "秋田県", "JP-06": "山形県", "JP-07": "福島県", "JP-08": "茨城県",
    "JP-09": "栃木県", "JP-10": "群馬県", "JP-11": "埼玉県", "JP-12": "千葉県",
    "JP-13": "東京都", "JP-14": "神奈川県", "JP-15": "新潟県", "JP-16": "富山県",
    "JP-17": "石川県", "JP-18": "福井県", "JP-19": "山梨県", "JP-20": "長野県",
    "JP-21": "岐阜県", "JP-22": "静岡県", "JP-23": "愛知県", "JP-24": "三重県",
    "JP-25": "滋賀県", "JP-26": "京都府", "JP-27": "大阪府", "JP-28": "兵庫県",
    "JP-29": "奈良県", "JP-30": "和歌山県", "JP-31": "鳥取県", "JP-32": "島根県",
    "JP-33": "岡山県", "JP-34": "広島県", "JP-35": "山口県", "JP-36": "徳島県",
    "JP-37": "香川県", "JP-38": "愛媛県", "JP-39": "高知県", "JP-40": "福岡県",
    "JP-41": "佐賀県", "JP-42": "長崎県", "JP-43": "熊本県", "JP-44": "大分県",
    "JP-45": "宮崎県", "JP-46": "鹿児島県", "JP-47": "沖縄県"
}

async def get_prefecture_from_coords(lat: float, lon: float) -> str | None:
    """OpenStreetMap(Nominatim)を使い、緯度経度から都道府県名を取得する"""
    osm_api_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    headers = {"User-Agent": "58_Hackathon_Ritsumei_App/1.0 (contact@example.com)"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(osm_api_url, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if "address" in data and "ISO3166-2-lvl4" in data["address"]:
                iso_code = data["address"]["ISO3166-2-lvl4"]
                # ISOコードをキーにして、対応表から都道府県名を取得
                return ISO_JP_PREF_MAP.get(iso_code)

            return None
        except httpx.RequestError:
            return None