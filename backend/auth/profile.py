from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from typing import Optional
import os
from urllib.parse import urlencode

router = APIRouter(prefix="/auth", tags=["auth"])

def get_supabase_client():
    from supabase import create_client
    url = os.getenv("SUPABASE_URL")
    # サーバー側はサービスロールキーを優先（RLSをバイパス）。無ければANONで動作
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    return create_client(url, key)


def _success_redirect_base() -> str:
    # 新: AUTH_REDIRECT_SUCCESS_URL があれば優先
    base = os.getenv("AUTH_REDIRECT_SUCCESS_URL")
    if base:
        return base.rstrip("/")
    # 互換: FRONTEND_REDIRECT_URL があれば /auth-success を付与
    legacy = os.getenv("FRONTEND_REDIRECT_URL", "http://localhost:3000")
    return f"{legacy.rstrip('/')}/auth-success"


def _error_redirect_base() -> str:
    # 新: AUTH_REDIRECT_ERROR_URL があれば優先
    base = os.getenv("AUTH_REDIRECT_ERROR_URL")
    if base:
        return base.rstrip("/")
    # 互換: FRONTEND_REDIRECT_URL があれば /auth-error を付与
    legacy = os.getenv("FRONTEND_REDIRECT_URL", "http://localhost:3000")
    return f"{legacy.rstrip('/')}/auth-error"

@router.get("/callback", response_class=HTMLResponse)
async def auth_callback_bridge() -> HTMLResponse:
    """Supabase が #fragment でトークンを付与するため、
    クライアント側でハッシュをクエリに変換して /auth/callback/complete に橋渡しする。
    """
    success_complete_path = "/auth/callback/complete"
    error_base = _error_redirect_base()
    html = f"""
<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <title>Redirecting...</title>
    <meta http-equiv=\"refresh\" content=\"3;url={error_base}?error=no_token&description=アクセストークンがありません\" />
  </head>
  <body>
    <script>
      (function() {{
        try {{
          var hash = window.location.hash || "";
          var frag = hash.startsWith('#') ? hash.substring(1) : hash;
          var sp = new URLSearchParams(frag);
          var q = new URLSearchParams();
          var keys = ["access_token","refresh_token","token_type","expires_in","expires_at","type"];
          var hasToken = false;
          for (var i=0;i<keys.length;i++) {{
            var k = keys[i];
            var v = sp.get(k);
            if (v) {{ q.set(k, v); }}
            if (k === 'access_token' && v) hasToken = true;
          }}
          if (!hasToken) {{
            window.location.replace("{error_base}?" + new URLSearchParams({{error:'no_token', description:'アクセストークンがありません'}}).toString());
            return;
          }}
          var next = "{success_complete_path}?" + q.toString();
          window.location.replace(next);
        }} catch (e) {{
          window.location.replace("{error_base}?" + new URLSearchParams({{error:'bridge_error', description:String(e)}}).toString());
        }}
      }})();
    </script>
    Redirecting...
  </body>
</html>
"""
    return HTMLResponse(content=html)


@router.get("/callback/complete")
async def handle_auth_callback(request: Request):
    """メール確認後、クエリに載ったトークンでプロファイル作成"""
    try:
        # URL パラメータからアクセストークンを取得
        token = request.query_params.get('access_token')
        refresh_token = request.query_params.get('refresh_token')
        error = request.query_params.get('error')
        error_description = request.query_params.get('error_description')
        
        # エラーがある場合
        if error:
            q = {"error": error}
            if error_description:
                q["description"] = error_description
            error_url = f"{_error_redirect_base()}?{urlencode(q)}"
            return RedirectResponse(url=error_url)
        
        # トークンがない場合
        if not token:
            error_url = f"{_error_redirect_base()}?{urlencode({'error': 'no_token', 'description': 'アクセストークンがありません'})}"
            return RedirectResponse(url=error_url)
        
        client = get_supabase_client()
        
        # ユーザー情報を取得
        user_resp = client.auth.get_user(token)
        user = user_resp.user
        
        if not user:
            error_url = f"{_error_redirect_base()}?{urlencode({'error': 'invalid_user', 'description': 'ユーザー情報を取得できませんでした'})}"
            return RedirectResponse(url=error_url)
        
        if not user.email_confirmed_at:
            error_url = f"{_error_redirect_base()}?{urlencode({'error': 'email_not_confirmed', 'description': 'メール確認が完了していません'})}"
            return RedirectResponse(url=error_url)
        
        # サービスロールキーが無い場合は、ユーザートークンでPostgRESTに認可付与（RLSポリシーが必要）
        if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
            try:
                client.postgrest.auth(token)
            except Exception:
                pass

        # 既存プロファイルをチェック
        existing = client.table('users').select('uid').eq('uid', user.id).execute()
        
        if not existing.data:
            # users テーブルにプロファイルを作成
            result = client.table('users').insert({
                'uid': user.id,
                'email': user.email,
                'display_name': user.id,  # uid で仮置き
                'token': 0,
                'created_at': 'now()'
            }).execute()
            
            if not result.data:
                error_url = f"{_error_redirect_base()}?{urlencode({'error': 'profile_creation_failed', 'description': 'プロファイルの作成に失敗しました'})}"
                return RedirectResponse(url=error_url)
        
        # 成功時：フロントエンドにリダイレクト（トークン付き）
        params = {"access_token": token, "user_id": user.id}
        if refresh_token:
            params["refresh_token"] = refresh_token
        success_url = f"{_success_redirect_base()}?{urlencode(params)}"
        return RedirectResponse(url=success_url)
        
    except Exception as e:
        # 予期しないエラー
        error_url = f"{_error_redirect_base()}?{urlencode({'error': 'internal_error', 'description': str(e)})}"
        return RedirectResponse(url=error_url)

