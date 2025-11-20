const API_BASE_URL = import.meta.env.PROD 
  ? '' // Use relative paths in production (Netlify Functions)
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  REQUEST_CONFIG: {
    TIMEOUT: 30000,
  },
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/v1/auth/register',
      LOGIN: '/api/v1/auth/login',
      PROFILE: '/api/v1/auth/profile',
      LOGOUT: '/api/v1/auth/logout',
    }
  }
};