import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const user = authService.getCurrentUserFromStorage();

  if (!authService.isAuthenticated()) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is empty, allow all authenticated users
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to home page if user's role is not allowed
    return <Navigate to="/" replace />;
  }

  return children;
} 