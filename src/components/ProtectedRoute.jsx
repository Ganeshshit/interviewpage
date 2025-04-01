import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on role if user doesn't have permission
    if (user?.role === 'interviewer') {
      return <Navigate to="/interviewer/dashboard" replace />;
    }
    if (user?.role === 'candidate') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 