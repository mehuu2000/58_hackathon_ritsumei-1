'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlass, Triangle } from 'phosphor-react';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  image: string;
  source: {
    name: string;
    url: string;
  };
  publishedAt: string;
}

interface NewsComponentProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  newsItems: NewsItem[];
}

export default function NewsComponent({ isExpanded, setIsExpanded, newsItems }: NewsComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);

  // アニメーション制御
  useEffect(() => {
    if (isExpanded) {
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
  }, [isExpanded]);


  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredNews = newsItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed top-0 right-16 z-40 h-screen pointer-events-none">
      <div className="flex flex-col h-full">
        {/* ニュースパネル（常に存在、閉じている時は高さ0） */}
        <div className={`w-80 self-center pointer-events-auto transition-[height] duration-500 ease-out overflow-hidden ${
          isExpanded 
            ? 'h-[70%]' 
            : 'h-0'
        } ${
          showFrame
            ? 'bg-white rounded-b-2xl shadow-xl border-l-2 border-r-2 border-b-2 border-gray-300'
            : ''
        }`}>
          {showContent && (
            <div className="h-full flex flex-col">
              {/* ヘッダー */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">ニュース</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              {/* 検索バー */}
              <div className="relative">
                <MagnifyingGlass 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* ニュースリスト */}
            <div className="flex-1 overflow-y-auto">
              {filteredNews.map((news, index) => (
                <a 
                  key={index} 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* サムネイル */}
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {news.image ? (
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-xs text-gray-500">IMG</span></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* タイトル */}
                      <h4 className="text-sm font-medium text-gray-800 mb-1">
                        {truncateText(news.title, 25)}
                      </h4>
                      
                      {/* 公開日時とソース */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(news.publishedAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">
                          {news.source.name}
                        </span>
                      </div>
                      
                      {/* 記事の概要（省略表示） */}
                      <p className="text-xs text-gray-600">
                        {truncateText(news.description, 40)}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
              
              {filteredNews.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  検索結果が見つかりません
                </div>
              )}
            </div>
            </div>
          )}
        </div>
        
        {/* 吊り紐と持ち手のコンテナ */}
        <div className="flex flex-col items-center pointer-events-auto transition-all duration-500 ease-out">
          {/* 下向きの紐（常に表示） */}
          <div className="w-[3px] h-12 bg-gray-600"></div>
          
          {/* 三角形の持ち手（常に表示） */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative hover:scale-110 transition-transform -mt-1"
          >
            {/* Triangleアイコン */}
            <Triangle size={32} color="black" weight="bold" />
            {/* 三角形内の黒い点 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[1px] w-2 h-2 bg-black rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
}