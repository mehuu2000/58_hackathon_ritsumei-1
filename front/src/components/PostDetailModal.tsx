'use client';

import { useEffect, useState } from 'react';
import { X, Heart, PaperPlaneRight, HandsClapping } from 'phosphor-react';
import { Post } from '@/data/mockPosts';

interface User {
  uid: string;
  display_name?: string;
  access_token: string;
  email: string;
  created_at: string;
}

interface PostDetailModalProps {
  post: Post | null;
  isVisible: boolean;
  onClose: () => void;
  onAnimationComplete?: () => void;
  user: User;
  onCommentAdd?: (postId: string, newComment: any) => void;
}

export default function PostDetailModal({ post, isVisible, onClose, onAnimationComplete, user, onCommentAdd }: PostDetailModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  
  // メインタグのID→name変換マップ
  const mainTagMap: {[key: string]: string} = {
    "276643c6-4e69-4d62-a7ba-457125d20a4f": "福祉",
    "9a755098-dc5c-414d-92e3-f49c219589a1": "ゴミ",
    "9acd6e59-ecc6-4654-a3ca-61a0d646e1aa": "環境",
    "9f8bdc28-a28b-4647-b18f-56f8fafdbfca": "教育"
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [commentLikeCounts, setCommentLikeCounts] = useState<{[key: string]: number}>({});
  const [newComment, setNewComment] = useState<string>('');
  const [isPostLiked, setIsPostLiked] = useState<boolean>(false);
  const [postLikeCount, setPostLikeCount] = useState<number>(0);

  // デバッグログ
  useEffect(() => {
    console.log('PostDetailModal props変更:', { 
      postTitle: post?.title || 'null', 
      isVisible, 
      isExpanded,
      showContent, 
      showFrame 
    });
  }, [post, isVisible, isExpanded, showContent, showFrame]);

  // アニメーション制御（PostModalと同じパターン）
  useEffect(() => {
    if (isVisible && post) {
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
        // アニメーション完了を親に通知
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, post]);

  // コメントのいいね状態と投稿のいいね状態を初期化
  useEffect(() => {
    if (post && post.comment) {
      const initialCounts: {[key: string]: number} = {};
      post.comment.forEach(comment => {
        initialCounts[comment.id] = comment.comment_good;
      });
      setCommentLikeCounts(initialCounts);
    }
    if (post) {
      setPostLikeCount(post.post_good);
    }
  }, [post]);

  // いいね機能のAPI呼び出し
  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`http://bomu.info:8000/reaction/comment/${commentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // いいね状態を更新
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (data.result_code) {
            newSet.add(commentId);
          } else {
            newSet.delete(commentId);
          }
          return newSet;
        });

        // いいね数を更新
        setCommentLikeCounts(prev => ({
          ...prev,
          [commentId]: parseInt(data.current_like_count)
        }));
      } else {
        console.error('いいね処理失敗:', response.statusText);
      }
    } catch (error) {
      console.error('いいね処理エラー:', error);
    }
  };

  // 投稿への共感機能のAPI呼び出し
  const handleLikePost = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`http://bomu.info:8000/reaction/post/${post.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // いいね状態を更新
        setIsPostLiked(data.result_code);

        // いいね数を更新
        setPostLikeCount(parseInt(data.current_like_count));
      } else {
        console.error('投稿いいね処理失敗:', response.statusText);
      }
    } catch (error) {
      console.error('投稿いいね処理エラー:', error);
    }
  };

  // コメント送信処理
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;
    
    const requestData = {
      post_id: post.id,
      context: newComment
    };
    
    console.log('=== コメント送信デバッグ情報 ===');
    console.log('post.id の型:', typeof post.id);
    console.log('post.id の値:', post.id);
    console.log('newComment の型:', typeof newComment);
    console.log('newComment の値:', newComment);
    console.log('user オブジェクト:', user);
    console.log('user.access_token の型:', typeof user.access_token);
    console.log('requestData:', requestData);
    console.log('JSON.stringify(requestData):', JSON.stringify(requestData));
    console.log('送信先URL:', 'http://bomu.info:8000/comment');
    console.log('===================================');
    
    try {
      const response = await fetch('http://bomu.info:8000/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', response.headers);

      if (response.ok) {
        const newCommentData = await response.json();
        console.log('コメント作成成功:', newCommentData);
        
        // 親コンポーネントにコメント追加を通知
        console.log('onCommentAdd関数の存在確認:', typeof onCommentAdd);
        console.log('post.id:', post.id);
        console.log('newCommentData:', newCommentData);
        
        if (onCommentAdd) {
          console.log('onCommentAddを呼び出し中...');
          onCommentAdd(post.id, newCommentData);
          console.log('onCommentAdd呼び出し完了');
        } else {
          console.error('onCommentAdd関数が存在しません');
        }
        
        setNewComment('');
      } else {
        // エラーレスポンスの詳細も取得
        const errorText = await response.text();
        console.error('コメント作成失敗:', response.statusText);
        console.error('エラー詳細:', errorText);
      }
    } catch (error) {
      console.error('コメント作成エラー:', error);
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
      {post && (
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
                {/* 左半分：コメント一覧（スマホ風UI） */}
                <div className="w-1/2 pr-4 flex flex-col bg-gray-50 rounded-lg p-4">
                  
                  {/* コメント一覧 */}
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {post.comment
                      .sort((a, b) => new Date(b.comment_time).getTime() - new Date(a.comment_time).getTime())
                      .map((comment) => {
                        const isBestAnswer = post.best_answer_id && post.best_answer_id === comment.id;
                        const commentDate = new Date(comment.comment_time);
                        const formattedDate = `${commentDate.getFullYear()}年${commentDate.getMonth() + 1}月${commentDate.getDate()}日 ${commentDate.getHours()}:${commentDate.getMinutes().toString().padStart(2, '0')}`;
                        
                        return (
                          <div key={comment.id} className={`p-3 rounded-lg ${isBestAnswer ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                            <div className="flex items-start space-x-3">
                              {/* アイコン */}
                              <div className="flex flex-col items-center space-y-1">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                  {comment.name ? comment.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span className="text-xs text-gray-600 text-center truncate w-12">
                                  {comment.name || '不明'}
                                </span>
                              </div>
                              
                              {/* コメント内容 */}
                              <div className="flex-1 min-w-0">
                                <div className={`relative p-3 rounded-lg ${isBestAnswer ? 'bg-yellow-100' : 'bg-white'} border border-gray-200`}>
                                  {/* ベストアンサーバッジ */}
                                  {isBestAnswer && (
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-md transform rotate-[30deg]">
                                      BEST
                                    </div>
                                  )}
                                  
                                  {/* コメントテキスト */}
                                  <p className="text-gray-800 text-sm leading-relaxed mb-2">
                                    {comment.context}
                                  </p>
                                  
                                  {/* いいねボタンと日時 */}
                                  <div className="flex items-center justify-between">
                                    <button 
                                      onClick={() => handleLikeComment(comment.id)}
                                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                      <Heart 
                                        size={16} 
                                        className={`${likedComments.has(comment.id) ? 'text-red-500 fill-red-500' : 'text-red-400'} transition-colors`} 
                                      />
                                      <span className="text-sm">
                                        {commentLikeCounts[comment.id] !== undefined ? commentLikeCounts[comment.id] : comment.comment_good}
                                      </span>
                                    </button>
                                    <span className="text-xs text-gray-400">
                                      {formattedDate}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* コメント入力フォーム */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-3">
                      {/* ユーザーアイコン */}
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      
                      {/* 入力エリア */}
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="コメントを入力してください..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                          >
                            <PaperPlaneRight size={16} />
                            <span>送信</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 右半分：投稿詳細情報 */}
                <div className="w-1/2 pl-4 flex flex-col space-y-4">
                  {/* ユーザー情報と投稿日時 */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {post.user_name || post.id}
                      </span>
                      <span className="text-gray-600">
                        {post.prefectures}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(post.post_time).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* 画像表示 */}
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    {post.ImageURL ? (
                      <img
                        src={post.ImageURL}
                        alt="投稿画像"
                        className="w-full h-full object-cover"
                      />
                    ) : post.IconURL ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={post.IconURL}
                          alt="アイコン"
                          className="h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        画像なし
                      </div>
                    )}
                  </div>

                  {/* ベストアンサー */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ベストアンサー
                    </label>
                    <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {post.best_answer_id ? (
                        <>
                          {/* ベストアンサーバッジ */}
                          <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-md transform rotate-[30deg]">
                            BEST
                          </div>
                          {(() => {
                            const bestAnswer = post.comment.find(c => c.id === post.best_answer_id);
                            return bestAnswer ? (
                              <div>
                                <div className="font-medium text-gray-800 mb-1">
                                  {bestAnswer.name || '不明'}
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {bestAnswer.context}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">ベストアンサーが見つかりません</p>
                            );
                          })()}
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">まだありません。</p>
                      )}
                    </div>
                  </div>

                  {/* アチーブメント */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アチーブメント
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {post.achivement?.name ? (
                        <p className="text-gray-700 text-sm">{post.achivement.name}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">アチーブメントはありません</p>
                      )}
                    </div>
                  </div>

                  {/* タグ表示 */}
                  <div>
                    <div className="space-y-3">
                      {/* メインタグ（attribute: true） */}
                      {post.tag_list.filter(tag => tag.attribute).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">メインタグ</p>
                          <div className="flex flex-wrap gap-2">
                            {post.tag_list
                              .filter(tag => tag.attribute)
                              .map((tag, index) => {
                                // tag.nameがIDの場合はmainTagMapで変換、そうでなければそのまま表示
                                const displayName = mainTagMap[tag.name] || tag.name;
                                return (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full"
                                  >
                                    {displayName}
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      )}
                      
                      {/* サブタグ（attribute: false） */}
                      {post.tag_list.filter(tag => !tag.attribute).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">サブタグ</p>
                          <div className="flex flex-wrap gap-2">
                            {post.tag_list
                              .filter(tag => !tag.attribute)
                              .map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300"
                                >
                                  {tag.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* タグがない場合 */}
                      {post.tag_list.length === 0 && (
                        <p className="text-gray-500 text-sm">タグはありません</p>
                      )}
                    </div>
                  </div>

                  {/* 共感ボタン */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleLikePost}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <HandsClapping 
                        size={20} 
                        className={`${isPostLiked ? 'text-blue-500 fill-blue-500' : 'text-gray-500'} transition-colors`} 
                      />
                      <span className="text-sm font-medium">
                        {postLikeCount}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}