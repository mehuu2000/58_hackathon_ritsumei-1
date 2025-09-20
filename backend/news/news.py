import os
from dotenv import load_dotenv
from fastapi import FastAPI

# .envファイルから環境変数を読み込む
load_dotenv()

# FastAPIアプリを初期化
app = FastAPI()

# GNewsのAPIキーを環境変数から取得
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

# "/" というURLへのリクエストを受け付ける
@app.get("/")
def read_root():
    return {"message": "ニュースAPIへようこそ！"}

# APIキーが読み込めているか確認するためのテスト用エンドポイント
@app.get("/api/check-key")
def check_api_key():
    if GNEWS_API_KEY:
        # セキュリティのため、キーの一部だけを表示
        return {"message": "GNews APIキーが正常に読み込まれました。", "key_start": f"{GNEWS_API_KEY[:4]}..."}
    else:
        return {"message": "GNews APIキーが設定されていません。"}