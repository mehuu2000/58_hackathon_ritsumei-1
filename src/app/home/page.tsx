'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import WoodenNavigation from '@/components/WoodenNavigation';
import NewsComponent from '@/components/NewsComponent';

// Leafletはクライアントサイドでのみ動作するため、dynamic importを使用
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-200">Loading map...</div>
});

export default function HomePage() {
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 地図を画面いっぱいに表示 */}
      <div className="absolute inset-0">
        <MapContainer interactive={true} />
      </div>
      
      {/* 木目調ナビゲーション */}
      <WoodenNavigation />
      
      {/* ニュースコンポーネント */}
      <NewsComponent 
        isExpanded={isNewsExpanded}
        setIsExpanded={setIsNewsExpanded}
      />
    </main>
  );
}