'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthOverlay() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // 認証処理をここに実装
      alert(`ログイン：仮: ${email}`);
      // 認証成功後にホームページにリダイレクト
      router.push('/home');
    } else {
      alert('メールアドレスとパスワードを入力してください');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // サインアップ処理をここに実装
      alert(`サインアップ：仮: ${email}`);
      // サインアップ成功後にホームページにリダイレクト
      router.push('/home');
    } else {
      alert('すべての項目を入力してください');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div className="bg-gray-700 bg-opacity-85 rounded-lg shadow-2xl">
        <form 
          onSubmit={isSignup ? handleSignup : handleLogin} 
          className="flex flex-col gap-4 p-6 min-w-[500px]"
        >
          {/* メールアドレス */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white text-sm font-medium">
              メールアドレス（ログイン用ID）
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-[3px] border-none text-[20px] bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>

          {/* パスワード */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded-[3px] border-none text-[20px] bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="パスワードを入力"
            />
          </div>

          {/* ボタン */}
          <div className="flex flex-col gap-2 mt-2">
            <button
              type="submit"
              className="mt-4 px-4 py-4 rounded-[16px] bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              {isSignup ? 'サインアップ' : 'ログイン'}
            </button>
            
            <div>
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="px-4 py-2 rounded text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                {isSignup ? 'ログイン' : 'サインアップ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}