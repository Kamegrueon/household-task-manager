// frontend/src/hooks/useTasks.ts

import { useState, useEffect } from 'react';
import api from '../services/api';
import { TaskResponse } from '../types';
import { toast } from 'react-toastify';

/**
 * カスタムフック: useTasks
 * 指定されたプロジェクトIDのタスクを取得し、状態を管理します。
 *
 * @param projectId - プロジェクトのID
 * @returns tasks, loading, error, fetchTasks
 */
const useTasks = (projectId: string | undefined) => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * タスクの取得
   */
  const fetchTasks = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await api.get<TaskResponse[]>(`/projects/${projectId}/tasks/`);
      setTasks(response.data);
    } catch (err) {
      setError('タスクの取得に失敗しました。');
      toast.error('タスクの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return { tasks, loading, error, setTasks, fetchTasks };
};

export default useTasks;
