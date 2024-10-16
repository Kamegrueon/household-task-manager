// src/components/Molecules/IconButton.tsx

import React from 'react';
import Button from '../Atoms/Button';
import Icon from '../Atoms/Icon';
import { IconEnum } from '../../types/atoms';

type IconButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  className?: string;
  size?: number;
} & IconEnum

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  iconName,
  title,
  className = '',
  size = 24,
}) => (
  <Button
    onClick={onClick}
    title={title}
    className={`text-gray-600 hover:text-gray-800 ${className}`}
  >
    <Icon iconName={iconName} size={size} />
  </Button>
);

export default IconButton;