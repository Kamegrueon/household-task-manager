// src/components/Tasks/TaskExecutionEdit.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectMembers } from '../../../services/projectMemberApi'; // APIサービスのインポート
import api from '../../../services/api';
import { TaskExecutionResponse, TaskExecutionUpdate, ProjectMemberResponse } from '../../../types';
import useTaskExecutionForm from '../../../hooks/useTaskExecutionForm';
import { toast } from 'react-toastify';
import ErrorMessage from '../../Atoms/ErrorMessage';
import LoadingSpinner from '../../Atoms/LoadingSpinner';

const TaskExecutionEdit: React.FC = () => {
  const { projectId, executionId } = useParams<{ projectId: string; executionId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [updateError, setUpdateError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]); // プロジェクトメンバーのリスト
  const [taskName, setTaskName] = useState<string>(''); // タスク名を保持する状態

  // カスタムフックを使用してフォームデータとハンドラーを取得
  const { formData, handleChange, setFormData } = useTaskExecutionForm({
    user_id: 0,
    execution_date: '',
  });

  useEffect(() => {
    const fetchExecutionAndMembers = async () => {
      if (!projectId || !executionId) {
        setError('プロジェクトIDまたは実行履歴IDが不足しています。');
        toast.error('プロジェクトIDまたは実行履歴IDが不足しています。');
        return;
      }

      setLoading(true);
      try {
        // タスク実行履歴の取得
        const executionResponse = await api.get<TaskExecutionResponse>(`/projects/${projectId}/executions/${executionId}`);
        const execution = executionResponse.data;
        setTaskName(execution.task_name || '');

        // UTCからJSTに変換し、datetime-local形式にフォーマット
        const utcDate = new Date(execution.execution_date);
        if (isNaN(utcDate.getTime())) {
          throw new Error('実施日が無効な値です。');
        }
        const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // UTC +9時間
        const formattedDate = jstDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'形式
        console.log(formattedDate)
        setFormData({
          user_id: execution.user_id,
          execution_date: formattedDate,
        });

        // プロジェクトメンバーの取得
        const membersResponse = await getProjectMembers(parseInt(projectId));
        setMembers(membersResponse);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'タスク実行履歴の取得に失敗しました。');
        toast.error(err.response?.data?.detail || 'タスク実行履歴の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutionAndMembers();
  }, [projectId, executionId, setFormData]);

  /**
   * フォーム送信ハンドラー
   *
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (projectId && executionId) {
        // JSTのdatetime-local文字列をUTCに変換
        const jstDate = new Date(formData.execution_date!);
        if (isNaN(jstDate.getTime())) {
          throw new Error('実施日が無効な値です。');
        }
        const utcDate = new Date(jstDate.getTime() - 9 * 60 * 60 * 1000); // JST -9時間
        const utcIsoString = utcDate.toISOString();

        const updateData: TaskExecutionUpdate = {
          user_id: formData.user_id!,
          execution_date: utcIsoString,
        };
        await api.put(`/projects/${projectId}/executions/${executionId}`, updateData);
        toast.success('タスク実行履歴が正常に更新されました。');
        navigate(`/projects/${projectId}/executions`);
      }
    } catch (err: any) {
      setUpdateError(err.message || 'タスク実行履歴の更新に失敗しました。');
      toast.error(err.message || 'タスク実行履歴の更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-gray-100 p-4 pt-20 sm:pt-24"> {/* ヘッダーの高さを考慮した上部パディング */}
        <div className="max-w-full sm:max-w-md mx-auto bg-white rounded shadow p-6">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (loading && !taskName) {
    // 初期データ取得中のローディング
    return (
      <div className="bg-gray-100 p-4 pt-20 sm:pt-24"> {/* ヘッダーの高さを考慮した上部パディング */}
        <div className="max-w-full sm:max-w-md mx-auto bg-white rounded shadow p-6">
          <LoadingSpinner loading={loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 pt-20 sm:pt-24 min-h-screen"> {/* ヘッダーの高さを考慮した上部パディング */}
      <div className="max-w-full sm:max-w-md mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">タスク実行履歴編集</h2>
        {updateError && <ErrorMessage message={updateError} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タスク名の表示（編集不可） */}
          <div>
            <label htmlFor="task_name" className="block mb-1 text-sm font-medium text-gray-700">タスク名</label>
            <input
              type="text"
              id="task_name"
              name="task_name"
              value={taskName}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded"
            />
          </div>

          {/* 実行者の選択 */}
          <div>
            <label htmlFor="user_id" className="block mb-1 text-sm font-medium text-gray-700">実施者名</label>
            <select
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
            >
              <option value="">選択してください</option>
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.username}
                </option>
              ))}
            </select>
          </div>

          {/* 実行日時の入力 */}
          <div>
            <label htmlFor="execution_date" className="block mb-1 text-sm font-medium text-gray-700">実施日</label>
            <input
              type="datetime-local"
              id="execution_date"
              name="execution_date"
              value={formData.execution_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-200"
            />
          </div>

          {/* フォームボタン */}
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200 disabled:opacity-50"
            >
              更新
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300"
            >
              戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskExecutionEdit;
