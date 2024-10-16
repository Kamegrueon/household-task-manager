import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TaskResponse, TaskExecutionResponse } from '../../types';
import api from '../../services/api';

const DueTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const { project_id } = useParams<{ project_id: string }>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const getDueTasks = async (): Promise<TaskResponse[]> => {
    const response = await api.get<TaskResponse[]>(`/projects/${project_id}/tasks/due/`);
    return response.data;
  };

  const executeTask = async (taskId: number): Promise<TaskExecutionResponse> => {
    const response = await api.post<TaskExecutionResponse>(`/projects/${project_id}/executions/${taskId}/`);
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
  }, []);

  // タスクを実行
  const handleExecute = async (taskId: number) => {
    try {
      await executeTask(taskId);
      // タスク一覧を再取得して更新
      fetchDueTasks();
    } catch (err) {
      setError('タスクの実行に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center py-2">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">未実施タスク一覧</h2>
        </div>
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-center text-gray-500">読み込み中...</p>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">カテゴリ</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">タスク名</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">アクション</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b text-center">{task.category}</td>
                    <td className="px-4 py-2 border-b text-center">{task.task_name}</td>
                    <td className="px-4 py-2 border-b text-center">
                      <button
                        onClick={() => handleExecute(task.id)}
                        className="px-3 py-1 text-white bg-[#4CAF50] rounded hover:bg-green-600"
                      >
                        実行
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">未実施のタスクはありません。</p>
        )}
      </div>
    </div>
  );
};

export default DueTaskList;
