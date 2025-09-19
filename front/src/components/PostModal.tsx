'use client';

import { useState, useEffect } from 'react';
import { X, User } from 'phosphor-react';

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
            <div className="h-full flex p-4">
              {/* 左側のdiv (4の比率) */}
              <div className="w-2/5 pr-4">
                <div className="flex gap-6 mb-4">
                  {/* 所持トークン表示 */}
                  <div>
                    <span className="text-sm text-gray-600 mb-1 block">所持トークン</span>
                    <span className="text-2xl font-bold text-black">{user.token.toLocaleString()}t</span>
                  </div>
                  
                  {/* 緯度経度表示 */}
                  {selectedLocation && (
                    <div className="text-base text-gray-800">
                      <div>緯度: {selectedLocation.lat.toFixed(6)}</div>
                      <div>経度: {selectedLocation.lng.toFixed(6)}</div>
                    </div>
                  )}
                </div>
                
                {/* アイコンとボタン */}
                <div className="flex gap-6 items-start">
                  {/* アイコン表示 */}
                  <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={48} className="text-gray-500" />
                  </div>
                  
                  {/* ボタン群 */}
                  <div className="flex flex-col justify-between h-28">
                    <div className="flex flex-col items-end">
                      <button className="px-9 py-2 text-white text-base font-semibold rounded transition-colors hover:opacity-80" style={{ backgroundColor: '#7BB8FF' }}>
                        AIで生成
                      </button>
                      <div className="text-sm text-red-400 text-center">100t消費</div>
                    </div>
                    <button className="px-9 py-2 text-white text-base font-semibold rounded transition-colors hover:opacity-80" style={{ backgroundColor: '#7BB8FF' }}>
                      既存選択
                    </button>
                  </div>
                </div>
                
                {/* 概要入力欄 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    概要
                  </label>
                  <textarea
                    placeholder="プロジェクトの概要を入力してください..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    rows={6}
                    style={{
                      backgroundColor: '#fafafa',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </div>
              </div>
              
              {/* 右側のdiv (6の比率) */}
              <div className="w-3/5 pl-4 relative">
                {/* 右上にバツボタン */}
                <button
                  onClick={onClose}
                  className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
                
                {/* 投稿フォームの内容をここに追加 */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}