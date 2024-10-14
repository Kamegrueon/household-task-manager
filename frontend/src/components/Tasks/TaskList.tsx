import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import useTasks from '../../hooks/useTasks';
import { toast } from 'react-toastify';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const TaskList: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const navigate = useNavigate();

  // カスタムフックを使用してタスクの状態を管理
  const { tasks, loading, error, setTasks } = useTasks(project_id);
  const [deleteError, setDeleteError] = useState<string>('');

  /**
   * タスク削除ハンドラー
   *
   * @param taskId - 削除するタスクのID
   */
  const handleDelete = async (taskId: number) => {
    const confirmDelete = window.confirm('本当にこのタスクを削除しますか？');
    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${project_id}/tasks/${taskId}`);
      // タスクが削除されたら、tasksステートを更新
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success('タスクが正常に削除されました。');
    } catch (err) {
      setDeleteError('タスクの削除に失敗しました。');
      toast.error('タスクの削除に失敗しました。');
    }
  };

  /**
   * タスク編集ハンドラー
   *
   * @param taskId - 編集するタスクのID
   */
  const handleEdit = (taskId: number) => {
    navigate(`/projects/${project_id}/tasks/${taskId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        {/* タスク一覧ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">タスク一覧</h2>
          <button
            onClick={() => navigate(`/projects/${project_id}/tasks/new`)}
            className="bg-[#4CAF50] text-white rounded-full p-2 md:px-4 md:py-2 md:flex md:items-center md:space-x-2 text-sm md:text-base lg:text-lg"
          >
            {/* レスポンシブ対応: モバイルではアイコンのみ、デスクトップではテキスト付き */}
            <FaPlus className="text-white" />
            <span className="hidden md:inline">新規タスク作成</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {deleteError && <ErrorMessage message={deleteError} />}
        
        {loading ? (
          <LoadingSpinner loading={loading} />
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">カテゴリ</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">タスク名</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">頻度</th>
                  <th className="py-2 border-b bg-gray-200 text-center" colSpan={2}></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b text-center">{task.category}</td>
                    <td className="px-4 py-2 border-b text-center">{task.task_name}</td>
                    <td className="px-4 py-2 border-b text-center">{task.frequency}</td>
                    <td className="py-2 border-b text-center">
                      {/* 編集ボタン */}
                      <button
                        onClick={() => handleEdit(task.id)}
                        className="text-[#4CAF50] hover:text-green-700"
                        aria-label={`Edit task ${task.task_name}`}
                      >
                        <FaEdit />
                      </button>
                    </td>
                    <td className="py-2 border-b text-center">
                      {/* 削除ボタン */}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Delete task ${task.task_name}`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">タスクが存在しません。</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;
