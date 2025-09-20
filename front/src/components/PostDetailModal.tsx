'use client';

import { useEffect, useState } from 'react';
import { X, Heart } from 'phosphor-react';
import { Post } from '@/data/mockPosts';

interface User {
  uid: string;
  display_name?: string;
  access_token: string;
  email: string;
  created_at: string;
}

interface PostDetailModalProps {
  post: Post | null;
  isVisible: boolean;
  onClose: () => void;
  onAnimationComplete?: () => void;
  user: User;
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
              <div className="h-full flex p-5">
                {/* 左半分：コメント一覧（スマホ風UI） */}
                <div className="w-1/2 pr-4 flex flex-col">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">コメント</h2>
                    <button
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* コメント一覧 */}
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {post.comment
                      .sort((a, b) => new Date(b.comment_time).getTime() - new Date(a.comment_time).getTime())
                      .map((comment) => {
                        const isBestAnswer = post.best_answer_id && post.best_answer_id === comment.id;
                        const commentDate = new Date(comment.comment_time);
                        const formattedDate = `${commentDate.getFullYear()}年${commentDate.getMonth() + 1}月${commentDate.getDate()}日 ${commentDate.getHours()}:${commentDate.getMinutes().toString().padStart(2, '0')}`;
                        
                        return (
                          <div key={comment.id} className={`p-3 rounded-lg ${isBestAnswer ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                            <div className="flex items-start space-x-3">
                              {/* アイコン */}
                              <div className="flex flex-col items-center space-y-1">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                  {comment.name ? comment.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span className="text-xs text-gray-600 text-center truncate w-12">
                                  {comment.name || '不明'}
                                </span>
                              </div>
                              
                              {/* コメント内容 */}
                              <div className="flex-1 min-w-0">
                                <div className={`relative p-3 rounded-lg ${isBestAnswer ? 'bg-yellow-100' : 'bg-white'} border border-gray-200`}>
                                  {/* ベストアンサーバッジ */}
                                  {isBestAnswer && (
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-md transform rotate-[30deg]">
                                      BEST
                                    </div>
                                  )}
                                  
                                  {/* コメントテキスト */}
                                  <p className="text-gray-800 text-sm leading-relaxed mb-2">
                                    {comment.context}
                                  </p>
                                  
                                  {/* いいねボタンと日時 */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 text-gray-500">
                                      <Heart size={16} className="text-red-400" />
                                      <span className="text-sm">{comment.comment_good}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {formattedDate}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                
                {/* 右半分：詳細情報（後で実装） */}
                <div className="w-1/2 pl-4">
                  <div className="h-full bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                    <p className="text-gray-500">右側の詳細情報は後で実装します</p>
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