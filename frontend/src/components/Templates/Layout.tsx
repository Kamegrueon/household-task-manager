import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
  children?: ReactNode; // children の型を定義
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem('access_token'));
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen gap-y-4 md:gap-y-6 lg:gap-y-8">
      <Header isLoggedIn={isLoggedIn} /> {/* ヘッダーを表示 */}
        <main className="flex-grow p-2 md:p-6 lg:p-8 py-20 md:py-28 lg:py-48">
          <div className="bg-gray-100 p-2">
            {children}
          </div>
        <Outlet /> {/* 子ルートのコンポーネントを表示 */}
      </main>
    </div>
  );
};

export default Layout;
