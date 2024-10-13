import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth'; // 認証チェック関数のインポート

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};


export default PrivateRoute;
