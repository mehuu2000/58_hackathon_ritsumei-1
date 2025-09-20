import { useState, useEffect } from 'react';
import { Post } from '@/data/mockPosts';
import { Heart, ChatCircle, Clock } from 'phosphor-react';

interface PostHoverPopupProps {
  post: Post;
  isVisible: boolean;
  position: 'left' | 'right';
  mousePosition: { x: number; y: number };
}

export default function PostHoverPopup({ post, isVisible, position, mousePosition }: PostHoverPopupProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    setFormattedDate(formatDate(post.post_time));
  }, [post.post_time]);

  if (!isVisible) return null;

  const totalReward = post.distribution_reward + post.direct_reward;

  // ポップアップの位置を計算
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    top: mousePosition.y - 20,
    [position === 'left' ? 'left' : 'right']: position === 'left' 
      ? mousePosition.x + 20 
      : window.innerWidth - mousePosition.x + 20,
    zIndex: 1000,
    pointerEvents: 'none'
  };

  return (
    <div 
      style={popupStyle}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-64"
    >
      {/* タイトル */}
      <h3 className="font-semibold text-gray-900 text-base mb-3 leading-tight">
        {post.title}
      </h3>

      {/* 画像プレースホルダー */}
      <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <span className="text-4xl">{post.IconURL}</span>
      </div>

      {/* 配布トークン総数 */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">配布トークン総数</span>
          <span className="font-semibold text-lg text-blue-600">{totalReward}t</span>
        </div>
      </div>

      {/* アチーブメント */}
      {post.achivement && (
        <div className="mb-3">
          <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs text-center">
            {post.achivement}
          </div>
        </div>
      )}

      {/* いいね数、コメント数、投稿時間 (横並び) */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Heart size={14} />
          <span>{post.post_good}</span>
        </div>
        <div className="flex items-center gap-1">
          <ChatCircle size={14} />
          <span>{post.comment.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}