from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, Any
import os


class SignUpRequest(BaseModel):
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


@router.post("/sign-up", response_model=AuthResponse)
async def sign_up(payload: SignUpRequest) -> AuthResponse:
	client = get_supabase_client()
	try:
		# 注意: SupabaseのAuthは通常は平文パスワードを想定します。
		# ここでは要件に従い、既にハッシュ済みの文字列をそのまま保存します。
		result = client.auth.sign_up({
			"email": payload.email,
			"password": payload.password_hash,
		})
		if not result or not result.user:
			raise HTTPException(status_code=400, detail="サインアップに失敗しました")

		access_token = getattr(result.session, "access_token", None) if result.session else None
		refresh_token = getattr(result.session, "refresh_token", None) if result.session else None
		user_id = getattr(result.user, "id", None)

		return AuthResponse(
			access_token=access_token,
			refresh_token=refresh_token,
			user_id=user_id,
			is_authenticated=bool(result.session),
		)
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"サインアップエラー: {str(e)}")
