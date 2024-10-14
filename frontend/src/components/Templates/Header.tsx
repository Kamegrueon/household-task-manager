import React, { useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import Logo from './Logo';  // ロゴコンポーネント
import MenuModal from './MenuModal';  // ハンバーガーメニューモーダル
import ProjectModal from './ProjectModal';  // プロジェクト設定モーダル
import { FaBars, FaCog, FaUserCircle } from 'react-icons/fa';

const Header: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
    const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

    const matchProject = useMatch("/projects/:project_id/*");
    const project_id = matchProject?.params.project_id;

    const toggleMenuModal = () => {
        setIsMenuModalOpen(!isMenuModalOpen);
    };

    const toggleProjectModal = () => {
        setIsProjectModalOpen(!isProjectModalOpen);
    };

    const isValidProjectId = (id?: string): boolean => {
        return id !== undefined && /^\d+$/.test(id);
    };

    return (
        <>
            <header className="bg-white shadow">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <NavLink to="/projects" className="flex items-center">
                        <Logo />  {/* ロゴとタイトル */}
                    </NavLink>

                    <div className="flex items-center">
                        {/* レスポンシブの場合はハンバーガーメニュー */}
                        <button
                            onClick={toggleMenuModal}
                            className="text-gray-600 hover:text-gray-800 md:hidden"
                            title="メニュー"
                        >
                            <FaBars size={24} />
                        </button>

                        {/* ログインしている場合のみ、レスポンシブ以外でユーザーアイコンを表示 */}
                        {isLoggedIn && (
                            <NavLink to="/account" className="hidden md:block text-gray-600 hover:text-gray-800 ml-4" title="アカウント設定">
                                <FaUserCircle size={32} />
                            </NavLink>
                        )}
                    </div>
                </div>

                {/* ナビゲーションバー（デスクトップのみ表示） */}
                {isValidProjectId(project_id) && (
                    <nav className="bg-gray-100 pt-4 hidden md:block">
                        <div className="max-w-6xl mx-auto px-4 flex space-x-4">
                            <NavLink
                                to="/projects"
                                end
                                className={({ isActive }) =>
                                    isActive
                                        ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                                        : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                                }
                            >
                                プロジェクト一覧
                            </NavLink>
                            <NavLink
                                to={`/projects/${project_id}/tasks/due`}
                                className={({ isActive }) =>
                                    isActive
                                        ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                                        : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                                }
                            >
                                未実施タスク一覧
                            </NavLink>
                            <NavLink
                                to={`/projects/${project_id}/tasks`}
                                end
                                className={({ isActive }) =>
                                    isActive
                                        ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                                        : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                                }
                            >
                                登録タスク一覧
                            </NavLink>
                            <NavLink
                                to={`/projects/${project_id}/executions`}
                                className={({ isActive }) =>
                                    isActive
                                        ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                                        : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                                }
                            >
                                タスク履歴一覧
                            </NavLink>
                            <button
                                onClick={toggleProjectModal}
                                className="text-gray-600 hover:text-gray-800 hidden md:block ml-4"
                                title="プロジェクト設定"
                            >
                                <FaCog size={24} />
                            </button>
                        </div>
                    </nav>
                )}
            </header>

            {/* レスポンシブ時にのみ表示されるメニューモーダル */}
            <MenuModal 
                isOpen={isMenuModalOpen} 
                toggleModal={toggleMenuModal} 
                isValidProjectId={isValidProjectId(project_id)} 
                project_id={project_id}
                toggleProjectModal={toggleProjectModal}  // プロジェクトモーダルを開く関数を渡す
            />

            {/* プロジェクト設定モーダル */}
            <ProjectModal 
                isOpen={isProjectModalOpen} 
                toggleModal={toggleProjectModal} 
                project_id={project_id} 
            />
        </>
    );
};

export default Header;
