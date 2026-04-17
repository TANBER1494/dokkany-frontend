import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Map for default redirects based on user roles
const ROLE_REDIRECT_MAP = {
  OWNER: '/owner/dashboard',
  CASHIER: '/cashier',
  SUPER_ADMIN: '/admin/payments',
  FLOOR_WORKER: '/login'
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRoute = ROLE_REDIRECT_MAP[user.role] || '/login';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;