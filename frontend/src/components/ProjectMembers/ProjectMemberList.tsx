// frontend/src/components/ProjectMembers/ProjectMemberModal.tsx

import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ProjectMemberResponse, ProjectMemberCreate } from '../../types';
import { getProjectMembers, createProjectMember, updateProjectMember, deleteProjectMember } from '../../services/projectMemberApi';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import UserSelect from './UserSelect';

Modal.setAppElement('#root'); // アクセシビリティのために必要

interface ProjectMemberModalProps {
  projectId: number;
  isOpen: boolean;
  onRequestClose: () => void;
}

const ProjectMemberList: React.FC<ProjectMemberModalProps> = ({ projectId, isOpen, onRequestClose }) => {
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [newMember, setNewMember] = useState<ProjectMemberCreate>({ user_id: 0, role: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [roleChanges, setRoleChanges] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data);
      setLoading(false);
    } catch (err: any) {
      setError('メンバーの取得に失敗しました。');
      toast.error('メンバーの取得に失敗しました。');
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (newMember.user_id <= 0) {
        throw new Error('有効なユーザーを選択してください。');
      }

      // 既にメンバーに存在するかをチェック
      const isAlreadyMember = members.some(member => member.user.id === newMember.user_id);
      if (isAlreadyMember) {
        toast.warn('すでにこのユーザーはメンバーに追加されています。');
        return; // 追加処理を中断
      }

      const createdMember = await createProjectMember(projectId, newMember);
      setMembers([...members, createdMember]);
      toast.success('メンバーが正常に追加されました。');
      setNewMember({ user_id: 0, role: '' });
    } catch (err: any) {
      if (err.response && err.response.data && Array.isArray(err.response.data.detail)) {
        const errorMessages = err.response.data.detail.map(
          (item: any) => `${item.loc.join(' -> ')}: ${item.msg}`
        ).join(', ');
        setError(errorMessages);
        toast.error('メンバーの追加に失敗しました。');
      } else {
        setError(err.message || 'メンバーの追加に失敗しました。');
        toast.error('メンバーの追加に失敗しました。');
      }
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      // 削除前に制約をチェック
      const memberToDelete = members.find(member => member.id === memberId);
      if (!memberToDelete) {
        toast.error('メンバーが見つかりませんでした。');
        return;
      }

      // プロジェクトにメンバーが1人だけの場合は削除を禁止
      if (members.length <= 1) {
        toast.error('プロジェクトには少なくとも1人のメンバーが必要です。');
        return;
      }

      // メンバーがAdminで、現在のAdminが1人だけの場合は削除を禁止
      if (memberToDelete.role.toLowerCase() === 'admin') {
        const adminCount = members.filter(member => member.role.toLowerCase() === 'admin').length;
        if (adminCount <= 1) {
          toast.error('プロジェクトには少なくとも1人のAdminが必要です。');
          return;
        }
      }

      await deleteProjectMember(projectId, memberId);
      setMembers(members.filter(member => member.id !== memberId));
      toast.success('メンバーが正常に削除されました。');
    } catch (err: any) {
      toast.error('メンバーの削除に失敗しました。');
    }
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // ロールが変更されている場合のみ state を更新
    if ((member.role || '').toLowerCase() !== (newRole || '').toLowerCase()) {
      setRoleChanges(prev => ({ ...prev, [memberId]: newRole }));
    } else {
      // 変更されていなければ state から削除
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => { // 引数に newRole を追加
    const originalMember = members.find(member => member.id === memberId);

    if (!originalMember) {
      toast.error('メンバーが見つかりませんでした。');
      // エラー時に roleChanges をクリアして元のロールに戻す
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
      return;
    }

    // ロールが変更されていなければ更新処理を行わない
    if ((originalMember.role || '').toLowerCase() === (newRole || '').toLowerCase()) {
      // 変更されていない場合も roleChanges をクリア
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
      return;
    }

    // 新しいロールがAdminに変更されない場合、現在のAdminが1人だけかをチェック
    if (originalMember.role.toLowerCase() === 'admin' && newRole.toLowerCase() !== 'admin') {
      const adminCount = members.filter(member => member.role.toLowerCase() === 'admin').length;
      if (adminCount <= 1) {
        toast.error('プロジェクトには少なくとも1人のAdminが必要です。');
        // エラー時に roleChanges をクリアして元のロールに戻す
        setRoleChanges(prev => {
          const updated = { ...prev };
          delete updated[memberId];
          return updated;
        });
        return;
      }
    }

    try {
      const updatedMember = await updateProjectMember(projectId, memberId, { role: newRole });
      setMembers(members.map(member => member.id === memberId ? updatedMember : member));
      toast.success('メンバーのロールが更新されました。');
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    } catch (err: any) {
      toast.error('メンバーのロール更新に失敗しました。');
      // エラー時に roleChanges をクリアして元のロールに戻す
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const roles = ['Member', 'Admin', 'Viewer']; // 必要に応じて追加

  // 既存メンバーのユーザーIDを収集
  const existingMemberIds = members.map(member => member.user.id);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="プロジェクトメンバーの管理"
      className="mx-auto mt-20 bg-white rounded shadow-lg p-6 outline-none relative w-full sm:max-w-md md:max-w-lg lg:max-w-2xl"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto"
    >
      <h3 className="font-semibold mb-2">プロジェクトメンバーの管理</h3>
      
      {/* メンバー一覧 */}
      <div className="mb-6 overflow-auto">
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">ユーザー名</th>
                <th className="py-2 px-4 border-b text-left">メールアドレス</th>
                <th className="py-2 px-4 border-b text-left">ロール</th>
                <th className="py-2 px-4 border-b"></th> {/* 操作カラムのヘッダーを非表示 */}
              </tr>
            </thead>
            <tbody>
              {members.map(member => {
                // Adminの数をカウント
                const adminCount = members.filter(m => m.role.toLowerCase() === 'admin').length;
                const isLastAdmin = member.role.toLowerCase() === 'admin' && adminCount <= 1;
                const isOnlyMember = members.length <= 1;

                return (
                  <tr key={member.id}>
                    <td className="py-2 px-4 border-b">{member.user.username}</td>
                    <td className="py-2 px-4 border-b">{member.user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <select
                        value={roleChanges[member.id] !== undefined ? roleChanges[member.id] : (member.role || '')}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          handleRoleChange(member.id, newRole);
                          if (newRole.toLowerCase() !== member.role.toLowerCase()) {
                            handleUpdateRole(member.id, newRole); // 自動更新
                          }
                        }}
                        className="px-2 py-1 border rounded w-full"
                      >
                        <option value="">ロールを選択</option>
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {/* 削除ボタンの無効化条件 */}
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className={`text-red-500 hover:text-red-700 ${isLastAdmin || isOnlyMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="削除"
                        disabled={isLastAdmin || isOnlyMember}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* メンバー追加フォーム */}
      <div>
        <h3 className="font-semibold mb-2">メンバーの追加</h3>
        {error && (
          <div className="p-2 mb-2 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleAddMember} className="flex flex-row items-end space-x-4">
          {/* ユーザー選択 */}
          <div className="flex-1">
            <UserSelect
              selectedUserId={newMember.user_id}
              onChange={(userId: number) => setNewMember({ ...newMember, user_id: userId })}
              excludeUserIds={existingMemberIds} // 既存メンバーを除外
            />
          </div>
          
          {/* ロール選択 */}
          <div className="flex-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">ロール</label>
            <select
              id="role"
              name="role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            >
              <option value="">ロールを選択（任意）</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          {/* 追加ボタン */}
          <div>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-[#4CAF50] text-white rounded focus:outline-none focus:ring"
            >
              <FaPlus className="mr-2" /> 追加
            </button>
          </div>
        </form>
      </div>

      {/* モーダルの閉じるボタン */}
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        title="閉じる"
      >
        <FaTimes size={20} />
      </button>
    </Modal>
  );
};

export default ProjectMemberList;
