'use client';

import { useState, useEffect } from 'react';
import { X } from 'phosphor-react';

interface PostModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

export default function PostModal({ isVisible, onClose, selectedLocation }: PostModalProps) {
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
      <div className="absolute right-4 bottom-0 top-0 flex items-end pointer-events-none">
        <div
          className={`w-96 bg-white rounded-t-2xl shadow-xl border-l-2 border-r-2 border-t-2 border-gray-300 
            transition-transform duration-500 ease-out pointer-events-auto transform ${
            isVisible && showContent
              ? 'translate-y-0' 
              : 'translate-y-full'
          }`}
          style={{ height: '80%' }}
        >
          {showContent && (
            <div className="h-full flex flex-col">
              {/* ヘッダー */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">新しい投稿</h3>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
                {selectedLocation && (
                  <div className="mt-2 text-sm text-gray-600">
                    選択地点: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>
              
              {/* コンテンツエリア */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* ここに投稿フォームの内容を追加していきます */}
                  <div className="text-center text-gray-500 py-8">
                    投稿フォームの内容をここに追加します
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}