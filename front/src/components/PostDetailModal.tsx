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

  // アニメーション制御（NewsComponentのパターンに完全準拠）
  useEffect(() => {
    if (isVisible && post) {
      // 開く時：即座に内容と枠を表示、そして拡張アニメーション開始
      setShowContent(true);
      setShowFrame(true);
      // 少し遅らせて拡張アニメーション開始
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      // 閉じる時：まず拡張を停止、500ms後に内容と枠を非表示
      setIsExpanded(false);
      const timer = setTimeout(() => {
        setShowContent(false);
        setShowFrame(false);
        // アニメーション完了を親に通知
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, post]);

  return (
    <>
      {/* オーバーレイ */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[600]"
          onClick={onClose}
        />
      )}
      
      {/* モーダル本体（常に存在、閉じている時は幅0） */}
      {post && (
        <div 
          className={`fixed left-0 top-0 h-screen z-[700] transition-[width] duration-500 ease-out overflow-hidden ${
            isExpanded 
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
      )}
    </>
  );
}