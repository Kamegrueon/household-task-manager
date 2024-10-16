// src/components/Organisms/TabBar.tsx

import React from 'react';
import TabBarItem from '../Molecules/TabBarItem';

interface TabBarProps {
  projectId: string;
}

const TabBar: React.FC<TabBarProps> = ({ projectId }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white shadow md:hidden">
    <div className="flex justify-around">
      <TabBarItem to="/projects" iconName="Home" exact label="プロジェクト" />
      <TabBarItem
        to={`/projects/${projectId}/tasks/due`}
        iconName="Tasks"
        label="未実施"
      />
      <TabBarItem
        to={`/projects/${projectId}/tasks`}
        iconName="List"
        exact
        label="登録タスク"
      />
      <TabBarItem
        to={`/projects/${projectId}/executions`}
        iconName="History"
        label="タスク履歴"
      />
    </div>
  </nav>
);

export default TabBar;
