// frontend/src/hooks/useProjectMemberForm.ts

import { useState } from 'react';
import { ProjectMemberCreate } from '../types';

const useProjectMemberForm = (initialState: ProjectMemberCreate) => {
  const [formData, setFormData] = useState<ProjectMemberCreate>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // user_id は数値として扱う
    if (name === 'user_id') {
      setFormData(prevState => ({
        ...prevState,
        [name]: value ? parseInt(value) : 0,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  return {
    formData,
    handleChange,
  };
};

export default useProjectMemberForm;
