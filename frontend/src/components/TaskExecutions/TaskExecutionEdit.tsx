import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectMembers } from '../../services/projectMemberApi'; // 新しいAPIサービスのインポート
import api from '../../services/api';
import { TaskExecutionResponse, TaskExecutionUpdate, ProjectMemberResponse } from '../../types';
import useTaskExecutionForm from '../../hooks/useTaskExecutionForm';
import { toast } from 'react-toastify';
import ErrorMessage from '../Atoms/ErrorMessage';
import LoadingSpinner from '../Atoms/LoadingSpinner';

const TaskExecutionEdit: React.FC = () => {
  const { project_id, execution_id } = useParams<{ project_id: string; execution_id: string }>();
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
      if (!project_id || !execution_id) {
        setError('プロジェクトIDまたは実行履歴IDが不足しています。');
        toast.error('プロジェクトIDまたは実行履歴IDが不足しています。');
        return;
      }

      setLoading(true);
      try {
        // タスク実行履歴の取得
        const executionResponse = await api.get<TaskExecutionResponse>(`/projects/${project_id}/executions/${execution_id}`);
        const execution = executionResponse.data;
        setTaskName(execution.task_name);
        setFormData({
          user_id: execution.user_id,
          execution_date: new Date(execution.execution_date).toISOString().substring(0, 16), // フォーマット調整
        });

        // プロジェクトメンバーの取得
        const membersResponse = await getProjectMembers(parseInt(project_id));
        setMembers(membersResponse);
      } catch (err) {
        setError('タスク実行履歴の取得に失敗しました。');
        toast.error('タスク実行履歴の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutionAndMembers();
  }, [project_id, execution_id, setFormData]);

  /**
   * フォーム送信ハンドラー
   *
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project_id && execution_id) {
        const updateData: TaskExecutionUpdate = {
          user_id: formData.user_id!,
          execution_date: new Date(formData.execution_date!).toISOString(),
        };
        await api.put(`/projects/${project_id}/executions/${execution_id}`, updateData);
        toast.success('タスク実行履歴が正常に更新されました。');
        navigate(`/projects/${project_id}/executions`);
      }
    } catch (err) {
      setUpdateError('タスク実行履歴の更新に失敗しました。');
      toast.error('タスク実行履歴の更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (loading && !taskName) {
    // 初期データ取得中のローディング
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto bg-white rounded shadow p-6">
          <LoadingSpinner loading={loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
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
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded"
            />
          </div>

          {/* 実行者の選択 */}
          <div>
            <label htmlFor="user_id" className="block mb-1 text-sm font-medium text-gray-700">実施者名</label>
            <select
              id="executor_id"
              name="executor_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
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
              className="w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
            />
          </div>

          {/* フォームボタン */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-[#4CAF50] rounded-full hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200 disabled:opacity-50"
            >
              更新
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300"
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
