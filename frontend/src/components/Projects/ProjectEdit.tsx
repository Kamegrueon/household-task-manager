// frontend/src/components/Projects/ProjectEdit.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ProjectResponse } from '../../types';
import useProjectForm from '../../hooks/useProjectForm';
import { toast } from 'react-toastify';

const ProjectEdit: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [updateError, setUpdateError] = useState<string>('');

  // カスタムフックを使用してフォームデータとハンドラーを取得
  const { formData, handleChange, setFormData } = useProjectForm({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get<ProjectResponse>(`/projects/${project_id}`);
        const project = response.data;
        setFormData({
          name: project.name,
          description: project.description || '',
        });
      } catch (err) {
        setError('プロジェクトの取得に失敗しました。');
        toast.error('プロジェクトの取得に失敗しました。');
      }
    };
    fetchProject();
  }, [project_id, setFormData]);

  /**
   * フォーム送信ハンドラー
   *
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${project_id}`, formData);
      toast.success('プロジェクトが正常に更新されました。');
      navigate('/projects');
    } catch (err) {
      setUpdateError('プロジェクトの更新に失敗しました。');
      toast.error('プロジェクトの更新に失敗しました。');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">プロジェクト編集</h2>
        {updateError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {updateError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
              プロジェクト名
            </label>
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
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
              rows={4}
            ></textarea>
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-[#4CAF50] text-white rounded-full focus:outline-none focus:ring focus:ring-green-200"
            >
              更新
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300"
            >
              戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEdit;
