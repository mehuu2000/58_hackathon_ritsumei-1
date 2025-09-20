'use client';

import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // fetchAPIでユーザー情報を取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const userId = localStorage.getItem('user_id');
        
        if (!accessToken || !userId) {
          // localStorageにトークンがない場合は認証ページにリダイレクト
          window.location.href = '/';
          return;
        }

        // ユーザー情報をAPIから取得
        const response = await fetch(`http://bomu.info:8000/profile/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('取得したユーザーデータ:', userData);
          
          const user: User = {
            uid: userData.uid,
            display_name: userData.display_name,
            token: userData.token,
            access_token: accessToken,
            email: userData.email,
            created_at: userData.created_at
          };
          
          setUser(user);
        } else {
          console.error('ユーザー情報取得失敗:', response.statusText);
          // 認証エラーの場合はログインページに戻す
          if (response.status === 401) {
            window.location.href = '/';
          }
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        window.location.href = '/';
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // ユーザー情報読み込み中またはユーザーが未認証の場合
  if (isLoadingUser || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">ユーザー情報を読み込み中...</p>
        </div>
      </div>
    );
  }


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

  // ユーザーのトークン数を更新する関数
  const handleUserTokenUpdate = (newTokenCount: number) => {
    setUser(prevUser => prevUser ? { ...prevUser, token: newTokenCount } : null);
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
        onUserTokenUpdate={handleUserTokenUpdate}
      />
    </main>
  );
}