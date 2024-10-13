// frontend/src/routes.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Templates/Layout'; // レイアウトコンポーネントをインポート
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProjectList from './components/Projects/ProjectList';
import ProjectCreate from './components/Projects/ProjectCreate';
import TaskList from './components/Tasks/TaskList';
import TaskNew from './components/Tasks/TaskCreate';
import TaskExecutionList from './components/TaskExecutions/TaskExecutionList';
import TaskExecutionEdit from './components/TaskExecutions/TaskExecutionEdit';
import DueTaskList from './components/DueTasks/DueTaskList';
import Account from './components/Accounts/Account'; // アカウント管理コンポーネントをインポート
import PrivateRoute from './utils/PrivateRoute'; // PrivateRoute コンポーネントをインポート
import TaskEdit from './components/Tasks/TaskEdit';
import ProjectEdit from './components/Projects/ProjectEdit';

const RoutesConfig: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* 公開ルート（ヘッダーなし） */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 保護されたルート（ヘッダーあり） */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Layout /> {/* レイアウトを適用 */}
                        </PrivateRoute>
                    }
                >
                    {/* 子ルートとして保護されたページを定義 */}
                    <Route path="/" element={<Navigate to="/projects" replace />} />
                    <Route path="projects" element={<ProjectList />} />
                    <Route path="projects/new" element={<ProjectCreate />} />
                    <Route path="projects/:project_id/edit" element={<ProjectEdit />} />
                    <Route path="projects/:project_id/tasks" element={<TaskList />} />
                    <Route path="projects/:project_id/tasks/new" element={<TaskNew />} />
                    <Route path="projects/:project_id/tasks/:task_id/edit" element={<TaskEdit />} />
                    <Route path="projects/:project_id/executions" element={<TaskExecutionList />} />
                    <Route path="projects/:project_id/executions/:execution_id/edit" element={<TaskExecutionEdit />} />
                    <Route path="projects/:project_id/tasks/due" element={<DueTaskList />} />
                    <Route path="account" element={<Account />} /> {/* アカウント管理ルートを追加 */}
                </Route>

                {/* デフォルトルート（未定義のパスにリダイレクト） */}
                <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
        </Router>
    );
};

export default RoutesConfig;
