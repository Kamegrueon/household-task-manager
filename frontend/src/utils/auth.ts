// src/utils/auth.ts

import { jwtDecode } from 'jwt-decode';

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token);
};

export const removeTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

interface DecodedToken {
  sub: string;
  exp: number;
}

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (Date.now() >= decoded.exp * 1000) {
      removeTokens();
      return false;
    }
    return true;
  } catch (error) {
    removeTokens();
    return false;
  }
};
