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
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(230, 230, 230, 0.9);
        padding: 10px 25px;
        font-size: 18px;
        color: #333;
        border-radius: 5px;
        z-index: 999;
        font-weight: normal;
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

# フォームを画面の中央にオーバーレイ表示
form_html = """
<div style="
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(70, 70, 70, 0.85);
    padding: 25px;
    border-radius: 10px;
    width: 320px;
    z-index: 1000;
    box-sizing: border-box;
">
    <input type="email" id="email" placeholder="メールアドレス（ログイン用ID）" style="
        width: 100%;
        padding: 12px;
        margin: 5px 0;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.95);
        box-sizing: border-box;
    ">
    
    <input type="password" id="password" placeholder="パスワード" style="
        width: 100%;
        padding: 12px;
        margin: 5px 0;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.95);
        box-sizing: border-box;
    ">
    
    <button onclick="handleLogin()" style="
        width: 100%;
        padding: 12px;
        margin: 15px 0 10px 0;
        border: none;
        border-radius: 5px;
        background: #4CAF50;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-sizing: border-box;
    ">ログイン</button>
    
    <div onclick="handleSignin()" style="
        text-align: center;
        margin-top: 15px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        cursor: pointer;
    ">サインイン</div>
</div>

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
"""

# フォームを表示
st.markdown(form_html, unsafe_allow_html=True)

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