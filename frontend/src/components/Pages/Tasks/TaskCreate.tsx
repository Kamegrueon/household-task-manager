// frontend/src/components/Tasks/TaskCreate.tsx

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { TaskResponse } from '../../../types';
import useTaskForm from '../../../hooks/useTaskForm';
import { toast } from 'react-toastify';

const TaskCreate: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [error, setError] = useState<string>('');

  // カスタムフックを使用してフォームデータとハンドラーを取得
  const { formData, handleChange } = useTaskForm({
    category: '',
    task_name: '',
    frequency: 1,
  });

  /**
   * フォーム送信ハンドラー
   *
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post<TaskResponse>(`/projects/${projectId}/tasks/`, formData);
      toast.success('タスクが正常に作成されました。');
      navigate(`/projects/${projectId}/tasks`);
    } catch (err) {
      setError('タスクの作成に失敗しました。');
      toast.error('タスクの作成に失敗しました。');
    }
  };

  return (
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">新規タスク作成</h2>
        {error && <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700">カテゴリ</label>
            <input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label htmlFor="task_name" className="block mb-1 text-sm font-medium text-gray-700">タスク名</label>
            <input
              type="text"
              id="task_name"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label htmlFor="frequency" className="block mb-1 text-sm font-medium text-gray-700">実施頻度</label>
            <input
              id="frequency"
              name="frequency"
              type="number"
              value={formData.frequency}
              onChange={handleChange}
              required
              min={1}
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold bg-green-500 text-white rounded-full focus:outline-none focus:ring"
          >
            作成
          </button>
        </form>
      </div>
  );
};

export default TaskCreate;
