'use client';

import { useEffect, useState } from 'react';
import { X } from 'phosphor-react';
import { Post } from '@/data/mockPosts';

interface PostDetailModalProps {
  post: Post | null;
  isVisible: boolean;
  onClose: () => void;
  onAnimationComplete?: () => void;
}

export default function PostDetailModal({ post, isVisible, onClose, onAnimationComplete }: PostDetailModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // デバッグログ
  useEffect(() => {
    console.log('PostDetailModal props変更:', { 
      postTitle: post?.title || 'null', 
      isVisible, 
      isExpanded,
      showContent, 
      showFrame 
    });
  }, [post, isVisible, isExpanded, showContent, showFrame]);

  // アニメーション制御（PostModalと同じパターン）
  useEffect(() => {
    if (isVisible && post) {
      // 開く時：即座に枠を表示し、少し遅らせて内容を表示
      setShowFrame(true);
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // 閉じる時：即座に内容を非表示、500ms後に枠を非表示
      setShowContent(false);
      const timer = setTimeout(() => {
        setShowFrame(false);
        // アニメーション完了を親に通知
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, post]);

  if (!showFrame) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 背景オーバーレイ */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isVisible ? 'opacity-30' : 'opacity-0'
        } pointer-events-auto`}
        onClick={onClose}
      />
      
      {/* モーダル本体 */}
      {post && (
        <div className="absolute bottom-0 pointer-events-none" style={{ right: '1rem', width: '60%' }}>
          <div
            className={`w-full bg-white rounded-t-2xl shadow-xl border-l-2 border-r-2 border-t-2 border-gray-300 
              transition-transform duration-500 ease-out pointer-events-auto transform ${
              isVisible && showContent
                ? 'translate-y-0' 
                : 'translate-y-full'
            }`}
            style={{ height: '85vh' }}
          >
            {showContent && (
              <div className="h-full flex flex-col p-5">
                {/* ヘッダー */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">投稿詳細</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {/* コンテンツエリア（仮の内容） */}
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    投稿者: {post.user_name}
                  </p>
                  <p className="text-gray-600">
                    {post.discription}
                  </p>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      モーダルの詳細な内容は後で実装します。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}