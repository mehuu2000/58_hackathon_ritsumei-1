from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, Any
import os


class LoginRequest(BaseModel):
	email: EmailStr
	password_hash: str


class AuthResponse(BaseModel):
	access_token: Optional[str]
	refresh_token: Optional[str]
	user_id: Optional[str]
	is_authenticated: bool


def get_supabase_client() -> Any:
	try:
		from supabase import create_client  # 遅延インポート
	except ImportError as e:
		raise RuntimeError(
			"Supabase依存の読み込みに失敗しました。'python-jwt' と 'PyJWT' の競合が疑われます。"
		) from e
	url = os.getenv("SUPABASE_URL")
	key = os.getenv("SUPABASE_ANON_KEY")
	if not url or not key:
		raise RuntimeError("SUPABASE_URL と SUPABASE_ANON_KEY を環境変数に設定してください")
	return create_client(url, key)


router = APIRouter(prefix="/auth", tags=["auth"]) 


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
	client = get_supabase_client()
	try:
		result = client.auth.sign_in_with_password({
			"email": payload.email,
			"password": payload.password_hash,
		})
		if not result or not result.session:
			raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが不正です")

		access_token = getattr(result.session, "access_token", None)
		refresh_token = getattr(result.session, "refresh_token", None)
		user_id = getattr(getattr(result, "user", None), "id", None)

		return AuthResponse(
			access_token=access_token,
			refresh_token=refresh_token,
			user_id=user_id,
			is_authenticated=True,
		)
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"ログインエラー: {str(e)}")
