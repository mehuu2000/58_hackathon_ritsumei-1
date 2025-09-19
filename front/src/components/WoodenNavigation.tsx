'use client';

import { useState, useEffect } from 'react';
import { House, MagnifyingGlass, PencilSimple, Trophy, User, CaretRight, IconProps } from 'phosphor-react';
import { useNavigation } from '@/contexts/NavigationContext';

interface NavigationItem {
  icon: React.ComponentType<IconProps>;
  label: string;
  action: () => void;
}

interface WoodenNavigationProps {
  isPostMode?: boolean;
  setIsPostMode?: (mode: boolean) => void;
}

export default function WoodenNavigation({ isPostMode = false, setIsPostMode }: WoodenNavigationProps) {
  const { isNavigationExpanded, setIsNavigationExpanded } = useNavigation();
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);

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
      action: () => console.log('検索 clicked'),
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
    </div>
  );
}