from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Any
import os


class AuthCheckResponse(BaseModel):
	is_authenticated: bool
	user_id: Optional[str]


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


@router.get("/session", response_model=AuthCheckResponse)
async def check_session(authorization: Optional[str] = Header(default=None, alias="Authorization")) -> AuthCheckResponse:
	# Authorization: Bearer <access_token>
	if not authorization or not authorization.lower().startswith("bearer "):
		return AuthCheckResponse(is_authenticated=False, user_id=None)

	access_token = authorization.split(" ", 1)[1].strip()
	client = get_supabase_client()
	try:
		# JWT検証用にauth.get_userを使用
		user_resp = client.auth.get_user(access_token)
		user_id = getattr(getattr(user_resp, "user", None), "id", None)
		if not user_id:
			return AuthCheckResponse(is_authenticated=False, user_id=None)
		return AuthCheckResponse(is_authenticated=True, user_id=user_id)
	except Exception:
		# アクセストークンが無効/期限切れ
		return AuthCheckResponse(is_authenticated=False, user_id=None)
