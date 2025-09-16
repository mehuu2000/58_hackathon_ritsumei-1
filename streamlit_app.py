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

# シンプルなCSS
st.markdown("""
<style>
    /* Streamlit要素を隠す */
    #MainMenu {display: none !important;}
    footer {display: none !important;}
    header {display: none !important;}
    .stToolbar {display: none !important;}
    .stDeployButton {display: none !important;}
    section[data-testid="stSidebar"] {display: none !important;}
    
    /* 全体レイアウト */
    .stAppViewContainer {
        padding: 0 !important;
        max-width: 100% !important;
    }
    
    .main .block-container {
        padding: 0 !important;
        max-width: 100% !important;
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
</style>
""", unsafe_allow_html=True)

# 背景地図
background_map = folium.Map(
    location=[35.6812, 139.7671],
    zoom_start=13,
    tiles='OpenStreetMap'
)

# 地図を画面全体に表示
st_folium(background_map, width='100%', height=800, returned_objects=[], key="bg_map")

# アプリ名
st.markdown('<div class="app-title">アプリ名</div>', unsafe_allow_html=True)

# CSSでFlexboxスタイルを定義
st.markdown('''
<style>
.flex-form {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(70, 70, 70, 0.85);
    padding: 1.5rem;
    border-radius: 0.6rem;
    min-width: 20rem;
    max-width: 90vw;
    width: fit-content;
    z-index: 1000;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.flex-input {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 0.3rem;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.95);
    box-sizing: border-box;
    min-width: 0;
}

.flex-button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 0.3rem;
    background: #4CAF50;
    color: white;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    box-sizing: border-box;
    transition: background-color 0.2s ease;
    min-width: 0;
}

.flex-button:hover {
    background: #45a049;
}

.flex-link {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    cursor: pointer;
    text-align: center;
    padding: 0.5rem;
    transition: color 0.2s ease;
}

.flex-link:hover {
    color: white;
}
</style>
''', unsafe_allow_html=True)

# 短いHTMLでフォームを作成
st.markdown('''
<div class="flex-form">
    <input type="email" id="email" placeholder="メールアドレス（ログイン用ID）" class="flex-input">
    <input type="password" id="password" placeholder="パスワード" class="flex-input">
    <button onclick="handleLogin()" class="flex-button">ログイン</button>
    <div onclick="handleSignin()" class="flex-link">サインイン</div>
</div>
''', unsafe_allow_html=True)

# JavaScript
st.markdown('''
<script>
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        alert('ログイン機能は準備中です');
    } else {
        alert('メールアドレスとパスワードを入力してください');
    }
}

function handleSignin() {
    alert('サインイン機能は準備中です');
}
</script>
''', unsafe_allow_html=True)

# 地図を背景に固定するJavaScript
st.markdown("""
<script>
setTimeout(function() {
    const mapElements = document.querySelectorAll('iframe[title="streamlit_folium.st_folium"]');
    mapElements.forEach(function(element) {
        element.style.position = 'fixed';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = '100vw';
        element.style.height = '100vh';
        element.style.zIndex = '-1';
        element.style.pointerEvents = 'none';
    });
}, 500);
</script>
""", unsafe_allow_html=True)