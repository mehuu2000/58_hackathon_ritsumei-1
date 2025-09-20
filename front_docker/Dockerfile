# Node.js 22 slim ベース
FROM node:22-slim

# 作業ディレクトリ
WORKDIR /app

ENV NODE_ENV=development

# 依存関係を先にインストール（レイヤキャッシュ有効化）
COPY front/package.json front/package-lock.json ./
RUN npm ci && npm cache clean --force

# アプリソースをコピー
COPY front/. .

# Next.js 開発サーバーポート
EXPOSE 3000

# 外部アクセス可能なホスト/ポートで起動
CMD ["npm", "run", "dev", "--", "-p", "3000", "-H", "0.0.0.0"]