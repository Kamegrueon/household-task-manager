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

// 追加: フィルタータイプの定義
type FilterType = 'today' | 'tomorrow' | 'week' | 'month';

const DueTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const { projectId } = useParams<{ projectId: string }>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const iconSize = useResponsiveIconSize();

  // 追加: フィルター状態の管理
  const [filter, setFilter] = useState<FilterType>('today');

  // 修正後: getDueTasks 関数に filterType を追加
  const getDueTasks = async (filterType: FilterType): Promise<TaskResponse[]> => {
    const response = await api.get<TaskResponse[]>(`/projects/${projectId}/tasks/due/`, {
      params: { filter_type: filterType },
    });
    return response.data;
  };

  const executeTask = async (taskId: number): Promise<TaskExecutionResponse> => {
    const response = await api.post<TaskExecutionResponse>(`/projects/${projectId}/executions/${taskId}/`);
    return response.data;
  };

  // 修正後: fetchDueTasks 関数を filter を使用するように修正
  const fetchDueTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDueTasks(filter);
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError('未実施のタスクの取得に失敗しました。');
      setLoading(false);
    }
  };

  // 修正後: useEffect を filter に依存するように修正
  useEffect(() => {
    fetchDueTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

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
      {/* 修正後: フィルター選択プルダウンの追加 */}
      <div className="flex justify-between items-center py-2">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">未実施タスク一覧</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="bg-green-500 text-white pl-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="today">本日</option>
            <option value="tomorrow">明日</option>
            <option value="week">1週間</option>
            <option value="month">1ヶ月</option>
          </select>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner loading={loading}/>
      ) : tasks.length > 0 ? (
        <TableComponent
          items={tasks}
          columns={columns}
          actions={actions}
        />
      ) : (
        <p className="text-center text-gray-500">未実施のタスクはありません。</p>
      )}
    </div>
  );
};

export default DueTaskList;
