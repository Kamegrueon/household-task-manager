// frontend/src/hooks/useExecutionForm.ts

import { useState } from 'react';
import { TaskExecutionResponse } from '../types';

/**
 * カスタムフック: useExecutionForm
 * タスク実行履歴のフォーム状態管理と入力ハンドラーを提供します。
 *
 * @param initialData - フォームの初期値
 * @returns formData, handleChange, setFormData
 */
const useTaskExecutionForm = (initialData: Partial<TaskExecutionResponse>) => {
  const [formData, setFormData] = useState<Partial<TaskExecutionResponse>>(initialData);

  /**
   * 入力変更ハンドラー
   *
   * @param e - 入力イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return { formData, handleChange, setFormData };
};

export default useTaskExecutionForm;
