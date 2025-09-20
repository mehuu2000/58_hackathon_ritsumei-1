from fastapi import FastAPI
from backend.auth.login import router as login_router
from backend.auth.sign_up import router as signup_router
from backend.auth.account_auth import router as account_auth_router
from backend.news.news_router import router as news_router

app = FastAPI(title="Backend API", version="0.1.0")

app.include_router(signup_router)
app.include_router(login_router)
app.include_router(account_auth_router)
app.include_router(news_router)

# for local run: uvicorn backend.app:app --reload
if __name__ == "__main__":
	import uvicorn
	uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)


