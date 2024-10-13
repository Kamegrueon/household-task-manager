import React from 'react';

const Account: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">アカウント管理</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">プロフィール編集</h2>
        {/* プロフィール編集フォームをここに追加 */}
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">ユーザー名</label>
            <input type="text" id="username" name="username" className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">メールアドレス</label>
            <input type="email" id="email" name="email" className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">更新</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-2">パスワード変更</h2>
        {/* パスワード変更フォームをここに追加 */}
        <form>
          <div className="mb-4">
            <label htmlFor="current-password" className="block text-gray-700">現在のパスワード</label>
            <input type="password" id="current-password" name="current-password" className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label htmlFor="new-password" className="block text-gray-700">新しいパスワード</label>
            <input type="password" id="new-password" name="new-password" className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">変更</button>
        </form>
      </div>
    </div>
  );
};

export default Account;
