import os
import sys
import httpx
import anyio

try:
	from backend.app import app
except ModuleNotFoundError:
	sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
	from backend.app import app

# 疑似データセット（メール -> ユーザーID, ハッシュ化パスワード）
DATASET = {
	"user1@example.com": {
		"password_hash": "hash123",
		"user_id": "uid_1"
	},
	"user2@example.com": {
		"password_hash": "hash456",
		"user_id": "uid_2"
	},
}


# --- Supabaseクライアントの簡易モック ---
class MockSession:
	def __init__(self, access_token: str, refresh_token: str):
		self.access_token = access_token
		self.refresh_token = refresh_token


class MockUser:
	def __init__(self, user_id: str):
		self.id = user_id


class MockAuth:
	def sign_up(self, payload):
		email = payload.get("email")
		password = payload.get("password")
		if email in DATASET:
			# 既に存在
			return type("Res", (), {"user": None, "session": None})
		DATASET[email] = {"password_hash": password, "user_id": f"uid_{len(DATASET)+1}"}
		return type("Res", (), {
			"user": MockUser(DATASET[email]["user_id"]),
			"session": MockSession(access_token=f"at_{email}", refresh_token=f"rt_{email}")
		})

	def sign_in_with_password(self, payload):
		email = payload.get("email")
		password = payload.get("password")
		rec = DATASET.get(email)
		if not rec or rec["password_hash"] != password:
			return type("Res", (), {"session": None, "user": None})
		return type("Res", (), {
			"session": MockSession(access_token=f"at_{email}", refresh_token=f"rt_{email}"),
			"user": MockUser(rec["user_id"])
		})

	def get_user(self, access_token):
		# access_token = at_<email>
		if not access_token.startswith("at_"):
			raise ValueError("invalid token")
		email = access_token[3:]
		if email not in DATASET:
			raise ValueError("invalid user")
		return type("Res", (), {"user": MockUser(DATASET[email]["user_id"])})


class MockClient:
	def __init__(self):
		self.auth = MockAuth()


def monkeypatch_supabase(monkeypatch):
	# backend.auth.* それぞれの get_supabase_client を差し替える
	from backend.auth import sign_up, login, account_auth
	monkeypatch.setattr(sign_up, "get_supabase_client", lambda: MockClient())
	monkeypatch.setattr(login, "get_supabase_client", lambda: MockClient())
	monkeypatch.setattr(account_auth, "get_supabase_client", lambda: MockClient())


# --- テスト ---

def test_signup_login_and_session(monkeypatch):
	monkeypatch_supabase(monkeypatch)

	async def _run():
		transport = httpx.ASGITransport(app=app)
		async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
			# 新規サインアップ
			resp = await client.post("/auth/sign-up", json={"email": "new@example.com", "password_hash": "hashNEW"})
			assert resp.status_code == 200
			body = resp.json()
			assert body["is_authenticated"] in [True, False]
			assert body["user_id"] is not None

			# 既存ユーザーでログイン
			resp = await client.post("/auth/login", json={"email": "user1@example.com", "password_hash": "hash123"})
			assert resp.status_code == 200
			login_body = resp.json()
			assert login_body["is_authenticated"] is True
			assert login_body["access_token"].startswith("at_")

			# セッション判定
			headers = {"Authorization": f"Bearer {login_body['access_token']}"}
			resp = await client.get("/auth/session", headers=headers)
			assert resp.status_code == 200
			session_body = resp.json()
			assert session_body["is_authenticated"] is True
			assert session_body["user_id"] == DATASET["user1@example.com"]["user_id"]

			# トークン無し
			resp = await client.get("/auth/session")
			assert resp.status_code == 200
			assert resp.json()["is_authenticated"] is False

	anyio.run(_run)
