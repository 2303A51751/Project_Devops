import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to their own dashboard
    const dashPaths = {
      admin: '/admin/dashboard',
      owner: '/owner/dashboard',
      tenant: '/tenant/dashboard',
      manager: '/manager/dashboard',
    };
    return <Navigate to={dashPaths[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
