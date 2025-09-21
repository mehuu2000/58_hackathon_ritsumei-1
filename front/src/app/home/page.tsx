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
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const API_BASE_URL = "https://bomu.info:8443";

  // ニュースデータを取得する関数
  const fetchNews = async (latitude: number, longitude: number) => {
    const requestData = {
      latitude: latitude,
      longitude: longitude
    };
    
    console.log('=== ニュースAPI送信デバッグ情報 ===');
    console.log('latitude の型:', typeof latitude);
    console.log('latitude の値:', latitude);
    console.log('longitude の型:', typeof longitude);
    console.log('longitude の値:', longitude);
    console.log('requestData:', requestData);
    console.log('JSON.stringify(requestData):', JSON.stringify(requestData));
    console.log('送信先URL:', `${API_BASE_URL}/news/get-news-by-location`);
    console.log('===================================');
    
    try {
      const response = await fetch(`${API_BASE_URL}/news/get-news-by-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', response.headers);

      if (response.ok) {
        const newsData = await response.json();
        console.log('取得したニュースデータ:', newsData);
        setNewsItems(newsData);
      } else {
        // エラーレスポンスの詳細も取得
        const errorText = await response.text();
        console.error('ニュースデータ取得失敗:', response.statusText);
        console.error('エラー詳細:', errorText);
        setNewsItems([]);
      }
    } catch (error) {
      console.error('ニュースデータ取得エラー:', error);
      setNewsItems([]);
    }
  };

  // 投稿データを取得する関数
  const fetchPosts = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const postsData = await response.json();
        console.log('取得した投稿データ:', postsData);
        
        // APIレスポンスは {posts: [...]} の形式
        if (postsData && postsData.posts && Array.isArray(postsData.posts)) {
          setPosts(postsData.posts);
        } else {
          console.error('APIレスポンスが期待する形式ではありません:', postsData);
          setPosts(mockPosts);
        }
      } else {
        console.error('投稿データ取得失敗:', response.statusText);
        // エラー時はモックデータを使用
        setPosts(mockPosts);
      }
    } catch (error) {
      console.error('投稿データ取得エラー:', error);
      // エラー時はモックデータを使用
      setPosts(mockPosts);
    }
  };

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
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
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
          
          // ユーザー情報取得成功後、投稿データも取得
          await fetchPosts(accessToken);
          
          // 位置情報を取得してニュースデータを取得
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                fetchNews(latitude, longitude);
              },
              (error) => {
                console.error('位置情報取得エラー:', error);
                // 位置情報取得に失敗した場合はデフォルト位置（東京）でニュースを取得
                const defaultLat = 35.6812;
                const defaultLng = 139.7671;
                setCurrentLocation({ lat: defaultLat, lng: defaultLng });
                fetchNews(defaultLat, defaultLng);
              }
            );
          } else {
            console.error('Geolocation is not supported by this browser.');
            // Geolocationが使えない場合はデフォルト位置でニュースを取得
            const defaultLat = 35.6812;
            const defaultLng = 139.7671;
            setCurrentLocation({ lat: defaultLat, lng: defaultLng });
            fetchNews(defaultLat, defaultLng);
          }
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

  // コメント追加機能
  const handleCommentAdd = (postId: string, newComment: any) => {
    console.log('=== handleCommentAdd 呼び出し ===');
    console.log('postId:', postId);
    console.log('newComment:', newComment);
    console.log('現在のposts配列:', posts);
    
    setPosts(prevPosts => {
      console.log('prevPosts:', prevPosts);
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          console.log('マッチした投稿を更新:', post.title);
          const updatedPost = { ...post, comment: [newComment, ...post.comment] };
          console.log('更新後の投稿:', updatedPost);
          return updatedPost;
        }
        return post;
      });
      console.log('更新後のposts配列:', updatedPosts);
      return updatedPosts;
    });
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
          onCommentAdd={handleCommentAdd}
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
        newsItems={newsItems}
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
        posts={posts}
      />
    </main>
  );
}