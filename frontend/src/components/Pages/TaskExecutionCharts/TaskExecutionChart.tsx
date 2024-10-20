// src/components/Charts/TaskExecutionChart.tsx

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { TaskExecutionResponse } from '../../../types';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../Atoms/LoadingSpinner';
import ErrorMessage from '../../Atoms/ErrorMessage';

interface TaskExecutionChartProps {}

interface TaskCountPerUser {
  username: string;
  taskCount: number;
}

const COLORS = [
  '#1ABC9C', // Turquoise
  '#3498DB', // Blue
  '#F39C12', // Orange
  '#E74C3C', // Red
  '#9B59B6', // Purple
  '#E67E22', // Dark Orange
  '#F1C40F'  // Yellow
];



const TaskExecutionChart: React.FC<TaskExecutionChartProps> = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [taskData, setTaskData] = useState<TaskCountPerUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchTaskExecutions = async () => {
    if (!projectId) {
      setError('プロジェクトIDが不足しています。');
      toast.error('プロジェクトIDが不足しています。');
      return;
    }

    if (!startDate || !endDate) {
      setError('期間を選択してください。');
      toast.error('期間を選択してください。');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get<TaskExecutionResponse[]>(
        `/projects/${projectId}/executions`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      const executions = response.data;

      // ユーザーごとのタスク数を集計
      const taskCountMap: { [username: string]: number } = {};

      executions.forEach((execution) => {
        const username = execution.user_name;
        if (taskCountMap[username]) {
          taskCountMap[username]++;
        } else {
          taskCountMap[username] = 1;
        }
      });

      const aggregatedData: TaskCountPerUser[] = Object.keys(taskCountMap).map((username) => ({
        username,
        taskCount: taskCountMap[username],
      }));

      setTaskData(aggregatedData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'タスク実行データの取得に失敗しました。');
      toast.error(err.response?.data?.detail || 'タスク実行データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // コンポーネントマウント時にデフォルトの期間を設定（例: 過去7日間）
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 7);
    const formattedToday = today.toISOString().split('T')[0];
    const formattedPriorDate = priorDate.toISOString().split('T')[0];
    setStartDate(formattedPriorDate);
    setEndDate(formattedToday);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchTaskExecutions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, projectId]);


  return (
    <div className='max-w-6xl mx-auto bg-white rounded shadow p-4 h-screen flex flex-col'>
      {/* ヘッダーと期間選択の配置 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4">
        <h2 className="text-2xl font-bold">タスクの対応状況</h2>
        <div className="flex flex-row gap-2 sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              開始日
            </label>
            <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-28 sm:w-auto py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-green-200"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              終了日
            </label>
            <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-28 sm:w-auto py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-green-200"
            />
          </div>
        </div>
      </div>

      {/* グラフを上に押し上げるためのマージン調整 */}
      <div className="flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner loading={loading} />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : taskData.length > 0 ? (
          <ResponsiveContainer width="100%" height="50%">
            <PieChart>
              <Pie
                data={taskData}
                dataKey="taskCount"
                nameKey="username"
                cx="50%"
                cy="50%"
                outerRadius={80} // グラフのサイズを調整
                label
              >
                {taskData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-600">データがありません。</p>
        )}
      </div>
    </div>
  );
};

export default TaskExecutionChart;
