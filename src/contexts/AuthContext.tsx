import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  location: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in localStorage or make an API call to verify session
        const token = localStorage.getItem('token');
        if (token) {
          // Here you would typically verify the token with your backend
          // For now, we'll just set a mock user
          setUser({
            id: '1',
            email: 'user@example.com',
            name: 'Demo User',
            location: 'Nairobi, Kenya' // Default location
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Here you would typically make an API call to your backend
      // For demo purposes, we'll just set a mock user
      const mockUser = {
        id: '1',
        email,
        name: 'Demo User',
        location: 'Nairobi, Kenya'
      };
      
      setUser(mockUser);
      localStorage.setItem('token', 'dummy-token');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
