// frontend/src/hooks/useExecutions.ts

import { useState, useEffect } from 'react';
import api from '../services/api';
import { TaskExecutionResponse } from '../types';
import { toast } from 'react-toastify';
import { toJstDateFormat } from '../utils/exchangeTimeZoneDate';

/**
 * カスタムフック: useExecutions
 * 指定されたプロジェクトIDのタスク実行履歴を取得し、削除を管理します。
 *
 * @param projectId - プロジェクトのID
 * @returns executions, loading, error, deleteExecution
 */
const useTaskExecutions = (projectId: string | undefined) => {
  const [executions, setExecutions] = useState<TaskExecutionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * タスク実行履歴の取得
   */
  const fetchExecutions = async () => {
    if (!projectId) {
      setError('プロジェクトIDが不足しています。');
      toast.error('プロジェクトIDが不足しています。');
      return;
    }
    setLoading(true);
    try {
        const response = await api.get<TaskExecutionResponse[]>(`/projects/${projectId}/executions/`);
        const formattedExecutions = response.data.map(execution => ({
            ...execution,
            execution_date: toJstDateFormat(execution.execution_date),
        }));
        setExecutions(formattedExecutions);
    } catch (err) {
      setError('タスク実行履歴の取得に失敗しました。');
      toast.error('タスク実行履歴の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  /**
   * タスク実行履歴の削除
   *
   * @param executionId - 削除するタスク実行履歴のID
   */
  const deleteExecution = async (executionId: number) => {
    if (!projectId) {
      setError('プロジェクトIDが不足しています。');
      toast.error('プロジェクトIDが不足しています。');
      return;
    }
    try {
      await api.delete(`/projects/${projectId}/executions/${executionId}`);
      setExecutions((prevExecutions) => prevExecutions.filter((exec) => exec.id !== executionId));
      toast.success('タスク実行履歴が正常に削除されました。');
    } catch (err) {
      setError('タスク実行履歴の削除に失敗しました。');
      toast.error('タスク実行履歴の削除に失敗しました。');
    }
  };

  useEffect(() => {
    fetchExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return { executions, loading, error, deleteExecution };
};

export default useTaskExecutions;
