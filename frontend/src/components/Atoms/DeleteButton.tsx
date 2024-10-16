// frontend/src/components/UI/DeleteButton.tsx

import React from 'react';
import { FaTrash } from 'react-icons/fa';

interface DeleteButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className="text-red-500 hover:text-red-700"
      aria-label={ariaLabel}
    >
      <FaTrash />
    </button>
  );
};

export default DeleteButton;
