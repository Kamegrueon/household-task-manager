// src/components/Organisms/NavBar.tsx

import React from 'react';
import NavLinkItem from '../Molecules/NavLinkItem';
import IconButton from '../Molecules/IconButton';

interface NavBarProps {
  projectId: string;
  onProjectSettingsClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ projectId, onProjectSettingsClick }) => (
  <nav className="bg-gray-100 pt-4 hidden md:block">
    <div className="max-w-6xl mx-auto px-4 flex space-x-4">
      <NavLinkItem to="/projects" label="プロジェクト一覧" exact />
      <NavLinkItem to={`/projects/${projectId}/tasks/due`} label="未実施タスク一覧" />
      <NavLinkItem to={`/projects/${projectId}/tasks`} label="登録タスク一覧" exact />
      <NavLinkItem to={`/projects/${projectId}/executions`} label="タスク履歴一覧" />
      <IconButton
        onClick={onProjectSettingsClick}
        iconName="Settings"
        title="プロジェクト設定"
        className="ml-4"
        size={24}
      />
    </div>
  </nav>
);

export default NavBar;
