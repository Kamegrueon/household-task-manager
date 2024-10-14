// frontend/src/services/userApi.ts

import api from './api';
import { UserResponse } from '../types';

/**
 * ユーザー一覧を取得します。
 * @returns ユーザーの配列
 */
const getUsers = async (): Promise<UserResponse[]> => {
  const response = await api.get<UserResponse[]>('/users/');
  return response.data;
};

/**
 * メールアドレスでユーザーを検索します。
 * @param email 部分一致で検索するメールアドレス
 * @returns 検索結果のユーザーの配列
 */
const searchUsersByEmail = async (email: string): Promise<UserResponse[]> => {
  const response = await api.get<UserResponse[]>('/users/', {
    params: {
      email: email, // バックエンドが `email` クエリパラメータで検索をサポートしている場合
    },
  });
  return response.data;
};

/**
 * ユーザーIDでユーザーを取得します。
 * @param id ユーザーID
 * @returns ユーザー情報
 */
const getUserById = async (id: number): Promise<UserResponse | null> => {
  try {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('ユーザーの取得に失敗しました。', error);
    return null;
  }
};

export {
  getUsers,
  searchUsersByEmail,
  getUserById,
};
