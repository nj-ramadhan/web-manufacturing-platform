// frontend/src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected route for admin/staff users only
 * Usage: <AdminRoute><AdminDashboard /></AdminRoute>
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Memuat...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin/staff
  // Note: Adjust based on your user model - could be user.is_staff, user.role, etc.
  const isAdmin = user.is_staff || user.role === 'admin' || user.role === 'staff';
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated AND is admin - render children
  return children;
};

export default AdminRoute;