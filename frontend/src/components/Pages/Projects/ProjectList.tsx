// src/components/Pages/ProjectList.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjects from '../../../hooks/useProjects';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import ErrorMessage from '../../Atoms/ErrorMessage';
import LoadingSpinner from '../../Atoms/LoadingSpinner';
import TableComponent from '../../Organisms/TableComponent';
import { ActionsType } from '../../../types/atoms';
import IconButton from '../../Molecules/IconButton';
import useResponsiveIconSize from '../../../hooks/useResponsiveIconSize';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, error, setProjects } = useProjects();
  const [deleteError, setDeleteError] = useState<string>('');
  const iconSize = useResponsiveIconSize();

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

  // テーブルのカラム定義
  const columns: { key: keyof typeof projects[0]; label: string; hiddenOnMobile?: boolean }[] = [
    { key: 'name', label: 'プロジェクト名' },
    { key: 'description', label: '説明', hiddenOnMobile: true },
  ];

  // テーブルのアクション定義
  const actions: ActionsType[] = [
    {
      iconName: 'Edit',
      title: '編集',
      onClick: handleEdit,
      className: 'text-green-500 hover:text-green-700',
      size: iconSize,
    },
    {
      iconName: 'Trash',
      title: '削除',
      onClick: handleDelete,
      className: 'text-red-500 hover:text-red-700',
      size: iconSize,
    },
  ];

  return (
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-4">
        <div className="flex justify-between items-center py-2">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">プロジェクト一覧</h2>
          <IconButton
            onClick={() => navigate(`/projects/new`)}
            className="flex items-center bg-green-500 text-white rounded-full p-2 hover:bg-green-600 focus:outline-none focus:ring"
            iconName="Plus"
            title="新規タスク"
            size={iconSize}
            >
            <span className="hidden md:inline mx-2">新規プロジェクト</span>
          </IconButton>
        </div>

        {error && <ErrorMessage message={error} />}
        {deleteError && <ErrorMessage message={deleteError} />}

        {loading ? (
            <LoadingSpinner loading={loading} />
        ) : projects.length > 0 ? (
          <TableComponent
            items={projects}
            columns={columns}
            actions={actions}
            onRowClick={(projectId) => navigate(`/projects/${projectId}/tasks/due`)}
          />
        ) : (
          <p className="text-center text-gray-500">プロジェクトが存在しません。</p>
        )}
      </div>
  );
};

export default ProjectList;
