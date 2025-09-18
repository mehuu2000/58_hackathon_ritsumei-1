import streamlit as st
import folium
from streamlit_folium import st_folium

# ページ設定
st.set_page_config(
    page_title="地図アプリ",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# セッション状態の初期化
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'show_signup' not in st.session_state:
    st.session_state.show_signup = False

# スタイルCSS
st.markdown("""
<style>
    /* Streamlit要素を隠す */
    #MainMenu {display: none !important;}
    footer {display: none !important;}
    header {display: none !important;}
    .stToolbar {display: none !important;}
    .stDeployButton {display: none !important;}
    section[data-testid="stSidebar"] {display: none !important;}
    
    /* 完全フルスクリーン */
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        overflow: hidden !important;
    }
    
    .stApp {
        margin: 0 !important;
        padding: 0 !important;
        height: 100vh !important;
        overflow: hidden !important;
    }
    
    .stAppViewContainer {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        height: 100vh !important;
        top: 0 !important;
        left: 0 !important;
        position: absolute !important;
    }
    
    .main {
        padding: 0 !important;
        margin: 0 !important;
        height: 100vh !important;
    }
    
    .main .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        height: 100vh !important;
    }
    
    /* Streamlitのデフォルト余白を完全に除去 */
    div[data-testid="stVerticalBlock"] {
        gap: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    .element-container {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    div[data-testid="column"] {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    /* 地図を背景に固定 */
    .background-map {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: -1 !important;
        pointer-events: none !important;
    }
    
    /* アプリ名 */
    .app-title {
        position: fixed;
        top: 15vh;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(230, 230, 230, 0.9);
        padding: 0.6rem 1.5rem;
        font-size: clamp(1rem, 4vw, 1.2rem);
        color: #333;
        border-radius: 0.3rem;
        z-index: 999;
        font-weight: normal;
        white-space: nowrap;
        box-sizing: border-box;
    }

    /* 認証フォームコンテナ */
    .auth-overlay {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(70, 70, 70, 0.85);
        padding: 1.5rem;
        border-radius: 0.6rem;
        min-width: 24rem;
        max-width: 90vw;
        width: 28rem;
        z-index: 1000;
        box-sizing: border-box;
    }
    
    /* フォームスタイルをカスタマイズ */
    .auth-overlay .stForm {
        border: none !important;
        padding: 0 !important;
        background: transparent !important;
    }
    
    .auth-overlay .stTextInput > label {
        color: rgba(255, 255, 255, 0.9) !important;
        font-size: 0.8rem !important;
        font-weight: 500 !important;
    }
    
    .auth-overlay .stTextInput > div > div > input {
        background: rgba(240, 240, 240, 0.95) !important;
        border: none !important;
        border-radius: 0.3rem !important;
        padding: 0.75rem !important;
        font-size: 0.9rem !important;
    }
    
    .auth-overlay .stButton > button {
        background: #4CAF50 !important;
        color: white !important;
        border: none !important;
        border-radius: 0.3rem !important;
        padding: 0.75rem !important;
        font-size: 1rem !important;
        font-weight: bold !important;
        width: 100% !important;
        transition: background-color 0.2s ease !important;
    }
    
    .auth-overlay .stButton > button:hover {
        background: #45a049 !important;
    }
    
    .auth-overlay .stButton > button[kind="primary"] {
        background: #4CAF50 !important;
    }
    
    .auth-overlay .stButton > button[kind="secondary"] {
        background: #666 !important;
    }
    
    .auth-overlay .stMarkdown h1 {
        color: white !important;
        text-align: center !important;
        margin-bottom: 1rem !important;
    }
    
    .auth-overlay .stMarkdown h3 {
        color: white !important;
        text-align: center !important;
        margin-bottom: 1rem !important;
    }
    
    /* サインアップリンク風のスタイル */
    .signup-link {
        text-align: center;
        margin-top: 0.5rem;
    }
    
    .signup-link .stButton > button {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border: none !important;
        font-size: 0.75rem !important;
        padding: 0.2rem 0.4rem !important;
        text-decoration: underline !important;
    }
    
    .signup-link .stButton > button:hover {
        color: white !important;
        background: rgba(255, 255, 255, 0.1) !important;
    }
</style>
""", unsafe_allow_html=True)

# 認証されていない場合のログイン画面
if not st.session_state.authenticated:
    # 背景地図を作成
    background_map = folium.Map(
        location=[35.6812, 139.7671],
        zoom_start=13,
        tiles='OpenStreetMap'
    )
    
    # 地図を画面全体に表示（背景として）
    st_folium(background_map, width='100%', height=800, returned_objects=[], key="bg_map")
    
    # 地図を背景に固定するJavaScript（改良版）
    st.markdown("""
    <script>
    function adjustMap() {
        // 地図のiframeを取得
        const mapElements = document.querySelectorAll('iframe[title="streamlit_folium.st_folium"]');
        mapElements.forEach(function(element) {
            element.style.position = 'fixed';
            element.style.top = '0';
            element.style.left = '0';
            element.style.width = '100vw';
            element.style.height = '100vh';
            element.style.zIndex = '-1';
            element.style.pointerEvents = 'none';
            element.style.margin = '0';
            element.style.padding = '0';
            element.style.border = 'none';
        });
        
        // 地図のコンテナも調整
        const mapContainers = document.querySelectorAll('div[data-testid="element-container"]');
        mapContainers.forEach(function(container) {
            if (container.querySelector('iframe[title="streamlit_folium.st_folium"]')) {
                container.style.position = 'fixed';
                container.style.top = '0';
                container.style.left = '0';
                container.style.width = '100vw';
                container.style.height = '100vh';
                container.style.zIndex = '-1';
                container.style.margin = '0';
                container.style.padding = '0';
            }
        });
        
        // Streamlitのルート要素も調整
        const stApp = document.querySelector('.stApp');
        if (stApp) {
            stApp.style.margin = '0';
            stApp.style.padding = '0';
            stApp.style.height = '100vh';
            stApp.style.overflow = 'hidden';
        }
        
        // bodyとhtmlの調整
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.overflow = 'hidden';
    }
    
    // 初回実行
    setTimeout(adjustMap, 100);
    setTimeout(adjustMap, 500);
    setTimeout(adjustMap, 1000);
    
    // レサイズ時にも実行
    window.addEventListener('resize', adjustMap);
    
    // DOM変更監視（Streamlitの再描画対応）
    const observer = new MutationObserver(function() {
        setTimeout(adjustMap, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    </script>
    """, unsafe_allow_html=True)
    
    # アプリ名を表示（固定位置）
    st.markdown('<div class="app-title">アプリ名</div>', unsafe_allow_html=True)
    
    # オーバーレイフォーム（元のデザインに戻す）
    if not st.session_state.show_signup:
        # ログインフォームHTML
        form_html = """
        <div class="auth-overlay">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.3rem;">メールアドレス（ログイン用ID）</label>
                <input type="email" id="email" style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.3rem; font-size: 0.9rem; background: rgba(240, 240, 240, 0.95); box-sizing: border-box;" placeholder="example@email.com">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.3rem;">パスワード</label>
                <input type="password" id="password" style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.3rem; font-size: 0.9rem; background: rgba(240, 240, 240, 0.95); box-sizing: border-box;" placeholder="パスワードを入力">
            </div>
            <button type="button" onclick="
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                if (email && password) {
                    alert('ログイン機能は準備中です（デモ用）\\nメイン画面に進みます');
                    // 実際のログイン処理はここに実装
                } else {
                    alert('メールアドレスとパスワードを入力してください');
                }
            " style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.3rem; background: #4CAF50; color: white; font-size: 1rem; font-weight: bold; cursor: pointer; margin-bottom: 0.5rem; transition: background-color 0.2s ease;">ログイン</button>
            <div style="text-align: center;">
                <span onclick="
                    alert('サインアップ機能は準備中です');
                " style="display: inline-block; color: rgba(255, 255, 255, 0.9); font-size: 0.75rem; cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 0.2rem; transition: color 0.2s ease;">サインアップ</span>
            </div>
        </div>
        """
        st.markdown(form_html, unsafe_allow_html=True)
        
        # Streamlitボタンで実際の機能を提供（隠し要素として）
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            if st.button("🔐 ログイン（デモ）", key="demo_login", use_container_width=True):
                st.session_state.authenticated = True
                st.success("ログインしました！")
                st.rerun()
            
            if st.button("📝 サインアップ画面", key="show_signup", use_container_width=True):
                st.session_state.show_signup = True
                st.rerun()
    
    else:
        # サインアップフォームHTML
        signup_form_html = """
        <div class="auth-overlay">
            <h3 style="color: white; text-align: center; margin-bottom: 1rem;">新規登録</h3>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.3rem;">メールアドレス</label>
                <input type="email" id="new_email" style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.3rem; font-size: 0.9rem; background: rgba(240, 240, 240, 0.95); box-sizing: border-box;" placeholder="example@email.com">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.3rem;">パスワード</label>
                <input type="password" id="new_password" style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.3rem; font-size: 0.9rem; background: rgba(240, 240, 240, 0.95); box-sizing: border-box;" placeholder="パスワードを入力">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.3rem;">パスワード（確認）</label>
                <input type="password" id="confirm_password" style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.3rem; font-size: 0.9rem; background: rgba(240, 240, 240, 0.95); box-sizing: border-box;" placeholder="パスワードを再入力">
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button type="button" onclick="
                    const email = document.getElementById('new_email').value;
                    const password = document.getElementById('new_password').value;
                    const confirm = document.getElementById('confirm_password').value;
                    if (email && password && password === confirm) {
                        alert('登録完了！ログインしてください');
                    } else if (password !== confirm) {
                        alert('パスワードが一致しません');
                    } else {
                        alert('すべての項目を入力してください');
                    }
                " style="flex: 1; padding: 0.75rem; border: none; border-radius: 0.3rem; background: #4CAF50; color: white; font-size: 1rem; font-weight: bold; cursor: pointer;">登録</button>
                <button type="button" onclick="alert('ログイン画面に戻ります')" style="flex: 1; padding: 0.75rem; border: none; border-radius: 0.3rem; background: #666; color: white; font-size: 1rem; cursor: pointer;">ログインに戻る</button>
            </div>
        </div>
        """
        st.markdown(signup_form_html, unsafe_allow_html=True)
        
        # Streamlitボタンで実際の機能
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            if st.button("⬅️ ログインに戻る", key="back_to_login", use_container_width=True):
                st.session_state.show_signup = False
                st.rerun()

else:
    # 認証後のメイン画面
    # サイドバーにログアウトボタン
    with st.sidebar:
        st.write("ようこそ！")
        if st.button("ログアウト"):
            st.session_state.authenticated = False
            st.session_state.show_signup = False
            st.rerun()
    
    # メイン地図表示
    st.title("🗺️ 地図アプリ - メイン画面")
    
    # フルサイズの地図
    main_map = folium.Map(
        location=[35.6812, 139.7671],
        zoom_start=13,
        tiles='OpenStreetMap'
    )
    
    # インタラクティブな地図
    map_data = st_folium(
        main_map, 
        width='100%', 
        height=700,
        returned_objects=["last_object_clicked", "all_drawings"],
        key="main_map"
    )
    
    # 地図クリック情報の表示
    if map_data['last_object_clicked']:
        st.write("最後にクリックした位置:", map_data['last_object_clicked'])