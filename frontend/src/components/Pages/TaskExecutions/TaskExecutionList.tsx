// frontend/src/components/Tasks/TaskExecutionList.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useExecutions from '../../../hooks/useTaskExecutions';
import LoadingSpinner from '../../Atoms/LoadingSpinner';
import ErrorMessage from '../../Atoms/ErrorMessage';
import useResponsiveIconSize from '../../../hooks/useResponsiveIconSize';
import { TaskExecutionResponse } from '../../../types';
import { ActionsType } from '../../../types/atoms';
import TableComponent from '../../Organisms/TableComponent';

const TaskExecutionList: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // カスタムフックを使用してタスク実行履歴の状態を管理
  const { executions, loading, error, deleteExecution } = useExecutions(projectId);
  const iconSize = useResponsiveIconSize();
  /**
   * タスク実行履歴削除ハンドラー
   *
   * @param executionId - 削除する実行履歴のID
   */
  const handleDelete = async (executionId: number) => {
    const confirmDelete = window.confirm('本当にこのタスク実行履歴を削除しますか？');
    if (!confirmDelete) return;

    await deleteExecution(executionId);
  };

  /**
   * タスク実行履歴編集ハンドラー
   *
   * @param executionId - 編集する実行履歴のID
   */
  const handleEdit = (executionId: number) => {
    navigate(`/projects/${projectId}/executions/${executionId}/edit`);
  };

  // テーブルのカラム定義
  const columns: { key: keyof TaskExecutionResponse; label: string; hiddenOnMobile?: boolean }[] = [
    { key: 'task_name', label: 'タスク名' },
    { key: 'user_name', label: '実施者' },
    { key: 'execution_date', label: '実施日' },
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
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">タスク実行履歴一覧</h2>
        </div>
          {error && <ErrorMessage message={error} />}
          {loading ? (
            <LoadingSpinner loading={loading} />
            ) : executions.length > 0 ? (
            <TableComponent
                items={executions}
                columns={columns}
                actions={actions}
            />
            ) : (
            <p className="text-center text-gray-500">タスクが存在しません。</p>
          )}
      </div>
  );
};

export default TaskExecutionList;
