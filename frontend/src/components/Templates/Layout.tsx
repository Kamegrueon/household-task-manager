import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <>
      <Header /> {/* ヘッダーを表示 */}
      <main>
        <Outlet /> {/* 子ルートのコンポーネントを表示 */}
      </main>
    </>
  );
};

export default Layout;
