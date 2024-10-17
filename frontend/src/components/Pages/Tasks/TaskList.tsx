// src/components/Pages/TaskList.tsx

import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTasks from '../../../hooks/useTasks';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import ErrorMessage from '../../Atoms/ErrorMessage';
import LoadingSpinner from '../../Atoms/LoadingSpinner';
import TableComponent from '../../Organisms/TableComponent';
import { TaskResponse } from '../../../types'; // IconName と Action をインポート
import { ActionsType } from '../../../types/atoms';
import IconButton from '../../Molecules/IconButton';
import useResponsiveIconSize from '../../../hooks/useResponsiveIconSize';

const TaskList: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { tasks, loading, error, setTasks, fetchTasks } = useTasks(projectId);
  const [deleteError, setDeleteError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconSize = useResponsiveIconSize();

  const handleDelete = async (taskId: number) => {
    const confirmDelete = window.confirm('本当にこのタスクを削除しますか？');
    if (!confirmDelete) return;

    try {
      await api.delete(`projects/${projectId}/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success('タスクが正常に削除されました。');
    } catch (err) {
      setDeleteError('タスクの削除に失敗しました。');
      toast.error('タスクの削除に失敗しました。');
    }
  };

  const handleEdit = (taskId: number) => {
      navigate(`/projects/${projectId}/tasks/${taskId}/edit`);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadCSV(file);
    }
  };

  const uploadCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/projects/${projectId}/tasks/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('CSVが正常にアップロードされました。');
      fetchTasks(); // タスク一覧を再取得して更新
    } catch (error) {
      toast.error('CSVのアップロードに失敗しました。');
    }
  };

  // テーブルのカラム定義
  const columns: { key: keyof TaskResponse; label: string; hiddenOnMobile?: boolean }[] = [
    { key: 'category', label: 'カテゴリ' },
    { key: 'task_name', label: 'タスク名' },
    { key: 'frequency', label: '頻度' },
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
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold">タスク一覧</h2>
            <IconButton
            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
            className="flex items-center bg-green-500 text-white rounded-full p-2 hover:bg-green-600 focus:outline-none focus:ring"
            iconName="Plus" // 使用するアイコン名に変更（例: 'Plus'）
            title="新規タスク"
            size={iconSize} // レスポンシブサイズを適用
            >
            <span className="hidden md:inline mx-2">新規タスク</span>
            </IconButton>
          {/* CSVアップロードボタン */}
          <IconButton
            onClick={() => fileInputRef.current?.click()} // ファイルダイアログを開く
            className="flex items-center bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring"
            iconName="Upload" // Upload アイコンを使用
            title="CSVアップロード"
            size={iconSize}
          >
            <span className="hidden md:inline mx-2">CSVアップロード</span>
          </IconButton>

          {/* 隠しファイル入力 */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          </div>

        {error && <ErrorMessage message={error} />}
        {deleteError && <ErrorMessage message={deleteError} />}

        {loading ? (
            <LoadingSpinner loading={loading} />
        ) : tasks.length > 0 ? (
            <TableComponent
            items={tasks}
            columns={columns}
            actions={actions}
            />
        ) : (
            <p className="text-center text-gray-500">タスクが存在しません。</p>
        )}
    </div>
  );
};

export default TaskList;
