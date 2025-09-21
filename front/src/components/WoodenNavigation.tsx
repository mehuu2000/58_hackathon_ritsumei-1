'use client';

import { useState, useEffect } from 'react';
import { House, MagnifyingGlass, PencilSimple, Trophy, User, CaretRight, IconProps, Crown } from 'phosphor-react';
import { useNavigation } from '@/contexts/NavigationContext';

interface NavigationItem {
  icon: React.ComponentType<IconProps>;
  label: string;
  action: () => void;
}

interface WoodenNavigationProps {
  isPostMode?: boolean;
  setIsPostMode?: (mode: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedSort?: string | null;
  setSelectedSort?: (sort: string | null) => void;
}

export default function WoodenNavigation({ isPostMode = false, setIsPostMode, searchQuery = '', setSearchQuery, selectedSort = null, setSelectedSort }: WoodenNavigationProps) {
  const { isNavigationExpanded, setIsNavigationExpanded } = useNavigation();
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const [isSearchPopupVisible, setIsSearchPopupVisible] = useState(false);
  
  // ソート状態は親コンポーネントから受け取る
  
  // フィルタ状態（複数選択可能、初期は全て選択）
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set([
    "276643c6-4e69-4d62-a7ba-457125d20a4f", // 福祉
    "9a755098-dc5c-414d-92e3-f49c219589a1", // ゴミ
    "9acd6e59-ecc6-4654-a3ca-61a0d646e1aa", // 環境
    "9f8bdc28-a28b-4647-b18f-56f8fafdbfca"  // 教育
  ]));
  
  // メインタグの定義
  const mainTags = [
    {idx: 0, id: "276643c6-4e69-4d62-a7ba-457125d20a4f", name: "福祉", attribute: true},
    {idx: 2, id: "9a755098-dc5c-414d-92e3-f49c219589a1", name: "ゴミ", attribute: true},
    {idx: 3, id: "9acd6e59-ecc6-4654-a3ca-61a0d646e1aa", name: "環境", attribute: true},
    {idx: 4, id: "9f8bdc28-a28b-4647-b18f-56f8fafdbfca", name: "教育", attribute: true}
  ];
  
  // ソートボタンのクリック処理
  const handleSortClick = (sortType: string) => {
    if (setSelectedSort) {
      setSelectedSort(selectedSort === sortType ? null : sortType);
    }
  };
  
  // フィルタチェックボックスの処理
  const handleFilterToggle = (tagId: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(tagId)) {
      newFilters.delete(tagId);
    } else {
      newFilters.add(tagId);
    }
    setSelectedFilters(newFilters);
  };

  // アニメーション制御
  useEffect(() => {
    if (isNavigationExpanded) {
      // 開く時：即座に内容と枠を表示
      setShowContent(true);
      setShowFrame(true);
    } else {
      // 閉じる時：300ms後（アニメーション終了後）に内容を非表示
      const timer = setTimeout(() => {
        setShowContent(false);
        setShowFrame(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNavigationExpanded]);

  const navigationItems: NavigationItem[] = [
    {
      icon: House,
      label: 'ホーム',
      action: () => console.log('ホーム clicked'),
    },
    {
      icon: MagnifyingGlass,
      label: '検索',
      action: () => setIsSearchPopupVisible(!isSearchPopupVisible),
    },
    {
      icon: PencilSimple,
      label: '投稿',
      action: () => {
        if (setIsPostMode) {
          setIsPostMode(!isPostMode);
          console.log('投稿モード:', !isPostMode);
        }
      },
    },
    {
      icon: Trophy,
      label: 'ランキング',
      action: () => console.log('ランキング clicked'),
    },
    {
      icon: User,
      label: 'アカウント',
      action: () => console.log('アカウント clicked'),
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={`
          relative overflow-hidden
          rounded-full shadow-lg border-2 border-gray-300
          transition-[width] duration-300 ease-out h-14
          ${isNavigationExpanded ? 'w-[400px]' : 'w-14'}
          ${showFrame ? 'bg-white px-4 py-1' : 'bg-white'}
        `}
      >
        {!isNavigationExpanded ? (
          // 閉じている状態：矢印のみ
          <button
            onClick={() => setIsNavigationExpanded(true)}
            className="w-full h-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <CaretRight size={20} weight="bold" color="#374151" />
          </button>
        ) : showContent ? (
          // 展開している状態：アイコンとラベル
          <div className="flex items-center justify-between w-full h-full">
            {navigationItems.map((item, index) => {
              const isPostButton = item.label === '投稿';
              const isActive = isPostButton && isPostMode;
              
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center gap-0.5 hover:scale-110 transition-transform group flex-1 h-full ${
                    isActive ? 'bg-blue-100 rounded-lg' : ''
                  }`}
                >
                  <item.icon 
                    size={20} 
                    weight="regular" 
                    color={isActive ? "#2563eb" : "#374151"} 
                  />
                  <span className={`text-[10px] font-medium group-hover:text-gray-900 ${
                    isActive ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* 閉じるボタン */}
            <div className="ml-2 h-full flex items-center">
              <button
                onClick={() => setIsNavigationExpanded(false)}
                className="flex items-center justify-center w-8 h-8 hover:scale-110 transition-transform"
              >
                <CaretRight 
                  size={16} 
                  weight="bold" 
                  color="#374151" 
                  className="rotate-180" 
                />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* 検索ポップアップ */}
      {isSearchPopupVisible && (
        <div 
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}
        >
          {/* ポップアップヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1 mr-3">
              <input
                type="text"
                placeholder="投稿を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery?.(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setIsSearchPopupVisible(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              ✕
            </button>
          </div>
          
          {/* ポップアップ内容 */}
          <div className="p-4 flex-1">
            <div className="flex h-full space-x-4">
              {/* 左半分：ランキング */}
              <div className="w-1/2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">ランキング</h4>
                <div className="space-y-2">
                  {[
                    { key: 'empathy', label: '共感数' },
                    { key: 'good', label: 'good数' },
                    { key: 'comment', label: 'コメント数' }
                  ].map((sort) => (
                    <button
                      key={sort.key}
                      onClick={() => handleSortClick(sort.key)}
                      className={`w-full px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                        selectedSort === sort.key
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 右半分：フィルタ */}
              <div className="w-1/2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">フィルタ</h4>
                <div className="space-y-2">
                  {mainTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.has(tag.id)}
                        onChange={() => handleFilterToggle(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}