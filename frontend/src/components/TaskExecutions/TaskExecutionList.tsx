// frontend/src/components/Tasks/TaskExecutionList.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useExecutions from '../../hooks/useTaskExecutions';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import EditButton from '../UI/EditButton';
import DeleteButton from '../UI/DeleteButton';

const TaskExecutionList: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const navigate = useNavigate();

  // カスタムフックを使用してタスク実行履歴の状態を管理
  const { executions, loading, error, deleteExecution } = useExecutions(project_id);

  /**
   * タスク実行履歴削除ハンドラー
   *
   * @param executionId - 削除する実行履歴のID
   */
  const handleDelete = async (executionId: number) => {
    const confirmDelete = window.confirm('本当にこのタスク実行履歴を削除しますか？');
    if (!confirmDelete) return;

    await deleteExecution(executionId);
  };

  /**
   * タスク実行履歴編集ハンドラー
   *
   * @param executionId - 編集する実行履歴のID
   */
  const handleEdit = (executionId: number) => {
    navigate(`/projects/${project_id}/executions/${executionId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">タスク実行履歴一覧</h2>
        {error && <ErrorMessage message={error} />}
        {loading ? (
          <LoadingSpinner loading={loading} />
        ) : executions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">タスク名</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">実施日</th>
                  <th className="px-4 py-2 border-b bg-gray-200 text-center">実施者</th>
                  <th className="py-2 border-b bg-gray-200 text-center" colSpan={2}></th> {/* 操作列を2列分確保 */}
                </tr>
              </thead>
              <tbody>
                {executions.map((execution) => (
                  <tr key={execution.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b text-center">{execution.task_name}</td>
                    <td className="px-4 py-2 border-b text-center">
                      {new Date(execution.execution_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b text-center">{execution.executor_name}</td>
                    <td className="py-2 border-b text-center">
                      {/* 編集ボタン */}
                      <EditButton
                        onClick={() => handleEdit(execution.id)}
                        ariaLabel={`Edit execution ${execution.id}`}
                      />
                    </td>
                    <td className="py-2 border-b text-center">
                      {/* 削除ボタン */}
                      <DeleteButton
                        onClick={() => handleDelete(execution.id)}
                        ariaLabel={`Delete execution ${execution.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">タスクの実行履歴はありません。</p>
        )}
      </div>
    </div>
  );
};

export default TaskExecutionList;
