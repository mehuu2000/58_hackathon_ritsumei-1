import os
from supabase import create_client, Client
from typing import Dict, Any, List

def get_supabase_client() -> Client:
    """Supabaseクライアントを初期化して返す"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("SupabaseのURLとキーを.envファイルに設定してください。")
    return create_client(url, key)

async def save_article_if_not_exists(article_data: Dict[str, Any]):

    try:
        supabase = get_supabase_client()
        table_name = "news" 
        # 1. 記事のURLがすでに存在するかどうかを確認
        existing = supabase.table(table_name).select("id").eq("url", article_data["url"]).execute()
        
        # 既に存在する場合は何もせずに処理を終了
        if existing.data:
            print(f"Article already exists: {article_data['url']}")
            return {"status": "skipped", "data": existing.data[0]}

        # 2. 存在しない場合は、新しい記事として挿入
        response = supabase.table(table_name).insert(article_data).execute()
        
        # PostgRESTのAPI応答をチェック
        if response.data:
            print(f"Article saved successfully: {article_data['url']}")
            return {"status": "saved", "data": response.data[0]}
        else:
            # response.errorがある場合など
            print(f"Database insert failed, but no exception was raised. Response: {response}")
            return {"status": "error", "error": "Insert failed without exception."}

        print(f"Article saved: {article_data['url']}")
        return {"status": "saved", "data": response.data[0]}

    except Exception as e:
        # ★ エラー発生時に、より詳細な情報を出力する
        print("!!!!!! DATABASE SERVICE ERROR !!!!!!")
        print(f"An exception occurred: {type(e).__name__}")
        print(f"Error details: {e}")
        print(f"Data being processed: {article_data}")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return {"status": "error", "error": str(e)}
    
async def get_articles_by_prefecture(prefecture: str) -> List[Dict[str, Any]]:
    """
    指定された都道府県の記事をデータベースからすべて取得する
    """
    try:
        supabase = get_supabase_client()
        table_name = "news"
        # "prefectures"カラムが指定された都道府県と一致するレコードをすべて選択
        response = supabase.table(table_name).select("*").eq("prefectures", prefecture).execute()
        
        if response.data:
            return response.data
        return []
    except Exception as e:
        print("!!!!!! DATABASE SERVICE ERROR (get_articles_by_prefecture) !!!!!!")
        print(f"An exception occurred: {type(e).__name__}")
        print(f"Error details: {e}")
        print(f"Prefecture being processed: {prefecture}")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return []