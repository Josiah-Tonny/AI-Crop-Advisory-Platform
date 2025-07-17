import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  loading: boolean;
  isTrialExpired: () => boolean;
  hasFeatureAccess: (feature: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  updateUser: (user: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();
        
        if (currentUser && token) {
          // Verify token is still valid by fetching fresh profile
          const profileResult = await authService.getProfile();
          if (profileResult.success && profileResult.user) {
            setUser(profileResult.user);
          } else {
            // Token invalid, clear local storage
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        setUser(response.user);
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        toast.success('Registration successful! Please check your email for verification.');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      const response = await authService.sendOTP(email);
      if (response.success) {
        toast.success('OTP sent to your email!');
        return true;
      } else {
        toast.error(response.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authService.verifyOTP({ email, otp });
      if (response.success && response.user) {
        setUser(response.user);
        toast.success('Email verified successfully!');
        return true;
      } else {
        toast.error(response.message || 'OTP verification failed');
        return false;
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('OTP verification failed. Please try again.');
      return false;
    }
  };

  const resendOTP = async (email: string): Promise<boolean> => {
    try {
      const response = await authService.resendOTP(email);
      if (response.success) {
        toast.success('OTP resent successfully!');
        return true;
      } else {
        toast.error(response.message || 'Failed to resend OTP');
        return false;
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      const profileResult = await authService.getProfile();
      if (profileResult.success && profileResult.user) {
        setUser(profileResult.user);
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
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
    isAuthenticated: authService.isAuthenticated(),
    isVerified: authService.isVerified(),
    loading,
    isTrialExpired,
    hasFeatureAccess,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    resendOTP,
    updateUser,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};