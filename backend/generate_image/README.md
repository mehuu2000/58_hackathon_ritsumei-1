## Freepik 画像生成（Python）

このディレクトリは Freepik の画像生成APIを叩くクライアントとCLIを提供します。

### セットアップ

1) 必要パッケージのインストール

```bash
pip install -r backend/generate_image/requirements.txt
```

2) 環境変数の設定（`.env` 推奨）

`.env`（リポジトリルート）に以下を設定してください。

```
FREEPIK_API_KEY=あなたのAPIキー
# 必要に応じて上書き
# FREEPIK_GENERATE_URL=https://api.freepik.com/v1/ai/mystic
# FREEPIK_AUTH_TYPE=x-api-key   # または bearer
# FREEPIK_OUTPUT_DIR=backend/generate_image/outputs

# Google Drive
# いずれかを設定（ファイルパス or JSON文字列）
GOOGLE_SERVICE_ACCOUNT_FILE=/absolute/path/to/service_account.json
# または
GOOGLE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}

# 任意: 保存先フォルダ（共有ドライブ/マイドライブ）
GOOGLE_DRIVE_FOLDER_ID=xxxxxxxxxxxxxxxxxxxxxxx
```

`.env`を使わない場合は、シェルの環境変数で同名を設定してください。

### 使い方（CLI）

```bash
python -m backend.generate_image.cli "富士山の上に浮かぶ熱気球、シネマティック"
```

オプション:

- `--aspect-ratio`: 例 `widescreen_16_9`, `1:1`
- `--size`: 例 `1024x1024`
- `--n`: 生成枚数（デフォルト1）
- `--out`: 保存先ディレクトリ（未指定は `FREEPIK_OUTPUT_DIR`）
- `--prefix`: ファイル名接頭辞（デフォルト `freepik`）

出力はデフォルトで `backend/generate_image/outputs` にPNGとして保存されます。

### 関数としての利用（Google Driveに保存し、誰でも見れるURLを返す）

```python
from backend.generate_image import generate_and_upload_images, generate_and_upload_image

# 複数枚
urls = generate_and_upload_images(
    prompt="湖畔の星空、長時間露光、フォトリアリスティック",
    size="1024x1024",
    n=2,
    prefix="demo",
    content_type="image/png",
)
print(urls)

# 1枚
url = generate_and_upload_image(
    prompt="富士山の夜明け、映画的、広角",
    size="1024x1024",
    prefix="demo",
)
print(url)
```

### 注意

- Freepik APIのエンドポイントやレスポンス形式はプランや時期により異なる可能性があります。本クライアントは代表的なフィールド（`image_url`, `data[].url`, base64 等）を自動抽出する実装になっています。
- 非同期ジョブ型レスポンスの場合、`job_id` と `status_url`（もしくは `FREEPIK_JOB_STATUS_URL_TEMPLATE`）が返るケースに簡易対応しています。


