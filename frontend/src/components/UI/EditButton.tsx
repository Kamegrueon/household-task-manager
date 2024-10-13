// frontend/src/components/UI/EditButton.tsx

import React from 'react';
import { FaEdit } from 'react-icons/fa';

interface EditButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className="text-green-500 hover:text-green-700"
      aria-label={ariaLabel}
    >
      <FaEdit />
    </button>
  );
};

export default EditButton;
