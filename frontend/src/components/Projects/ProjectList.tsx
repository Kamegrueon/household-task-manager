import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import useProjects from '../../hooks/useProjects';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ErrorMessage from '../UI/ErrorMessage';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, error, setProjects } = useProjects();
  const [deleteError, setDeleteError] = useState<string>('');

  const handleDelete = async (projectId: number) => {
    const confirmDelete = window.confirm('本当にこのプロジェクトを削除しますか？');
    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
      toast.success('プロジェクトが正常に削除されました。');
    } catch (err) {
      setDeleteError('プロジェクトの削除に失敗しました。');
      toast.error('プロジェクトの削除に失敗しました。');
    }
  };

  const handleEdit = (projectId: number) => {
    navigate(`/projects/${projectId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        {/* プロジェクト一覧ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">プロジェクト一覧</h2>
          <button
            onClick={() => navigate(`/projects/new`)}
            className="bg-[#4CAF50] text-white rounded-full p-2 md:px-4 md:py-2 md:flex md:items-center md:space-x-2 text-sm md:text-base lg:text-lg"
          >
            {/* レスポンシブ対応: モバイルではアイコンのみ、デスクトップではテキスト付き */}
            <FaPlus className="text-white" />
            <span className="hidden md:inline">新規プロジェクト</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {deleteError && <ErrorMessage message={deleteError} />}
        
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
                        className="hover:underline"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="px-4 py-2 border-b text-center">{project.description}</td>
                    <td className="py-2 border-b text-center">
                      {/* 編集ボタン */}
                      <button
                        onClick={() => handleEdit(project.id)}
                        className="text-[#4CAF50] hover:text-green-700"
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
