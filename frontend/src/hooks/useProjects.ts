// frontend/src/hooks/useProjects.ts

import { useState, useEffect } from 'react';
import api from '../services/api';
import { ProjectResponse } from '../types';
import { toast } from 'react-toastify';

/**
 * カスタムフック: useProjects
 * プロジェクトの取得と状態管理を行います。
 *
 * @returns projects, loading, error, setProjects, fetchProjects
 */
const useProjects = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * プロジェクトの取得
   */
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get<ProjectResponse[]>('/projects/');
      setProjects(response.data);
    } catch (err) {
      setError('プロジェクトの取得に失敗しました。');
      toast.error('プロジェクトの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, setProjects, fetchProjects };
};

export default useProjects;
