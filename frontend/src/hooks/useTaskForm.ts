// frontend/src/hooks/useTaskForm.ts

import { useState } from 'react';
import { TaskCreateParams } from '../types';
import { toast } from 'react-toastify';

/**
 * カスタムフック: useTaskForm
 * タスクのフォーム状態管理と入力ハンドラーを提供します。
 *
 * @param initialData - フォームの初期値
 * @returns formData, handleChange, setFormData
 */
const useTaskForm = (initialData: TaskCreateParams) => {
  const [formData, setFormData] = useState<TaskCreateParams>(initialData);

  /**
   * 入力変更ハンドラー
   *
   * @param e - 入力イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'frequency') {
      const numValue = Number(value);
      if (numValue < 1) {
        toast.error('頻度は1以上の数字でなければなりません。');
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return { formData, handleChange, setFormData };
};

export default useTaskForm;
