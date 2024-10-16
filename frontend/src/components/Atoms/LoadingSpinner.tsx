// frontend/src/components/UI/LoadingSpinner.tsx

import React from 'react';
import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  loading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading }) => {
  return (
    <div className="flex justify-center">
      <ClipLoader color="#3b82f6" loading={loading} size={50} />
    </div>
  );
};

export default LoadingSpinner;
