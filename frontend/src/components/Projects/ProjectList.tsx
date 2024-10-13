// frontend/src/components/Projects/ProjectList.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrash, FaEdit } from 'react-icons/fa';
import useProjects from '../../hooks/useProjects';
import { toast } from 'react-toastify';
import ErrorMessage from '../UI/ErrorMessage';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();

  // カスタムフックを使用してプロジェクトの状態を管理
  const { projects, loading, error, setProjects } = useProjects();

  const [deleteError, setDeleteError] = useState<string>('');

  /**
   * プロジェクト削除ハンドラー
   *
   * @param projectId - 削除するプロジェクトのID
   */
  const handleDelete = async (projectId: number) => {
    const confirmDelete = window.confirm('本当にこのプロジェクトを削除しますか？');
    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${projectId}`);
      // プロジェクトが削除されたら、projectsステートを更新
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
      toast.success('プロジェクトが正常に削除されました。');
    } catch (err) {
      setDeleteError('プロジェクトの削除に失敗しました。');
      toast.error('プロジェクトの削除に失敗しました。');
    }
  };

  /**
   * プロジェクト編集ハンドラー
   *
   * @param projectId - 編集するプロジェクトのID
   */
  const handleEdit = (projectId: number) => {
    navigate(`/projects/${projectId}/edit`); // 編集ページへのルートを指定
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">プロジェクト一覧</h2>
        {error && <ErrorMessage message={error} />}
        {deleteError && <ErrorMessage message={deleteError} />}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(`/projects/new`)}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            新規プロジェクト作成
          </button>
        </div>
        {loading ? (
            <LoadingSpinner loading={loading} />
        ) : projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">プロジェクト名</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">説明</th>
                  <th className="py-2 border-b bg-gray-200 text-center" colSpan={2}></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b text-center">
                      <button
                        onClick={() => navigate(`/projects/${project.id}/tasks`)}
                        className="text-blue-500 hover:underline"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="px-4 py-2 border-b text-center">{project.description}</td>
                    <td className="py-2 border-b text-center">
                      {/* 編集ボタン */}
                      <button
                        onClick={() => handleEdit(project.id)}
                        className="text-green-500 hover:text-green-700"
                        aria-label={`Edit project ${project.name}`}
                      >
                        <FaEdit />
                      </button>
                    </td>
                    <td className="py-2 border-b text-center">
                      {/* 削除ボタン */}
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Delete project ${project.name}`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">プロジェクトが存在しません。</p>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
