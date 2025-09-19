# 58_Hackathon_Ritsumei

## DockerでFastAPIサーバーを起動する

前提:
- Docker / Docker Compose が利用可能であること
- `.env` に必要な環境変数を設定していること（`.env.template` を参考）

主要環境変数（例）:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- FREEPIK_API_KEY (または FREEPIK_TOKEN)
- R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ACCOUNT_ID / R2_BUCKET / R2_PUBLIC_BASE_URL

### 1) ビルド & 起動
```bash
# 初回または変更時
docker compose up -d --build
```

### 2) 動作確認
- APIドキュメント: http://localhost:8000/docs

### 3) ログ
```bash
docker compose logs -f api
```

### 4) 停止
```bash
docker compose down
```

### 備考
- アプリのエントリポイントは `uvicorn backend.app:app` です。
- 依存関係は `backend/requirements.txt` に定義しています。
- 本番運用時は `--reload` を外してCPUワーカー数などを調整してください。