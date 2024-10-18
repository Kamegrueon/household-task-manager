// src/components/Pages/DueTaskList.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TaskResponse, TaskExecutionResponse } from '../../../types';
import api from '../../../services/api';
import TableComponent from '../../Organisms/TableComponent';
import useResponsiveIconSize from '../../../hooks/useResponsiveIconSize';
import ErrorMessage from '../../Atoms/ErrorMessage';
import LoadingSpinner from '../../Atoms/LoadingSpinner';
import { ActionsType } from '../../../types/atoms';
import { toast } from 'react-toastify';

const DueTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const { projectId } = useParams<{ projectId: string }>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const iconSize = useResponsiveIconSize();

  const getDueTasks = async (): Promise<TaskResponse[]> => {
    const response = await api.get<TaskResponse[]>(`/projects/${projectId}/tasks/due/`);
    return response.data;
  };

  const executeTask = async (taskId: number): Promise<TaskExecutionResponse> => {
    const response = await api.post<TaskExecutionResponse>(`/projects/${projectId}/executions/${taskId}/`);
    return response.data;
  };


  // 実施必要タスクを取得
  const fetchDueTasks = async () => {
    try {
      const data = await getDueTasks();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError('未実施のタスクの取得に失敗しました。');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // タスクを実行
  const handleExecute = async (taskId: number) => {
    try {
      await executeTask(taskId);
      toast.success('タスクが実行されました');
      // タスク一覧を再取得して更新
      fetchDueTasks();
    } catch (err) {
      setError('タスクの実行に失敗しました。');
      toast.error('タスクの実行に失敗しました。');
    }
  };

  // テーブルのカラム定義
  const columns: { key: keyof TaskResponse; label: string; hiddenOnMobile?: boolean }[] = [
    { key: 'category', label: 'カテゴリ', hiddenOnMobile: false },
    { key: 'task_name', label: 'タスク名', hiddenOnMobile: false },
  ];


  // テーブルのアクション定義
  const actions: ActionsType[]  = [
    {
      title: '実行',
      iconName: 'Execute', // リテラル型に合わせる
      onClick: handleExecute,
      className: 'text-green-500 hover:text-green-700 pr-4',
      size: iconSize, // モバイルサイズ
    },
  ];

  return (
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center py-2">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">未実施タスク一覧</h2>
        </div>
        {error && <ErrorMessage message={error} />}
        {loading ? (
          <LoadingSpinner loading={loading}/>
        ) : tasks.length > 0 ? (
          <TableComponent
            items={tasks}
            columns={columns}
            actions={actions}
            // onRowClick={(taskId) => {
            //   // 行クリック時の動作（必要に応じて実装）
            //   // 例: タスク詳細ページへの遷移
            // }}
          />
        ) : (
          <p className="text-center text-gray-500">未実施のタスクはありません。</p>
        )}
      </div>
  );
};

export default DueTaskList;
