// frontend/src/components/Header.tsx

import React, { useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.svg';

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    // プロジェクトIDを取得（プロジェクト関連のページの場合）
    const matchProject = useMatch("/projects/:project_id/*");
    const project_id = matchProject?.params.project_id;

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const isValidProjectId = (id?: string): boolean => {
        return id !== undefined && /^\d+$/.test(id);
    };

    const hideNavLinks = !isValidProjectId(project_id);

    return (
        <header className="bg-white shadow">
            {/* ヘッダーの上部部分（タイトルやアカウントアイコン） */}
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* 左上のロゴ */}
                    <NavLink to="/projects" className="flex">
                        <h1 className="text-4xl font-bold">Everyday Task</h1>
                        <img src={logo} alt="App Logo" className="h-12 w-auto" />
                    </NavLink>

                {/* アカウント管理アイコン */}
                <div className="flex items-center">
                    <NavLink to="/account" className="text-gray-600 hover:text-gray-800 mr-4">
                        <FaUserCircle size={36} />
                    </NavLink>
                    <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-800 md:hidden">
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* ナビゲーションバー（条件付きで表示） */}
            {!hideNavLinks && (
                <nav className="bg-gray-100 pt-4">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className={`flex space-x-4 ${menuOpen ? 'block' : 'hidden'} md:flex`}>
                            <NavLink
                                to="/projects"
                                end
                                className={({ isActive }) =>
                                    isActive
                                        ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                                        : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                プロジェクト一覧
                            </NavLink>
                            {isValidProjectId(project_id) && (
                                <>
                                    <NavLink
                                        to={`/projects/${project_id}/tasks/due`}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "py-2 px-3 text-blue-700 bg-gray-200 rounded-md"
                                                : "py-2 px-3 text-gray-700 hover:bg-gray-200 rounded-md"
                                        }
                                        onClick={() => setMenuOpen(false)}
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
                                        onClick={() => setMenuOpen(false)}
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
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        タスク履歴一覧
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
