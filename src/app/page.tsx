'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AuthOverlay from '@/components/AuthOverlay';

// Leafletはクライアントサイドでのみ動作するため、dynamic importを使用
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-200">Loading map...</div>
});

export default function TopPage() {

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <>
        {/* 背景地図 */}
        <div className="fixed inset-0 z-0">
          <MapContainer interactive={false} />
        </div>
        
        {/* アプリ名 */}
        <div className="fixed top-[10vh] left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 px-8 py-3 rounded-md z-[999] font-bold whitespace-nowrap text-xl md:text-2xl shadow-lg">
          マップアプリ
        </div>
        
        {/* 認証オーバーレイ */}
        <AuthOverlay/>
      </>
    </main>
  );
}
