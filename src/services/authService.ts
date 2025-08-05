import axios from 'axios';
import API_CONFIG from '../config/apiConfig';

interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  farmSize?: string;
  cropTypes?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  // Create axios instance with default config
  private api = axios.create({
    baseURL: this.baseURL,
    timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Sending registration data:', userData);
      const response = await this.api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.data.status === 'success') {
        // Store token if provided
        if (response.data.token) {
          this.setToken(response.data.token);
        }
        
        // Store user data
        if (response.data.data?.user) {
          this.setUser(response.data.data.user);
        }
        
        return {
          success: true,
          message: response.data.message,
          user: response.data.data?.user,
          token: response.data.token
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Registration failed. Please try again.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Check for specific error responses
      if (error.response?.status === 503) {
        return {
          success: false,
          message: 'Service temporarily unavailable. Please try again in a moment.'
        };
      }
      
      // Check if it's a network error and try development fallback
      if (error.code === 'ERR_NETWORK' && import.meta.env.DEV) {
        console.warn('Network error detected, backend server may not be running on the expected port');
        return {
          success: false,
          message: 'Unable to connect to server. Please ensure the backend is running on port 5000.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('Sending login data:', loginData);
      
      // Development fallback - remove this in production
      if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
        console.warn('Using mock login - start your backend server for full functionality');
        
        // Mock successful login
        const mockUser = {
          id: '1',
          name: 'Test User',
          email: loginData.email,
          role: 'user',
          firstName: 'Test',
          lastName: 'User',
          isVerified: true,
          subscriptionTier: 'free' as const,
          createdAt: new Date().toISOString()
        };
        
        this.setToken('mock_token_12345');
        this.setUser(mockUser);
        
        return {
          success: true,
          message: 'Mock login successful',
          user: mockUser,
          token: 'mock_token_12345'
        };
      }

      const response = await this.api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, loginData);
      
      if (response.data.status === 'success') {
        // Store token
        if (response.data.token) {
          this.setToken(response.data.token);
        }
        
        // Store user data
        if (response.data.data?.user) {
          this.setUser(response.data.data.user);
        }
        
        return {
          success: true,
          message: response.data.message,
          user: response.data.data?.user,
          token: response.data.token
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed. Please try again.'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if it's a network error
      if (error.code === 'ERR_NETWORK' && import.meta.env.DEV) {
        console.warn('Network error detected, backend server may not be running on the expected port');
        return {
          success: false,
          message: 'Unable to connect to server. Please ensure the backend is running on port 5000.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  }

  // Get user profile
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      
      if (response.data.status === 'success') {
        const user = response.data.data?.user || response.data.user;
        if (user) {
          this.setUser(user);
        }
        
        return {
          success: true,
          message: response.data.message || 'Profile fetched successfully',
          user: user
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to fetch profile'
      };
    } catch (error: any) {
      console.error('Get profile error:', error);
      
      // If profile endpoint doesn't exist, try to use stored user data
      const storedUser = this.getUser();
      if (storedUser) {
        return {
          success: true,
          message: 'Using cached profile data',
          user: storedUser
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await this.api.put('/v1/users/profile', userData);
      
      if (response.data.success) {
        // Update local storage
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }

  // Logout user
  async logout(): Promise<AuthResponse> {
    try {
      // Call logout endpoint
      await this.api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error during logout'
      };
    }
  }

  // Token and user management
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user is verified
  isVerified(): boolean {
    const user = this.getUser();
    return user?.isVerified || false;
  }

  // Check if trial expired
  isTrialExpired(): boolean {
    const user = this.getUser();
    if (!user || user.subscriptionTier !== 'free') return false;
    
    const trialDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    const trialStart = new Date(user.createdAt).getTime();
    return Date.now() - trialStart > trialDuration;
  }

  // Check if user has access to feature
  hasFeatureAccess(feature: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    if (user.subscriptionTier === 'enterprise') return true;
    if (user.subscriptionTier === 'premium') return true;
    if (user.subscriptionTier === 'free' && !this.isTrialExpired()) return true;
    
    // Free tier with expired trial has limited access
    const freeFeatures = ['weather', 'basic-crops', 'community'];
    return freeFeatures.includes(feature);
  }
}

export const authService = new AuthService();
export default authService;