const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  REQUEST_CONFIG: {
    TIMEOUT: 30000,
  },
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/v1/auth/register',
      LOGIN: '/v1/auth/login',
      PROFILE: '/v1/auth/profile',
      LOGOUT: '/v1/auth/logout',
    }
  }
};