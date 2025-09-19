'use client';

import { useState, useEffect, useRef } from 'react';
import { X, User, Plus, Image, Upload } from 'phosphor-react';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [subTags, setSubTags] = useState<string[]>([]);
  const [subTagInput, setSubTagInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ファイル選択処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

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
          style={{ height: '85vh' }}
        >
          {showContent && (
            <div className="h-full flex p-5">
              {/* 左側のdiv (4の比率) */}
              <div className="w-2/5 pr-4 flex flex-col justify-between">
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
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                
                {/* タグ選択 */}
                <div className="mt-1">
                  <label className="block text-sm font-medium text-gray-700">
                    タグ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['環境・エコ', 'テクノロジー', '教育・学習', 'コミュニティ'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedTag === tag
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* サブタグ */}
                <div className="mt-1">
                  <label className="block text-sm font-medium text-gray-700">
                    サブタグ
                  </label>
                  
                  {/* サブタグ表示エリア（2×2グリッド） */}
                  <div className="grid grid-cols-2 gap-2 mb-1">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          subTags[index]
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-gray-50 text-gray-400 border-gray-200 border-dashed'
                        } relative overflow-hidden`}
                        style={{ minHeight: '28px' }}
                      >
                        {subTags[index] ? (
                          <>
                            <span className="block truncate pr-5">
                              {subTags[index]}
                            </span>
                            <button
                              onClick={() => {
                                const newSubTags = [...subTags];
                                newSubTags.splice(index, 1);
                                setSubTags(newSubTags);
                              }}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="block text-center">未設定</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* サブタグ入力欄 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subTagInput}
                      onChange={(e) => setSubTagInput(e.target.value)}
                      placeholder="サブタグを入力..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      maxLength={20}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (subTagInput.trim() && subTags.length < 4) {
                            setSubTags([...subTags, subTagInput.trim()]);
                            setSubTagInput('');
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (subTagInput.trim() && subTags.length < 4) {
                          setSubTags([...subTags, subTagInput.trim()]);
                          setSubTagInput('');
                        }
                      }}
                      disabled={!subTagInput.trim() || subTags.length >= 4}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
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
                
                {/* 画像表示エリア */}
                <div className="mt-8">
                  <div className="w-full h-56 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="選択された画像"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Image size={48} className="mb-2" />
                        <p className="text-sm">画像をアップロードしてください</p>
                      </div>
                    )}
                  </div>
                  
                  {/* 変更ボタン */}
                  <button
                    onClick={handleImageUpload}
                    className="mt-3 w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-80 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#7BB8FF' }}
                  >
                    <Upload size={16} />
                    {selectedImage ? '画像を変更' : '画像をアップロード'}
                  </button>
                  
                  {/* 隠しファイル入力 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}