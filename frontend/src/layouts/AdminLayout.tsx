import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'ADMIN') {
    // Show toast and redirect
    setTimeout(() => {
      toast.error('Access Denied: Admin permissions required.', { id: 'admin-denied' });
    }, 10);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
