ps:
	docker compose ps

up:
	docker compose up -d

build:
	docker compose build --no-cache

up-build:
	docker compose up --build -d --force-recreate

down:
	docker compose down

stop:
	docker compose stop

restart:
	@make stop
	@make up

logs:
	docker compose logs -f

mac-app:
	open http://localhost:8501