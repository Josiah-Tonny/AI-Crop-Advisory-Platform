// Import browser-compatible utilities
import browserUrl from '../utils/browserUrl';

// API Configuration
export const API_CONFIG = {
  // Base URLs - Use proxy in development, Netlify Functions URL in production
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV 
      ? '/api'  // Use proxy in development
      : 'https://ai-advisory-agri.netlify.app/.netlify/functions/api'),  // Use Netlify Functions in production
  
  // Weather API
  WEATHER: {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
  },
  
  // Request Configuration
  REQUEST_CONFIG: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // Database Configuration
  DATABASE: {
    CONNECTION_STRING: import.meta.env.VITE_MONGODB_CONNECTION_STRING || '',
  },
  
  // Default error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
  },
  
  // Backend Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/v1/auth/login',
      REGISTER: '/v1/auth/register',
      LOGOUT: '/v1/auth/logout',
      PROFILE: '/v1/auth/profile',
    },
    
    // Weather
    WEATHER: {
      CURRENT: '/weather/current',
      FORECAST: '/weather/forecast',
      HISTORICAL: '/weather/historical',
    },
    
    // Crops
    CROPS: {
      LIST: '/crops',
      DETAILS: '/crops/:id',
      RECOMMENDATIONS: '/crops/recommendations',
      PLANTING_CALENDAR: '/crops/planting-calendar',
    },
    
    // Soil Analysis
    SOIL: {
      ANALYSIS: '/soil/analysis',
      RECOMMENDATIONS: '/soil/recommendations',
      HISTORY: '/soil/history',
      UPLOAD_SAMPLE: '/soil/upload-sample',
    },
    
    // Pest Control
    PEST: {
      IDENTIFICATION: '/pest/identification',
      TREATMENTS: '/pest/treatments',
      RISK_ASSESSMENT: '/pest/risk-assessment',
      REPORTS: '/pest/reports',
    },
    
    // Irrigation
    IRRIGATION: {
      SCHEDULE: '/irrigation/schedule',
      WATER_USAGE: '/irrigation/water-usage',
      EFFICIENCY: '/irrigation/efficiency',
      RECOMMENDATIONS: '/irrigation/recommendations',
    },
    
    // AI Advisory
    AI: {
      CHAT: '/ai/chat',
      RECOMMENDATIONS: '/ai/recommendations',
      ANALYSIS: '/ai/analysis',
      INSIGHTS: '/ai/insights',
    },
    
    // Education
    EDUCATION: {
      COURSES: '/education/courses',
      RESOURCES: '/education/resources',
      PROGRESS: '/education/progress',
      CERTIFICATES: '/education/certificates',
    },
    
    // Community
    COMMUNITY: {
      POSTS: '/community/posts',
      COMMENTS: '/community/comments',
      FORUMS: '/community/forums',
      EVENTS: '/community/events',
      EXPERTS: '/community/experts',
    },
    
    // Dashboard
    DASHBOARD: {
      STATS: '/dashboard/stats',
      ALERTS: '/dashboard/alerts',
      NOTIFICATIONS: '/dashboard/notifications',
    },
    
    // File Upload
    UPLOAD: {
      IMAGE: '/upload/image',
      DOCUMENT: '/upload/document',
      BULK: '/upload/bulk',
    },
  },
  
  // Helper function to build full endpoint URLs
  buildUrl: (endpoint: string, params?: Record<string, string>): string => {
    // Use the browser-compatible URL utility instead of string manipulation
    let url = browserUrl.joinUrl(API_CONFIG.BASE_URL, endpoint);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      });
    }
    
    return url;
  },
  
  // Helper function to get full API URL
  getFullUrl: (endpoint: string): string => {
    // Use the browser-compatible URL utility
    return browserUrl.joinUrl(API_CONFIG.BASE_URL, endpoint);
  },
  
  // Helper function to get weather API URL
  getWeatherApiUrl: (endpoint: string) => {
    // Use the browser-compatible URL utility
    const baseUrl = browserUrl.joinUrl(API_CONFIG.WEATHER.BASE_URL, endpoint);
    const url = new URL(baseUrl);
    url.searchParams.append('appid', API_CONFIG.WEATHER.API_KEY || '');
    return url.toString();
  },
};

export default API_CONFIG;