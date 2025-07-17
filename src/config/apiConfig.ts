// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Weather API
  WEATHER: {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
  },
  
  // Backend Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
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
  
  // Request Configuration
  REQUEST_CONFIG: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // Database Configuration
  DATABASE: {
    CONNECTION_STRING: import.meta.env.MONGODB_CONNECTION_STRING,
  },
};

// Helper function to build full endpoint URLs
export const buildEndpointUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

// Helper function to get weather API URL
export const getWeatherApiUrl = (endpoint: string) => {
  return `${API_CONFIG.WEATHER.BASE_URL}${endpoint}?appid=${API_CONFIG.WEATHER.API_KEY}`;
};

export default API_CONFIG;