import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute: React.FC<{ children: React.ReactElement; }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to={ ROUTES.LOGIN } replace />;
  return children;
};

export default ProtectedRoute;
