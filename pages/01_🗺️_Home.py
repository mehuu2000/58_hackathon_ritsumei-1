import streamlit as st
import folium
from streamlit_folium import st_folium

# ページ設定
st.set_page_config(
    page_title="地図アプリ - ホーム",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 全てのStreamlit UIを非表示にするCSS
st.markdown("""
<style>
    /* Streamlitデフォルトを隠す */
    #MainMenu {display: none !important;}
    footer {display: none !important;}
    header {display: none !important;}
    .stToolbar {display: none !important;}
    .stDeployButton {display: none !important;}
    
    /* サイドバーを完全に隠す */
    section[data-testid="stSidebar"] {display: none !important;}
    .css-1d391kg {display: none !important;}
    .css-1rs6os {display: none !important;}
    div[data-testid="collapsedControl"] {display: none !important;}
    .css-18ni7ap {display: none !important;}
    .css-hby737 {display: none !important;}
    
    /* ページ全体を画面いっぱいに */
    .stAppViewContainer {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }
    
    .main .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }
    
    /* 地図を画面いっぱいに */
    .stApp {
        background: #f0f0f0;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    /* body要素も調整 */
    body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }
    
    html {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    /* Folium地図コンテナの調整 */
    iframe {
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
    }
    
    div[data-testid="stVerticalBlock"] {
        gap: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    /* Streamlit特有の余白を削除 */
    .element-container {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    div[data-testid="column"] {
        margin: 0 !important;
        padding: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

# 地図を作成（東京駅を中心）
map_center = folium.Map(
    location=[35.6812, 139.7671],
    zoom_start=13,
    tiles='OpenStreetMap'
)

# 地図を画面いっぱいに表示
st_folium(
    map_center,
    width='100%',
    height=700,
    returned_objects=["last_object_clicked", "all_drawings"],
    key="main_map"
)