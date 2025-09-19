'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import WoodenNavigation from '@/components/WoodenNavigation';
import NewsComponent from '@/components/NewsComponent';
import PostModeMessage from '@/components/PostModeMessage';

// Leafletはクライアントサイドでのみ動作するため、dynamic importを使用
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-200">Loading map...</div>
});

export default function HomePage() {
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [isPostMode, setIsPostMode] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    // 投稿モードの時のみ地点を設定
    if (isPostMode) {
      setClickedPoint({ lat, lng });
    }
  };

  const handlePostModeChange = (mode: boolean) => {
    setIsPostMode(mode);
    // 投稿モードがfalseになったら、ピン情報をクリア
    if (!mode) {
      setClickedPoint(null);
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 地図を画面いっぱいに表示 */}
      <div className="absolute inset-0">
        <MapContainer 
          interactive={true} 
          clickedPoint={clickedPoint}
          onMapClick={handleMapClick}
        />
      </div>
      
      {/* 木目調ナビゲーション */}
      <WoodenNavigation 
        isPostMode={isPostMode}
        setIsPostMode={handlePostModeChange}
      />
      
      {/* ニュースコンポーネント */}
      <NewsComponent 
        isExpanded={isNewsExpanded}
        setIsExpanded={setIsNewsExpanded}
      />
      
      {/* 投稿モード時の案内メッセージ */}
      <PostModeMessage isVisible={isPostMode} />
    </main>
  );
}