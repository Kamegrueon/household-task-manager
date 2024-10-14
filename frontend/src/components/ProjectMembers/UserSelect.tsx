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
  excludeUserIds?: number[];
}

const UserSelect: React.FC<UserSelectProps> = ({ selectedUserId, onChange, excludeUserIds = [] }) => {
  const [selectedOption, setSelectedOption] = useState<UserOption | null>(null);

  const loadOptions = async (inputValue: string): Promise<UserOption[]> => {
    if (!inputValue) return [];
    try {
      const users = await searchUsersByEmail(inputValue);
      const filteredUsers = users.filter(user => !excludeUserIds.includes(user.id));
      return filteredUsers.map(user => ({
        label: `${user.username}`,
        value: user.id,
      }));
    } catch (error) {
      console.error('ユーザーの検索に失敗しました。', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchSelectedUser = async () => {
      if (selectedUserId > 0) {
        try {
          const user = await getUserById(selectedUserId);
          if (user) {
            setSelectedOption({
              label: `${user.username}`,
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
        placeholder="ユーザー名で検索..."
        noOptionsMessage={() => "ユーザーが見つかりませんでした"}
        className="block w-full bg-white text-gray-900 border rounded focus:outline-none focus:ring"
        components={{ DropdownIndicator: () => <FaSearch className="mr-2 text-gray-400" /> }}
      />
    </div>
  );
};

export default UserSelect;
