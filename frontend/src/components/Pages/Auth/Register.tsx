// src/components/Pages/Register.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { UserCreateParams, UserResponse, TokenResponse } from '../../../types';
import { setAccessToken, setRefreshToken } from '../../../utils/auth'; // トークンを保存するユーティリティをインポート
import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<UserCreateParams>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ユーザー登録
      await api.post<UserResponse>('/auth/register/', form);
      setSuccess('ユーザー登録に成功しました。自動的にログインします...');
      setError('');

      // 自動ログイン
      const loginResponse = await api.post<TokenResponse>(
        '/auth/login/', 
        new URLSearchParams({
          username: form.email,
          password: form.password,
        }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // トークンを保存
      setAccessToken(loginResponse.data.access_token);
      setRefreshToken(loginResponse.data.refresh_token);
      toast.success('ログインに成功しました。');

      // /projects/ にリダイレクト
      navigate('/projects/');
    } catch (err: any) {
      // 登録エラー
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'ユーザー登録に失敗しました。');
      } else {
        setError('ユーザー登録に失敗しました。入力内容を確認してください。');
      }
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">ユーザー登録</h2>
        {error && <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}
        {success && <div className="p-4 text-green-700 bg-green-100 border border-green-400 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-green-500 rounded focus:outline-none focus:ring ring-green-500"
          >
            登録
          </button>
        </form>
        <div className="text-center">
          <span className="text-sm text-gray-600">既にアカウントをお持ちですか？ </span>
          <Link to="/login" className="text-green-500 hover:underline">ログインはこちら</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
