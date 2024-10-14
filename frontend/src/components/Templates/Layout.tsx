import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
  children?: ReactNode; // children の型を定義
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  return (
    <>
      <Header isLoggedIn={isLoggedIn} /> {/* ヘッダーを表示 */}
      <main>
        {children}
        <Outlet /> {/* 子ルートのコンポーネントを表示 */}
      </main>
    </>
  );
};

export default Layout;
