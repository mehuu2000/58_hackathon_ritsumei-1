'use client';

import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';

interface MapContainerProps {
  interactive?: boolean;
}

const TOKYO_POSITION: [number, number] = [35.6812, 139.7671]; // 東京駅

export default function MapContainer({ interactive = true }: MapContainerProps) {
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

  if (isLoading) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#aaa' }}>
        <div style={{ color: 'white', fontSize: '16px' }}>位置情報を取得中...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
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
      </LeafletMapContainer>
    </div>
  );
}