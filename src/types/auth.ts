export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
  phone?: string;
  location?: string;
  farmSize?: string;
  cropTypes?: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
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

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}