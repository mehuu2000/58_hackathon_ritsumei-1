'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import WoodenNavigation from '@/components/WoodenNavigation';
import NewsComponent from '@/components/NewsComponent';
import PostModeMessage from '@/components/PostModeMessage';
import PostModal from '@/components/PostModal';
import PostCard from '@/components/PostCard';
import { mockPosts, Post } from '@/data/mockPosts';

// Leafletはクライアントサイドでのみ動作するため、dynamic importを使用
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-200">Loading map...</div>
});

// ユーザーの型定義
interface User {
  uid: string;
  display_name?: string;
  token: number;
  access_token: string;
  email: string;
  created_at: string;
}

export default function HomePage() {
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [isPostMode, setIsPostMode] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  
  // ユーザーのモックデータ
  const [user] = useState<User>({
    uid: '12345678-1234-1234-1234-123456789abc',
    display_name: '山田太郎',
    token: 1250,
    access_token: 'abcdefg1234567',
    email: 'yamada@example.com',
    created_at: '2025-01-15T10:30:00Z'
  });

  const handleMapClick = (lat: number, lng: number) => {
    // 投稿モードの時のみ地点を設定
    if (isPostMode) {
      setClickedPoint({ lat, lng });
      // 場所を選択したら投稿モーダルを表示
      setIsPostModalVisible(true);
    }
  };

  const handlePostModeChange = (mode: boolean) => {
    setIsPostMode(mode);
    // 投稿モードがfalseになったら、ピン情報をクリアし投稿モーダルを閉じる
    if (!mode) {
      setClickedPoint(null);
      setIsPostModalVisible(false);
    }
  };

  // 新しい投稿を配列の先頭に追加する関数
  const handlePostSubmit = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 地図を画面いっぱいに表示 */}
      <div className="absolute inset-0">
        <MapContainer 
          interactive={true} 
          clickedPoint={clickedPoint}
          onMapClick={handleMapClick}
          posts={posts}
          isPostMode={isPostMode}
          user={user}
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
      
      {/* 投稿モード時の案内メッセージ（場所未選択時のみ） */}
      <PostModeMessage isVisible={isPostMode && !clickedPoint} />
      
      
      {/* 投稿モーダル */}
      <PostModal 
        isVisible={isPostModalVisible}
        onClose={() => setIsPostModalVisible(false)}
        selectedLocation={clickedPoint}
        user={user}
        onPostSubmit={handlePostSubmit}
      />
    </main>
  );
}