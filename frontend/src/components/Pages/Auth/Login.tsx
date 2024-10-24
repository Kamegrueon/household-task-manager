// src/components/Pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { setAccessToken, setRefreshToken } from '../../../utils/auth';
import { TokenResponse } from '../../../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ 
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<TokenResponse>('/auth/login/', new URLSearchParams(form), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      navigate('/projects');
    } catch (err) {
      setError('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">ログイン</h2>
        {error && <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">メールアドレス</label>
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
            ログイン
          </button>
        </form>
        <div className="text-center">
          <span className="text-sm text-gray-600">アカウントをお持ちでないですか？ </span>
          <Link to="/register" className="text-green-500 hover:underline">登録はこちら</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
