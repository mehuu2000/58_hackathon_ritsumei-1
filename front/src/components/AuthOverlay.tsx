'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthOverlay() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password_hash: password
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // レスポンスの詳細をconsole.logで表示
        console.log('=== ログインレスポンス ===');
        console.log('access_token:', data.access_token);
        console.log('refresh_token:', data.refresh_token);
        console.log('user_id:', data.user_id);
        console.log('is_authenticated:', data.is_authenticated);
        console.log('レスポンス全体:', data);
        
        // トークン情報をlocalStorageに保存
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_id', data.user_id);
        
        console.log('✅ localStorage に保存完了');
        
        // ログイン成功
        alert('ログインに成功しました！');
        
        // 認証成功後にホームページにリダイレクト
        router.push('/home');
        
      } catch (error) {
        console.error('ログインエラー:', error);
        alert(`ログインに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      alert('メールアドレスとパスワードを入力してください');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password_hash: password
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // サインアップ成功
        alert('サインアップが完了しました！ログインしてください。');
        
        // ログイン画面に切り替え
        setIsSignup(false);
        
      } catch (error) {
        console.error('サインアップエラー:', error);
        alert(`サインアップに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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