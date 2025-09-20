'use client';

import { MapContainer as LeafletMapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { MapPin } from 'phosphor-react';
import { Post } from '@/data/mockPosts';
import PostHoverPopup from './PostHoverPopup';

interface MapContainerProps {
  interactive?: boolean;
  clickedPoint?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  posts?: Post[];
  isPostMode?: boolean;
}

const TOKYO_POSITION: [number, number] = [35.6812, 139.7671]; // 東京駅

// PhosphorアイコンでカスタムLeafletアイコンを作成
const createCustomIcon = (lat: number, lng: number) => {
  const iconHtml = renderToString(
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        background: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontSize: '10px',
        marginBottom: '4px',
        whiteSpace: 'nowrap',
        textAlign: 'center'
      }}>
        <div>緯度: {lat.toFixed(6)}</div>
        <div>経度: {lng.toFixed(6)}</div>
      </div>
      <MapPin size={40} color="#ef4444" weight="fill" />
    </div>
  );

  return L.divIcon({
    className: 'custom-map-pin',
    html: iconHtml,
    iconSize: [130, 90],
    iconAnchor: [65, 90],
  });
};

// 投稿用のカスタムアイコンを作成
const createPostIcon = (post: Post, isPostMode: boolean = false) => {
  // タイトルを2行に制限する関数
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) {
      return title;
    }
    // 2行分の長さを超える場合は省略
    return title.substring(0, maxLength - 3) + '...';
  };

  const iconHtml = renderToString(
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: isPostMode ? 'none' : 'auto' }}>
      <div style={{
        background: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontSize: '9px',
        marginBottom: '4px',
        textAlign: 'center',
        width: '100px',
        fontWeight: '500',
        lineHeight: '1.2',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        wordWrap: 'break-word',
        overflow: 'hidden',
        pointerEvents: isPostMode ? 'none' : 'auto'
      }}>
        {truncateTitle(post.title)}
      </div>
      <div style={{ 
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        overflow: 'hidden',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        pointerEvents: isPostMode ? 'none' : 'auto'
      }}>
        <img 
          src={post.IconURL} 
          alt={post.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // 画像読み込みエラー時のフォールバック
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '📍';
            e.currentTarget.parentElement!.style.display = 'flex';
            e.currentTarget.parentElement!.style.alignItems = 'center';
            e.currentTarget.parentElement!.style.justifyContent = 'center';
            e.currentTarget.parentElement!.style.fontSize = '24px';
          }}
        />
      </div>
    </div>
  );

  return L.divIcon({
    className: 'custom-post-icon',
    html: iconHtml,
    iconSize: [120, 80],
    iconAnchor: [60, 80],
  });
};

// マップクリックイベントハンドラーコンポーネント
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// 地図の中心移動を制御するコンポーネント
function MapViewController({ clickedPoint }: { clickedPoint: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!clickedPoint || !map) return;

    // 画面サイズを取得
    const container = map.getContainer();
    const containerWidth = container.offsetWidth;
    
    // 画面幅の1/4の位置に選択地点を表示するため、
    // 実際の地図中心は右にずらす必要がある
    const targetScreenX = containerWidth / 4;
    const centerScreenX = containerWidth / 2;
    const offsetPixels = centerScreenX - targetScreenX;
    
    // ピクセルオフセットを緯度経度オフセットに変換
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    // 東西方向（経度）のオフセットを計算
    const metersPerPixel = 40075016.686 * Math.cos(currentCenter.lat * Math.PI / 180) / Math.pow(2, currentZoom + 8);
    const offsetMeters = offsetPixels * metersPerPixel;
    const offsetLng = offsetMeters / (111320 * Math.cos(currentCenter.lat * Math.PI / 180));
    
    // 新しい中心位置を計算（選択地点から経度オフセット分右にずらす）
    const newCenter: [number, number] = [clickedPoint.lat, clickedPoint.lng + offsetLng];
    
    // スムーズに移動
    map.flyTo(newCenter, currentZoom, {
      duration: 1.0, // 1秒でアニメーション
    });

  }, [clickedPoint, map]);

  return null;
}

export default function MapContainer({ interactive = true, clickedPoint, onMapClick, posts = [], isPostMode = false }: MapContainerProps) {
  const [position, setPosition] = useState<[number, number]>(TOKYO_POSITION);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('right');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // グローバルマウス監視で確実にクリア
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!hoveredPost) return;
      
      // ポップアップとアイコンの領域外をチェック
      const target = e.target as HTMLElement;
      const isOverPopup = target.closest('.hover-popup');
      const isOverIcon = target.closest('.custom-post-icon');
      
      if (!isOverPopup && !isOverIcon) {
        // 領域外なら即座に非表示
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        setHoveredPost(null);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hoveredPost]);

  useEffect(() => {
    console.log('MapContainer mounted, interactive:', interactive);
    
    // 位置情報を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('位置情報を取得しました:', latitude, longitude);
          setPosition([latitude, longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error.message);
          console.log('デフォルトの東京の位置を使用します');
          setIsLoading(false);
        },
        {
          timeout: 10000, // 10秒でタイムアウト
          maximumAge: 300000, // 5分間はキャッシュを使用
          enableHighAccuracy: false
        }
      );
    } else {
      console.log('ブラウザが位置情報をサポートしていません');
      setIsLoading(false);
    }
  }, [interactive]);

  // 地図クリック時の処理
  const handleMapClick = (lat: number, lng: number) => {
    if (!interactive || !onMapClick) return; // インタラクティブでない場合は無視
    
    onMapClick(lat, lng);
    console.log('地図がクリックされました:', lat, lng);
  };


  if (isLoading) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#aaa' }}>
        <div style={{ color: 'white', fontSize: '16px' }}>位置情報を取得中...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <LeafletMapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        whenReady={() => {
          console.log('Leaflet map ready at position:', position);
        }}
        key={`${position[0]}-${position[1]}`} // 位置が変わったときに再レンダリング
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* クリックイベントハンドラー */}
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* 地図の中心移動制御 */}
        <MapViewController clickedPoint={clickedPoint || null} />
        
        {/* 投稿のマーカー表示 */}
        {posts.map((post, index) => (
          <Marker
            key={index}
            position={[post.lat, post.lng]}
            icon={createPostIcon(post, isPostMode)}
            eventHandlers={!isPostMode ? {
              click: () => {
                console.log('投稿がクリックされました:', post.title);
              },
              mouseover: (e) => {
                // アイコンの中心位置を取得
                const marker = e.target;
                const map = marker._map;
                const latLng = marker.getLatLng();
                const point = map.latLngToContainerPoint(latLng);
                
                const centerX = window.innerWidth / 2;
                const iconCenterX = point.x;
                
                // 即座に表示
                setHoveredPost(post);
                setMousePosition({ x: iconCenterX, y: point.y });
                setPopupPosition(iconCenterX < centerX ? 'left' : 'right');
              }
            } : {}}
          />
        ))}
        
        {/* クリックされた地点のマーカー表示 */}
        {clickedPoint && (
          <Marker
            position={[clickedPoint.lat, clickedPoint.lng]}
            icon={createCustomIcon(clickedPoint.lat, clickedPoint.lng)}
          />
        )}
      </LeafletMapContainer>

      {/* ホバーポップアップ */}
      {hoveredPost && (
        <PostHoverPopup
          post={hoveredPost}
          isVisible={true}
          position={popupPosition}
          mousePosition={mousePosition}
        />
      )}
    </div>
  );
}