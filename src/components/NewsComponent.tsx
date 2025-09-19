'use client';

import { useState } from 'react';
import { MagnifyingGlass, Triangle } from 'phosphor-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  url: string;
  category: string;
  image?: string;
}

interface NewsComponentProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function NewsComponent({ isExpanded, setIsExpanded }: NewsComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // モックデータ
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: '今台気いい！米同氏テロから24年',
      content: '米同時多発テロから24年が経過し、追悼式典が行われました。詳細な内容についてはこちらをご確認ください。',
      timestamp: '2025-09-19 10:30',
      url: 'https://example.com/news1',
      category: 'ニュース'
    },
    {
      id: '2',
      title: '中国空母「福建」海自が初確認',
      content: '中国の空母「福建」について海上自衛隊が初めて確認したと発表されました。',
      timestamp: '2025-09-19 09:15',
      url: 'https://example.com/news2',
      category: 'ニュース'
    },
    {
      id: '3',
      title: '金正恩氏の娘 後継者と認定か',
      content: '北朝鮮の金正恩氏の娘について、後継者として認定される可能性が報じられています。',
      timestamp: '2025-09-19 08:45',
      url: 'https://example.com/news3',
      category: 'ニュース'
    },
    {
      id: '4',
      title: 'コンテナ貨物税し死亡 大府容疑か',
      content: 'コンテナ貨物に関する事件で死亡事故が発生し、大府容疑者が関与している可能性が浮上しています。',
      timestamp: '2025-09-19 07:20',
      url: 'https://example.com/news4',
      category: 'ニュース'
    },
    {
      id: '5',
      title: 'AI技術の進歩により未来都市計画が加速',
      content: 'AI技術を活用した都市計画システムが導入され、より効率的な都市開発が可能になりました。',
      timestamp: '2025-09-19 06:45',
      url: 'https://example.com/news5',
      category: 'テクノロジー'
    },
    {
      id: '6',
      title: '環境に優しい交通システムの実証実験開始',
      content: '電気自動車と公共交通機関を統合した新しい交通システムの実証実験が始まりました。',
      timestamp: '2025-09-19 06:00',
      url: 'https://example.com/news6',
      category: '環境'
    },
    {
      id: '7',
      title: 'スマートシティ構想に新たな投資',
      content: '政府がスマートシティ構想に対して大規模な投資を発表し、全国への展開を目指します。',
      timestamp: '2025-09-19 05:30',
      url: 'https://example.com/news7',
      category: '政治'
    },
    {
      id: '8',
      title: '次世代エネルギーシステムの開発進む',
      content: '再生可能エネルギーを活用した次世代エネルギーシステムの開発が順調に進んでいます。',
      timestamp: '2025-09-19 05:00',
      url: 'https://example.com/news8',
      category: 'エネルギー'
    },
    {
      id: '9',
      title: '都市農業の新技術により食料自給率向上',
      content: '垂直農業や水耕栽培などの新技術により、都市部での食料自給率が大幅に向上しました。',
      timestamp: '2025-09-19 04:15',
      url: 'https://example.com/news9',
      category: '農業'
    },
    {
      id: '10',
      title: 'デジタルツインによる都市管理システム導入',
      content: 'デジタルツイン技術を活用した都市管理システムが導入され、リアルタイムでの都市監視が可能になりました。',
      timestamp: '2025-09-19 03:45',
      url: 'https://example.com/news10',
      category: 'テクノロジー'
    }
  ]);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredNews = newsItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed top-0 right-16 z-40 h-screen pointer-events-none">
      <div className="flex flex-col h-full">
        {/* ニュースパネル（常に存在、閉じている時は高さ0） */}
        <div className={`w-80 self-center pointer-events-auto ${
          isExpanded 
            ? 'h-[70%] bg-white rounded-b-2xl shadow-xl border-l-2 border-r-2 border-b-2 border-gray-300 overflow-hidden' 
            : 'h-0 overflow-hidden'
        }`}>
          {isExpanded && (
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
              {filteredNews.map((news) => (
                <div key={news.id} className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    {/* サムネイル */}
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {news.image ? (
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover"
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
                      
                      {/* 時間とカテゴリ */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{news.timestamp}</span>
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded">
                          {news.category}
                        </span>
                      </div>
                      
                      {/* 内容（省略表示） */}
                      <p className="text-xs text-gray-600">
                        {truncateText(news.content, 40)}
                      </p>
                    </div>
                  </div>
                </div>
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
        <div className="flex flex-col items-center pointer-events-auto">
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