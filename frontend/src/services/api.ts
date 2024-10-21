import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { getRefreshToken, removeTokens, setAccessToken, setRefreshToken } from '../utils/auth';
import { TokenResponse } from '../types';
import { toast } from 'react-toastify';

// 環境変数からAPIのベースURLを取得
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// リクエストインターセプターを設定して、JWTトークンをヘッダーに追加
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプターで401エラーを処理
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh_token = getRefreshToken();
      if (refresh_token) {
        try {
          const response = await api.post<TokenResponse>('/auth/refresh/', { refresh_token });
          setAccessToken(response.data.access_token);
          setRefreshToken(response.data.refresh_token);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
          }
          return axios(originalRequest);
        } catch (refreshError: any) {
          removeTokens();
          toast.error('セッションが期限切れになりました。再度ログインしてください。');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        removeTokens();
        toast.error('セッションが期限切れになりました。再度ログインしてください。');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
