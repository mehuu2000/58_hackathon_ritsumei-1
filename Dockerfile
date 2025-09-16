# Python 3.11の公式イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Pythonの依存関係をコピーしてインストール
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# アプリケーションファイルをコピー
COPY . .

# Streamlitが使用するポートを公開
EXPOSE 8501

# ヘルスチェックを追加
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health

# Streamlitアプリを起動
ENTRYPOINT ["streamlit", "run", "streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]
