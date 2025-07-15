import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { LoginCredentials, RegisterData, OTPVerification, AuthResponse, OTPResponse, User } from '../types/auth';

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
      const response = await this.api.post('/auth/register', userData);
      return {
        success: true,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        message: response.data.message,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  }

  // Send OTP for verification
  async sendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await this.api.post('/auth/send-otp', { email });
      return {
        success: true,
        message: response.data.message,
        otpSent: response.data.otpSent
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(otpData: OTPVerification): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/verify-otp', otpData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        message: response.data.message,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed. Please try again.'
      };
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await this.api.post('/auth/resend-otp', { email });
      return {
        success: true,
        message: response.data.message,
        otpSent: response.data.otpSent
      };
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP. Please try again.'
      };
    }
  }

  // Get user profile
  async getProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await this.api.get('/auth/profile');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user profile'
      };
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await this.api.put('/users/profile', userData);
      
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

  // Get user statistics
  async getUserStats(): Promise<{ success: boolean; stats?: any; message?: string }> {
    try {
      const response = await this.api.get('/users/stats');
      return {
        success: true,
        stats: response.data.stats
      };
    } catch (error: any) {
      console.error('Get user stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user statistics'
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user is verified
  isVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.isVerified || false;
  }

  // Check if trial expired
  isTrialExpired(): boolean {
    const user = this.getCurrentUser();
    if (!user || user.subscriptionTier !== 'free') return false;
    
    const trialDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    const trialStart = new Date(user.createdAt).getTime();
    return Date.now() - trialStart > trialDuration;
  }

  // Check if user has access to feature
  hasFeatureAccess(feature: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.subscriptionTier === 'enterprise') return true;
    if (user.subscriptionTier === 'premium') return true;
    if (user.subscriptionTier === 'free' && !this.isTrialExpired()) return true;
    
    // Free tier with expired trial has limited access
    const freeFeatures = ['weather', 'basic-crops', 'community'];
    return freeFeatures.includes(feature);
  }

  // Forgot password
  async forgotPassword(email: string): Promise<OTPResponse> {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message,
        otpSent: response.data.otpSent
      };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  // Reset password
  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  }
}

export const authService = new AuthService();
export default authService;