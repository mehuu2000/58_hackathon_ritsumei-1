'use client';

import { useEffect, useState } from 'react';
import { X } from 'phosphor-react';
import { Post } from '@/data/mockPosts';

interface PostDetailModalProps {
  post: Post | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function PostDetailModal({ post, isVisible, onClose }: PostDetailModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);

  // デバッグログ
  useEffect(() => {
    console.log('PostDetailModal props変更:', { 
      postTitle: post?.title || 'null', 
      isVisible, 
      showContent, 
      showFrame 
    });
  }, [post, isVisible, showContent, showFrame]);

  // アニメーション制御（NewsComponentを参考）
  useEffect(() => {
    if (isVisible && post) {
      // 開く時：即座に内容と枠を表示
      setShowContent(true);
      setShowFrame(true);
    } else {
      // 閉じる時：500ms後（アニメーション終了後）に内容と枠を非表示
      const timer = setTimeout(() => {
        setShowContent(false);
        setShowFrame(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, post]);

  if (!post) return null;

  return (
    <>
      {/* オーバーレイ */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[600]"
          onClick={onClose}
        />
      )}
      
      {/* モーダル本体 */}
      <div 
        className={`fixed left-0 top-0 h-screen z-[700] transition-[width] duration-500 ease-out overflow-hidden ${
          isVisible 
            ? 'w-[40%]' 
            : 'w-0'
        } ${
          showFrame
            ? 'bg-white shadow-xl border-r border-gray-300'
            : ''
        }`}
      >
        {showContent && (
          <div className="h-full flex flex-col">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">投稿詳細</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* コンテンツエリア（仮の内容） */}
            <div className="flex-1 overflow-y-auto p-6">
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
    </>
  );
}