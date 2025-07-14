import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { LoginCredentials, RegisterData, OTPVerification, AuthResponse, OTPResponse, User } from '../types/auth';

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, credentials);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Send OTP for verification
  async sendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/send-otp`, { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  }

  // Verify OTP
  async verifyOTP(otpData: OTPVerification): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/verify-otp`, otpData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      };
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/resend-otp`, { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP'
      };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
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

  // Forgot password
  async forgotPassword(email: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  // Reset password
  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  }
}

export const authService = new AuthService();