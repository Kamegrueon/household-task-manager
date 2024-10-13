// frontend/src/hooks/useProjectForm.ts

import { useState } from 'react';
import { ProjectCreateParams } from '../types';

/**
 * カスタムフック: useProjectForm
 * プロジェクトのフォーム状態管理と入力ハンドラーを提供します。
 *
 * @param initialData - フォームの初期値
 * @returns formData, handleChange, setFormData
 */
const useProjectForm = (initialData: ProjectCreateParams) => {
  const [formData, setFormData] = useState<ProjectCreateParams>(initialData);

  /**
   * 入力変更ハンドラー
   *
   * @param e - 入力イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return { formData, handleChange, setFormData };
};

export default useProjectForm;
