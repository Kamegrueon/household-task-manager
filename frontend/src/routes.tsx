import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Templates/Layout'; // レイアウトコンポーネントをインポート
import Login from './components/Pages/Auth/Login';
import Register from './components/Pages/Auth/Register';
import ProjectList from './components/Pages/Projects/ProjectList';
import ProjectCreate from './components/Pages/Projects/ProjectCreate';
import TaskList from './components/Pages/Tasks/TaskList';
import TaskCreate from './components/Pages/Tasks/TaskCreate';
import TaskExecutionList from './components/Pages/TaskExecutions/TaskExecutionList';
import TaskExecutionEdit from './components/Pages/TaskExecutions/TaskExecutionEdit';
import DueTaskList from './components/Pages/DueTasks/DueTaskList';
import Account from './components/Pages/Accounts/Account'; // アカウント管理コンポーネントをインポート
import PrivateRoute from './utils/PrivateRoute'; // PrivateRoute コンポーネントをインポート
import TaskEdit from './components/Pages/Tasks/TaskEdit';
import ProjectEdit from './components/Pages/Projects/ProjectEdit';

const RoutesConfig: React.FC = () => {
    return (
        <Router>
            <Layout> {/* ヘッダーを常に表示 */}
                <Routes>
                    {/* 公開ルート（ヘッダーは表示） */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* 保護されたルート */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Outlet /> {/* レイアウトに組み込んであるため Outlet で子要素を出力 */}
                            </PrivateRoute>
                        }
                    >
                        {/* 子ルートとして保護されたページを定義 */}
                        <Route path="/" element={<Navigate to="/projects" replace />} />
                        <Route path="projects" element={<ProjectList />} />
                        <Route path="projects/new" element={<ProjectCreate />} />
                        <Route path="projects/:projectId/edit" element={<ProjectEdit />} />
                        <Route path="projects/:projectId/tasks" element={<TaskList />} />
                        <Route path="projects/:projectId/tasks/new" element={<TaskCreate />} />
                        <Route path="projects/:projectId/tasks/:taskId/edit" element={<TaskEdit />} />
                        <Route path="projects/:projectId/executions" element={<TaskExecutionList />} />
                        <Route path="projects/:projectId/executions/:executionId/edit" element={<TaskExecutionEdit />} />
                        <Route path="projects/:projectId/tasks/due" element={<DueTaskList />} />
                        <Route path="account" element={<Account />} /> {/* アカウント管理ルートを追加 */}
                    </Route>

                    {/* デフォルトルート（未定義のパスにリダイレクト） */}
                    <Route path="*" element={<Navigate to="/projects" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default RoutesConfig;
