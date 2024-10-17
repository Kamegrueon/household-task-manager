// src/components/Pages/Account.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const Account: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const navigate = useNavigate();

  // ログインしているユーザーの情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/auth/me'); // 自分のユーザー情報を取得するAPI
        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (error) {
        toast.error('ユーザー情報の取得に失敗しました。');
      }
    };

    fetchUserInfo();
  }, []);

  // プロフィール更新処理
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedData: any = {};
      if (username) updatedData.username = username;
      if (email) updatedData.email = email;
      
      if (Object.keys(updatedData).length > 0) {
        await api.put('/auth/update-profile', updatedData);
        toast.success('プロフィールが更新されました。');
      } else {
        toast.warning('変更された内容がありません。');
      }
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました。');
    }
  };

  // パスワード変更処理
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('パスワードを入力してください。');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('パスワードが変更されました。');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error('パスワードの変更に失敗しました。');
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('access_token'); // JWTトークンを削除
    toast.success('ログアウトしました。');
    navigate('/login'); // ログイン画面にリダイレクト
  };

  return (
    <div className="max-w-full mx-auto bg-gray-100 rounded shadow p-4 sm:p-4">
      <h1 className="screen-title mb-4 text-xl sm:text-2xl">アカウント管理</h1>
      
      <div className="bg-white p-4 rounded shadow w-full">
        <h2 className="text-base font-semibold mb-2">プロフィール編集</h2>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">ユーザー名</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full p-2 bg-white text-gray-900 border rounded focus:ring focus:border-blue-500" 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">メールアドレス</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 bg-white text-gray-900 border rounded focus:ring focus:border-blue-500" 
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto">更新</button>
        </form>
      </div>

      <div className="bg-white rounded shadow p-4 mt-4 w-full">
        <h2 className="text-base font-semibold mb-2">パスワード変更</h2>
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label htmlFor="current-password" className="block text-gray-700">現在のパスワード</label>
            <input 
              type="password" 
              id="current-password" 
              name="current-password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="w-full p-2 bg-white text-gray-900 border rounded focus:ring focus:border-blue-500" 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="new-password" className="block text-gray-700">新しいパスワード</label>
            <input 
              type="password" 
              id="new-password" 
              name="new-password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full p-2 bg-white text-gray-900 border rounded focus:ring focus:border-blue-500" 
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto">変更</button>
        </form>
      </div>

      <div className="bg-gray-100 p-4 rounded mt-6 w-full">
        <button 
          onClick={handleLogout} 
          className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default Account;
