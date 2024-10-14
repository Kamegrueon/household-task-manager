import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ProjectMemberResponse, ProjectMemberCreate } from '../../types';
import { getProjectMembers, createProjectMember, updateProjectMember, deleteProjectMember } from '../../services/projectMemberApi';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaTimes, FaUser, FaUserShield, FaEye } from 'react-icons/fa';
import UserSelect from './UserSelect';

Modal.setAppElement('#root');

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
    } catch (err) {
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

      const isAlreadyMember = members.some(member => member.user.id === newMember.user_id);
      if (isAlreadyMember) {
        toast.warn('すでにこのユーザーはメンバーに追加されています。');
        return;
      }

      const createdMember = await createProjectMember(projectId, newMember);
      setMembers([...members, createdMember]);
      toast.success('メンバーが正常に追加されました。');
      setNewMember({ user_id: 0, role: '' });
    } catch (err: any) {
      setError(err.message || 'メンバーの追加に失敗しました。');
      toast.error('メンバーの追加に失敗しました。');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      const memberToDelete = members.find(member => member.id === memberId);
      if (!memberToDelete) {
        toast.error('メンバーが見つかりませんでした。');
        return;
      }

      if (members.length <= 1) {
        toast.error('プロジェクトには少なくとも1人のメンバーが必要です。');
        return;
      }

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
    } catch (err) {
      toast.error('メンバーの削除に失敗しました。');
    }
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    if ((member.role || '').toLowerCase() !== (newRole || '').toLowerCase()) {
      setRoleChanges(prev => ({ ...prev, [memberId]: newRole }));
    } else {
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    const originalMember = members.find(member => member.id === memberId);

    if (!originalMember) {
      toast.error('メンバーが見つかりませんでした。');
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
      return;
    }

    if ((originalMember.role || '').toLowerCase() === (newRole || '').toLowerCase()) {
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
      return;
    }

    if (originalMember.role.toLowerCase() === 'admin' && newRole.toLowerCase() !== 'admin') {
      const adminCount = members.filter(member => member.role.toLowerCase() === 'admin').length;
      if (adminCount <= 1) {
        toast.error('プロジェクトには少なくとも1人のAdminが必要です。');
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
    } catch (err) {
      toast.error('メンバーのロール更新に失敗しました。');
      setRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const roles = [
    { value: 'Member', icon: <FaUser />, label: 'Member' },
    { value: 'Admin', icon: <FaUserShield />, label: 'Admin' },
    { value: 'Viewer', icon: <FaEye />, label: 'Viewer' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="プロジェクトメンバーの管理"
      className="mx-auto mt-20 bg-white rounded shadow-lg p-6 outline-none relative w-full max-w-2xl"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto"
    >
      <h3 className="text-lg md:text-xl font-bold mb-4">プロジェクトメンバーの管理</h3>
      
      <div className="mb-6 overflow-auto">
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-sm">ユーザー名</th>
                <th className="hidden md:table-cell py-2 px-4 border-b text-left text-sm">メールアドレス</th>
                <th className="py-2 px-4 border-b text-left text-sm">ロール</th>
                <th className="py-2 px-4 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td className="py-2 px-4 border-b text-sm">{member.user.username}</td>
                  <td className="hidden md:table-cell py-2 px-4 border-b text-sm">{member.user.email}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex items-center">
                      <select
                        value={roleChanges[member.id] !== undefined ? roleChanges[member.id] : (member.role || '')}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          handleRoleChange(member.id, newRole);
                          handleUpdateRole(member.id, newRole);
                        }}
                        className="hidden md:block px-2 py-1 border bg-white text-gray-900 rounded w-full"
                      >
                        <option value="">ロールを選択</option>
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                        {/* レスポンシブ時にもロール変更できるよう修正 */}
                        <div className="block md:hidden">
                        <select
                            value={roleChanges[member.id] !== undefined ? roleChanges[member.id] : (member.role || '')}
                            onChange={(e) => {
                            const newRole = e.target.value;
                            handleRoleChange(member.id, newRole);
                            handleUpdateRole(member.id, newRole);
                            }}
                            className="px-2 py-1 border bg-white text-gray-900 rounded w-full"
                        >
                            <option value="">ロールを選択</option>
                            {roles.map(role => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                            ))}
                        </select>
                        </div>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                      title="削除"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3 className="text-md md:text-lg font-semibold mb-2">メンバーの追加</h3>
        {error && (
          <div className="p-2 mb-2 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleAddMember} className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <UserSelect
              selectedUserId={newMember.user_id}
              onChange={(userId: number) => setNewMember({ ...newMember, user_id: userId })}
              excludeUserIds={members.map(member => member.user.id)}
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">ロール</label>
            <select
              id="role"
              name="role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border rounded focus:outline-none focus:ring"
            >
              <option value="">ロールを選択</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          
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
