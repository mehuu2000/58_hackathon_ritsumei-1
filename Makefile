### フロントエンド関連のコマンド ###

# フロントエンドのDockerイメージをビルドして起動
front-build:
	(cd front_docker ; docker compose up -d --build)

# フロントエンドのDockerコンテナを起動（ビルド済み前提）
front-up:
	(cd front_docker ; docker compose up -d)

# フロントエンドのDockerコンテナを停止
front-stop:
	(cd front_docker ; docker compose stop)

# フロントエンドのDockerコンテナを再起動
front-restart: front-stop front-up

### バックエンド関連のコマンド ###

# バックエンドのDockerイメージをビルドして起動
backend-build:
	(cd backend ; docker compose up -d --build)

# バックエンドのDockerコンテナを起動（ビルド済み前提）
backend-up:
	(cd backend ; docker compose up -d)

# バックエンドのDockerコンテナを停止
backend-stop:
	(cd backend ; docker compose stop)

# バックエンドのDockerコンテナを再起動
backend-restart: backend-stop backend-up

### フロント・バック統合コマンド ###

# フロントエンドとバックエンドの両方をビルド
build: front-build backend-build

# フロントエンドとバックエンドの両方を起動
up: front-up backend-up

# フロントエンドとバックエンドの両方を停止
stop: front-stop backend-stop

# フロントエンドとバックエンドの両方を再起動
restart: stop up

# ブラウザでアプリケーションを開く（OS別対応）
open-browser:
ifeq ($(OS),Windows_NT)
	start http://localhost:3000
else
	open http://localhost:3000
endif

# アプリケーションを起動してブラウザを開く
run: up open-browser

# アプリケーションをビルドして起動し、ブラウザを開く
start: build run

# アプリケーションのURLを表示
url:
	@echo "http://localhost:3000"



