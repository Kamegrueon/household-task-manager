// frontend/src/components/Projects/ProjectCreate.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ProjectResponse } from '../../types';
import useProjectForm from '../../hooks/useProjectForm';
import { toast } from 'react-toastify';

const ProjectCreate: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  // カスタムフックを使用してフォームデータとハンドラーを取得
  const { formData, handleChange } = useProjectForm({
    name: '',
    description: '',
  });

  /**
   * フォーム送信ハンドラー
   *
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<ProjectResponse>('/projects/', formData);
      toast.success('プロジェクトが正常に作成されました。');
      navigate(`/projects/${response.data.id}/tasks`);
    } catch (err) {
      setError('プロジェクトの作成に失敗しました。');
      toast.error('プロジェクトの作成に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">新規プロジェクト作成</h2>
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">プロジェクト名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">説明</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
              rows={4}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold bg-[#4CAF50] text-white rounded-full focus:outline-none focus:ring"
          >
            作成
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreate;
