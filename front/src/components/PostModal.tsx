'use client';

import { useState, useEffect } from 'react';
import { X } from 'phosphor-react';

interface User {
  uid: string;
  display_name: string;
  token: number;
  email: string;
  created_at: string;
}

interface PostModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedLocation?: { lat: number; lng: number } | null;
  user: User;
}

export default function PostModal({ isVisible, onClose, selectedLocation, user }: PostModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);

  // アニメーション制御
  useEffect(() => {
    if (isVisible) {
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

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
      <div className="absolute bottom-0 pointer-events-none" style={{ right: '1rem', width: '60%' }}>
        <div
          className={`w-full bg-white rounded-t-2xl shadow-xl border-l-2 border-r-2 border-t-2 border-gray-300 
            transition-transform duration-500 ease-out pointer-events-auto transform ${
            isVisible && showContent
              ? 'translate-y-0' 
              : 'translate-y-full'
          }`}
          style={{ height: '80vh' }}
        >
          {showContent && (
            <div className="h-full flex flex-col p-4">
              {/* 左上に所持トークン表示、右上にバツボタン */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">所持トークン</span>
                  <span className="text-2xl font-bold text-blue-600">{user.token.toLocaleString()}t</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* 投稿フォームの内容をここに追加 */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}