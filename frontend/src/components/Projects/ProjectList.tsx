// src/components/Pages/ProjectList.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useProjects from '../../hooks/useProjects';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ErrorMessage from '../Atoms/ErrorMessage';
import LoadingSpinner from '../Atoms/LoadingSpinner';
import ProjectTable from '../Organisms/ProjectTable';
import Icon from '../Atoms/Icon';

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
        <div className="flex justify-between items-center py-2">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">プロジェクト一覧</h2>
          <button
            onClick={() => navigate(`/projects/new`)}
            className="bg-[#4CAF50] text-white rounded-full p-2 md:px-4 md:py-2 md:flex md:items-center md:space-x-2 text-sm md:text-base lg:text-lg"
          >
            {/* レスポンシブ対応: モバイルではアイコンのみ、デスクトップではテキスト付き */}
            <Icon iconName='Plus' />
            <span className="hidden md:inline">新規プロジェクト</span>
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && <ErrorMessage message={error} />}
        {deleteError && <ErrorMessage message={deleteError} />}

        {/* ローディングスピナー */}
        {loading ? (
          <LoadingSpinner loading={loading} />
        ) : projects.length > 0 ? (
          <ProjectTable
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <p className="text-center text-gray-500">プロジェクトが存在しません。</p>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
