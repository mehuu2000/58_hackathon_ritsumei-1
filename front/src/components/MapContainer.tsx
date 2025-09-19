'use client';

import { MapContainer as LeafletMapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { MapPin } from 'phosphor-react';

interface MapContainerProps {
  interactive?: boolean;
  clickedPoint?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
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

export default function MapContainer({ interactive = true, clickedPoint, onMapClick }: MapContainerProps) {
  const [position, setPosition] = useState<[number, number]>(TOKYO_POSITION);
  const [isLoading, setIsLoading] = useState(true);

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
        
        {/* クリックされた地点のマーカー表示 */}
        {clickedPoint && (
          <Marker
            position={[clickedPoint.lat, clickedPoint.lng]}
            icon={createCustomIcon(clickedPoint.lat, clickedPoint.lng)}
          />
        )}
      </LeafletMapContainer>
    </div>
  );
}