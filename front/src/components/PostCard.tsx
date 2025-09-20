import { Post } from '@/data/mockPosts';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  isPostMode?: boolean;
}

export default function PostCard({ post, onClick, isPostMode = false }: PostCardProps) {
  return (
    <div 
      className={`flex flex-col items-center ${!isPostMode ? 'cursor-pointer' : ''}`}
      onClick={!isPostMode ? onClick : undefined}
      style={{ pointerEvents: isPostMode ? 'none' : 'auto' }}
    >
      {/* アイコン */}
      <div className="text-3xl mb-1">{post.IconURL}</div>
      {/* タイトル */}
      <div className="text-sm font-medium text-gray-900 text-center max-w-24 leading-tight">
        {post.title}
      </div>
    </div>
  );
}