import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as AuthUser } from '../types/auth';
import { authService, RegisterData } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isTrialExpired: () => boolean;
  hasFeatureAccess: (feature: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Add a check for null context as well
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider - context is null');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Initialize user from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a user in localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // Parse stored user
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Try to fetch fresh user data in the background
          try {
            const result = await authService.getProfile();
            if (result.success && result.user) {
              // Convert ServiceUser to AuthUser by adding missing properties
              const authUser = {
                ...result.user,
                createdAt: new Date(result.user.createdAt),
                updatedAt: new Date(result.user.createdAt) // Use createdAt as fallback for updatedAt
              } as AuthUser;
              setUser(authUser);
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(authUser));
            }
          } catch (error) {
            // Background profile fetch failed, using cached data
            console.warn('Failed to refresh user profile, using cached data');
          }
        }
      } catch (error) {
        // Auth check error occurred, clear potentially invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        // Convert ServiceUser to AuthUser by adding missing properties
        const authUser = {
          ...response.user,
          createdAt: new Date(response.user.createdAt),
          updatedAt: new Date(response.user.createdAt) // Use createdAt as fallback for updatedAt
        } as AuthUser;
        setUser(authUser);
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(authUser));
        localStorage.setItem('token', response.token || '');
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.user) {
        // Convert ServiceUser to AuthUser by adding missing properties
        const authUser = {
          ...response.user,
          createdAt: new Date(response.user.createdAt),
          updatedAt: new Date(response.user.createdAt) // Use createdAt as fallback for updatedAt
        } as AuthUser;
        setUser(authUser);
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(authUser));
        localStorage.setItem('token', response.token || '');
        toast.success('Registration successful! Please check your email for verification.');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    // Update localStorage with the latest user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      const result = await authService.getProfile();
      if (result.success && result.user) {
        // Convert ServiceUser to AuthUser by adding missing properties
        const authUser = {
          ...result.user,
          createdAt: new Date(result.user.createdAt),
          updatedAt: new Date(result.user.createdAt) // Use createdAt as fallback for updatedAt
        } as AuthUser;
        setUser(authUser);
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(authUser));
      }
    } catch (error) {
      // Refresh profile error occurred
      console.error('Failed to refresh profile:', error);
    }
  };

  const isTrialExpired = (): boolean => {
    return authService.isTrialExpired();
  };

  const hasFeatureAccess = (feature: string): boolean => {
    return authService.hasFeatureAccess(feature);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading: loading || !authChecked, // Show loading until we've checked auth state
    isTrialExpired,
    hasFeatureAccess,
    login,
    register,
    logout,
    updateUser,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};