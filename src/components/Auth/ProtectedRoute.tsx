import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole = []
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to intended page after login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store the current location for redirecting after login
      localStorage.setItem('redirectPath', location.pathname);
    }
  }, [loading, isAuthenticated, location]);

  // Check if user has required role
  const hasRequiredRole = () => {
    if (requiredRole.length === 0) return true;
    return user && requiredRole.includes(user.role);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;