// frontend/src/components/ProjectMembers/UserSelect.tsx

import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { searchUsersByEmail, getUserById } from '../../services/userApi';
import { FaSearch } from 'react-icons/fa';

interface UserOption {
  label: string;
  value: number;
}

interface UserSelectProps {
  selectedUserId: number;
  onChange: (userId: number) => void;
  excludeUserIds?: number[]; // **追加**
}

const UserSelect: React.FC<UserSelectProps> = ({ selectedUserId, onChange, excludeUserIds = [] }) => { // **修正**
  const [selectedOption, setSelectedOption] = useState<UserOption | null>(null);

  // loadOptions を Promise スタイルで定義
  const loadOptions = async (inputValue: string): Promise<UserOption[]> => {
    if (!inputValue) return [];
    try {
      const users = await searchUsersByEmail(inputValue);
      // 既存メンバーを除外
      const filteredUsers = users.filter(user => !excludeUserIds.includes(user.id));
      return filteredUsers.map(user => ({
        label: `${user.username} (${user.email})`,
        value: user.id,
      }));
    } catch (error) {
      console.error('ユーザーの検索に失敗しました。', error);
      return [];
    }
  };

  // 選択されたユーザーの情報を取得してセット
  useEffect(() => {
    const fetchSelectedUser = async () => {
      if (selectedUserId > 0) {
        try {
          const user = await getUserById(selectedUserId);
          if (user) {
            setSelectedOption({
              label: `${user.username} (${user.email})`,
              value: user.id,
            });
          } else {
            setSelectedOption(null);
          }
        } catch (error) {
          console.error('ユーザー情報の取得に失敗しました。', error);
          setSelectedOption(null);
        }
      } else {
        setSelectedOption(null);
      }
    };

    fetchSelectedUser();
  }, [selectedUserId]);

  // 選択変更時のハンドラー
  const handleChange = (option: UserOption | null) => {
    if (option) {
      onChange(option.value);
    } else {
      onChange(0);
    }
    setSelectedOption(option);
  };

  return (
    <div>
      <label htmlFor="user_select" className="block text-sm font-medium text-gray-700">ユーザー</label>
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        value={selectedOption}
        onChange={handleChange}
        placeholder="メールアドレスで検索..."
        noOptionsMessage={() => "ユーザーが見つかりませんでした"}
        className="mt-1"
        components={{ DropdownIndicator: () => <FaSearch className="mr-2 text-gray-400" /> }}
      />
    </div>
  );
};

export default UserSelect;
