// src/components/Atoms/Icon.tsx

import React from 'react';
import { FaBars, FaCog, FaUserCircle, FaTasks, FaList, FaHistory, FaHome, FaPlus, FaEdit, FaTrash, FaRegCheckCircle, FaUpload } from 'react-icons/fa';
import { IconEnum } from '../../types/atoms';

type IconProps = {
  size?: number;
  className?: string;
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
  Execute: FaRegCheckCircle,
  Upload: FaUpload
};

const Icon: React.FC<IconProps> = ({ iconName, size, className='' }) => {
    const IconComponent = iconMap[iconName];
    return (
        <IconComponent size={size} className={className} />
    )
};

export default Icon;
