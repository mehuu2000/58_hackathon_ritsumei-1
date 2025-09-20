import os
from supabase import create_client, Client
from typing import Dict, Any

def get_supabase_client() -> Client:
    """Supabaseクライアントを初期化して返す"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("SupabaseのURLとキーを.envファイルに設定してください。")
    return create_client(url, key)

async def save_article_if_not_exists(article_data: Dict[str, Any]):
    """
    指定された記事がまだ存在しない場合のみ、データベースに保存する。
    """
    supabase = get_supabase_client()
    table_name = "news"  # ★ Supabaseで作成したテーブル名に合わせてください

    try:
        # 1. 記事のURLがすでに存在するかどうかを確認
        existing = supabase.table(table_name).select("id").eq("url", article_data["url"]).execute()
        
        # 既に存在する場合は何もせずに処理を終了
        if existing.data:
            print(f"Article already exists: {article_data['url']}")
            return {"status": "skipped", "data": existing.data[0]}

        # 2. 存在しない場合は、新しい記事として挿入
        response = supabase.table(table_name).insert(article_data).execute()
        
        print(f"Article saved: {article_data['url']}")
        return {"status": "saved", "data": response.data[0]}

    except Exception as e:
        print(f"Database error: {e}")
        return {"status": "error", "error": str(e)}