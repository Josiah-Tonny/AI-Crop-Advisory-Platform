export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  farmSize?: string;
  cropTypes?: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
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

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  otpSent?: boolean;
}