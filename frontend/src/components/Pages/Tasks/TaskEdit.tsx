// frontend/src/components/Tasks/TaskEdit.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { TaskResponse } from '../../../types';
import useTaskForm from '../../../hooks/useTaskForm';
import { toast } from 'react-toastify';

const TaskEdit: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const [error, setError] = useState<string>('');
  const [updateError, setUpdateError] = useState<string>('');
  const navigate = useNavigate();

  // カスタムフックを使用してフォームデータとハンドラーを取得
  const { formData, handleChange, setFormData } = useTaskForm({
    category: '',
    task_name: '',
    frequency: 1,
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`);
        const task = response.data;
        setFormData({
          category: task.category,
          task_name: task.task_name,
          frequency: task.frequency,
        });
      } catch (err) {
        setError('タスクの取得に失敗しました。');
        toast.error('タスクの取得に失敗しました。');
      }
    };
    fetchTask();
  }, [projectId, taskId, setFormData]);

  /**
   * フォーム送信ハンドラー
   *
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, formData);
      toast.success('タスクが正常に更新されました。');
      navigate(`/projects/${projectId}/tasks`);
    } catch (err) {
      setUpdateError('タスクの更新に失敗しました。');
      toast.error('タスクの更新に失敗しました。');
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
        {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
    <h2 className="text-2xl font-bold mb-4">タスク編集</h2>
    {updateError && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
        {updateError}
        </div>
    )}
    <form onSubmit={handleSubmit}>
        <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 font-bold mb-2">
            カテゴリ
        </label>
        <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-white text-gray-900 border rounded"
        />
        </div>
        <div className="mb-4">
        <label htmlFor="task_name" className="block text-gray-700 font-bold mb-2">
            タスク名
        </label>
        <input
            type="text"
            id="task_name"
            name="task_name"
            value={formData.task_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-white text-gray-900 border rounded"
        />
        </div>
        <div className="mb-4">
        <label htmlFor="frequency" className="block text-gray-700 font-bold mb-2">
            頻度
        </label>
        <input
            type="number"
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            min={1}
            className="w-full px-3 py-2 bg-white text-gray-900 border rounded"
        />
        </div>
        <div className="flex justify-between">
        <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        >
            更新
        </button>
        <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
        >
            戻る
        </button>
        </div>
    </form>
    </div>
  );
};

export default TaskEdit;
