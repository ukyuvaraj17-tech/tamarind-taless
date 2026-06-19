import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Wait for Supabase to resolve session
  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Wait for Supabase to resolve session
  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (currentUser.email !== process.env.REACT_APP_ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
}