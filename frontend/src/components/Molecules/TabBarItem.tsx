// src/components/Molecules/TabBarItem.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../Atoms/Icon';

interface TabBarItemProps {
  to: string;
  iconName: 'Tasks' | 'List' | 'History' | 'Home';
  exact?: boolean
  label: string;
}

const TabBarItem: React.FC<TabBarItemProps> = ({ to, iconName, exact, label }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex flex-col items-center py-2 ${
        isActive ? 'text-[#4CAF50]' : 'text-gray-600'
      }`
    }
  >
    <Icon iconName={iconName} size={24} />
    <span className="text-xs">{label}</span>
  </NavLink>
);

export default TabBarItem;
