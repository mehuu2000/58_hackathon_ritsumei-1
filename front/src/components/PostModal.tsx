'use client';

import { useState, useEffect, useRef } from 'react';
import { X, User, Plus, Image, Upload, ArrowRight, Calendar } from 'phosphor-react';

interface User {
  uid: string;
  display_name: string;
  token: number;
  email: string;
  created_at: string;
}

interface Post {
  id: string;
  user_name?: string;
  prefectures: string;
  lat: number;
  lng: number;
  title: string;
  IconURL: string;
  ImageURL?: string;
  discription: string;
  tag_list: Array<{
    name: string;
    attribute: boolean;
  }>;
  distribution_reward: number;
  direct_reward: number;
  post_time: string;
  post_limit: string;
  achivement?: {
    id: string;
    name: string;
  };
  post_good: number;
  comment: Array<{
    id: string;
    name?: string;
    context: string;
    comment_time: string;
    post_id: string;
    comment_good: number;
  }>;
  best_answer_id?: string;
}
interface PostModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedLocation?: { lat: number; lng: number } | null;
  user: User;
  onPostSubmit: (newPost: Post) => void;
}

export default function PostModal({ isVisible, onClose, selectedLocation, user, onPostSubmit }: PostModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  
  const [title, setTitle] = useState<string>('');
  const [IconURL, setIconURL] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [subTags, setSubTags] = useState<string[]>([]);
  const [subTagInput, setSubTagInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const [distributionRatio, setDistributionRatio] = useState(0.5); // 0=解決者100%, 1=貢献者100%
  const [achievementName, setAchievementName] = useState<string>('');
  // デフォルトの期限を現在から一週間後に設定
  const getDefaultDeadline = () => {
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    return {
      year: oneWeekLater.getFullYear().toString(),
      month: (oneWeekLater.getMonth() + 1).toString(),
      day: oneWeekLater.getDate().toString()
    };
  };
  
  const defaultDeadline = getDefaultDeadline();
  const [deadlineYear, setDeadlineYear] = useState<string>(defaultDeadline.year);
  const [deadlineMonth, setDeadlineMonth] = useState<string>(defaultDeadline.month);
  const [deadlineDay, setDeadlineDay] = useState<string>(defaultDeadline.day);
  const [showCalendar, setShowCalendar] = useState(false);
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

  // 報酬配布計算
  const calculateDistribution = () => {
    const total = parseInt(rewardAmount) || 0;
    const contributorAmount = Math.round(total * distributionRatio);
    const solverAmount = total - contributorAmount;
    return { solverAmount, contributorAmount };
  };

  // 入力値の妥当性チェックと修正
  const validateAndFixInput = (value: string, type: 'year' | 'month' | 'day') => {
    const num = parseInt(value);
    if (isNaN(num)) return '';
    
    switch (type) {
      case 'year':
        const currentYear = new Date().getFullYear();
        return Math.max(currentYear, Math.min(2099, num)).toString();
      case 'month':
        return Math.max(1, Math.min(12, num)).toString();
      case 'day':
        const year = parseInt(deadlineYear);
        const month = parseInt(deadlineMonth);
        const daysInMonth = new Date(year, month, 0).getDate();
        return Math.max(1, Math.min(daysInMonth, num)).toString();
      default:
        return value;
    }
  };

  // 投稿処理
  const handlePost = async () => {
    try {
      const postData = {
        title,
        IconURL: IconURL || null,
        detail: description,
        selectTag: selectedTag || '',
        subTags: subTags.length > 0 ? subTags : null,
        selectedImage: selectedImage || null,
        distribution_reward: Math.round(parseInt(rewardAmount || '0') * distributionRatio),
        direct_reward: Math.round(parseInt(rewardAmount || '0') * (1 - distributionRatio)),
        latitude: selectedLocation?.lat.toString() || '',
        longitude: selectedLocation?.lng.toString() || '',
        achievementName: achievementName || null,
        post_limit: `${deadlineYear}-${deadlineMonth.padStart(2, '0')}-${deadlineDay.padStart(2, '0')}`
      };

      // APIリクエスト送信
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const newPost: Post = await response.json();
        onPostSubmit(newPost);
        console.log('投稿成功');
        onClose();
      } else {
        console.error('投稿失敗:', response.statusText);
      }
    } catch (error) {
      console.error('投稿エラー:', error);
    }
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
                  
                  {/* タイトル入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="プロジェクトのタイトル"
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      maxLength={50}
                    />
                  </div>
                </div>
                
                {/* アイコンとボタン */}
                <div className="flex gap-6 items-start">
                  {/* アイコン表示 */}
                  <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {IconURL ? (
                      <img
                        src={IconURL}
                        alt="選択されたアイコン"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 画像読み込みエラー時はデフォルトアイコンにフォールバック
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const userIcon = parent.querySelector('.user-icon') as HTMLElement;
                            if (userIcon) userIcon.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`user-icon w-full h-full flex items-center justify-center ${IconURL ? 'hidden' : ''}`}>
                      <User size={48} className="text-gray-500" />
                    </div>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isComposing) {
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
                
                {/* 報酬設定 */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-4">
                    {/* 報酬入力 */}
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        報酬
                      </label>
                      <div className="w-32 bg-gray-100 px-4 py-3 rounded-lg flex items-center justify-center">
                        <input
                          type="number"
                          value={rewardAmount}
                          onChange={(e) => setRewardAmount(e.target.value)}
                          placeholder="400"
                          className="w-full bg-transparent text-2xl font-bold text-center outline-none"
                        />
                        <span className="text-lg font-medium ml-1">t</span>
                      </div>
                    </div>
                    
                    {/* 矢印 */}
                    <div className="flex-shrink-0 mt-8">
                      <ArrowRight size={24} className="text-gray-600" />
                    </div>
                    
                    {/* 達成報酬表示 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        達成報酬
                      </label>
                      <div className="space-y-2">
                        <div>
                          <span className="border-b border-gray-300 pb-1 inline-block">
                            <span className="text-sm text-gray-700">解決者：</span>
                            <span className="text-lg font-bold">
                              {calculateDistribution().solverAmount}t
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="border-b border-gray-300 pb-1 inline-block">
                            <span className="text-sm text-gray-700">貢献者：</span>
                            <span className="text-lg font-bold">
                              {calculateDistribution().contributorAmount}t
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 配布割合スライダー */}
                    <div className="flex-shrink-0 ml-4 mt-6">
                      <div className="relative w-4" style={{ height: '68px', marginTop: '8px' }}>
                        {/* バー */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-300 rounded-full"></div>
                        {/* ドラッグ可能な丸 */}
                        <div
                          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full cursor-pointer hover:scale-110 transition-transform"
                          style={{ top: `${distributionRatio * 100}%` }}
                          onMouseDown={(e) => {
                            const startY = e.clientY;
                            const startRatio = distributionRatio;
                            
                            const handleMouseMove = (e: MouseEvent) => {
                              const deltaY = e.clientY - startY;
                              const sliderHeight = 68; // 調整された高さ
                              const newRatio = Math.max(0, Math.min(1, startRatio + (deltaY / sliderHeight)));
                              setDistributionRatio(newRatio);
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* アチーブメント設定 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アチーブ
                  </label>
                  
                  {/* アチーブメント名表示エリア */}
                  <div className="w-full h-12 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 mb-1 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {achievementName || 'アチーブメント名が表示されます'}
                    </span>
                  </div>
                  
                  {/* 生成ボタンと消費表示 */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => {
                          // TODO: アチーブメント生成処理
                          setAchievementName('環境保護アチーブメント');
                        }}
                        className="px-6 py-1 text-white text-sm font-semibold rounded-lg transition-colors hover:opacity-80"
                        style={{ backgroundColor: '#7BB8FF' }}
                      >
                        生成
                      </button>
                      <div className="text-xs text-red-400">
                        100t消費
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 期限設定と投稿ボタン */}
                <div className="absolute bottom-0 right-0 flex items-center gap-4">
                  {/* 期限設定 */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      期限
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                        <input
                          type="number"
                          value={deadlineYear}
                          onChange={(e) => setDeadlineYear(e.target.value)}
                          onBlur={(e) => setDeadlineYear(validateAndFixInput(e.target.value, 'year'))}
                          className="w-12 text-center text-sm bg-transparent outline-none"
                          min="2025"
                          max="2099"
                        />
                        <span className="text-sm text-gray-600">年</span>
                        <input
                          type="number"
                          value={deadlineMonth}
                          onChange={(e) => setDeadlineMonth(e.target.value)}
                          onBlur={(e) => setDeadlineMonth(validateAndFixInput(e.target.value, 'month'))}
                          className="w-8 text-center text-sm bg-transparent outline-none"
                          min="1"
                          max="12"
                        />
                        <span className="text-sm text-gray-600">月</span>
                        <input
                          type="number"
                          value={deadlineDay}
                          onChange={(e) => setDeadlineDay(e.target.value)}
                          onBlur={(e) => setDeadlineDay(validateAndFixInput(e.target.value, 'day'))}
                          className="w-8 text-center text-sm bg-transparent outline-none"
                          min="1"
                          max="31"
                        />
                        <span className="text-sm text-gray-600">日</span>
                      </div>
                      <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <Calendar size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* 投稿ボタン */}
                  <div>
                    <button
                      onClick={handlePost}
                      className="px-8 py-2 text-white text-base font-semibold rounded-lg transition-colors hover:opacity-80 mt-6"
                      style={{ backgroundColor: '#7BB8FF' }}
                    >
                      投稿
                    </button>
                  </div>
                </div>
                
                {/* カレンダーポップアップ */}
                {showCalendar && (
                  <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">期限を選択</h3>
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <input
                        type="date"
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          setDeadlineYear(selectedDate.getFullYear().toString());
                          setDeadlineMonth((selectedDate.getMonth() + 1).toString());
                          setDeadlineDay(selectedDate.getDate().toString());
                          setShowCalendar(false);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}