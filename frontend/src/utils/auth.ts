import { jwtDecode } from 'jwt-decode';
// import { TokenResponse } from '../types';

export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

interface DecodedToken {
  sub: string;
  exp: number;
}

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (Date.now() >= decoded.exp * 1000) {
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
};
