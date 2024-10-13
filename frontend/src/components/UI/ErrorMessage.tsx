// frontend/src/components/UI/ErrorMessage.tsx

import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
      {message}
    </div>
  );
};

export default ErrorMessage;
