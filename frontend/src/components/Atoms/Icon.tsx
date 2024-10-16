// src/components/Atoms/Icon.tsx

import React from 'react';
import { FaBars, FaCog, FaUserCircle, FaTasks, FaList, FaHistory, FaHome, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { IconEnum } from '../../types/atoms';

type IconProps = {
  size?: number;
} & IconEnum

const iconMap = {
  Menu: FaBars,
  Settings: FaCog,
  User: FaUserCircle,
  Tasks: FaTasks,
  List: FaList,
  History: FaHistory,
  Home: FaHome,
  Plus: FaPlus,
  Edit: FaEdit,
  Trash: FaTrash,
};

const Icon: React.FC<IconProps> = ({ iconName, size = 24 }) => {
    const IconComponent = iconMap[iconName];
    return (
        <IconComponent size={size}/>
    )
};

export default Icon;
