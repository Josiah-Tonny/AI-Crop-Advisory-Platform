// Weather Types
export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  icon: string;
  airQuality: {
    aqi: number;
    level: string;
    pollutants: {
      pm25: number;
      pm10: number;
      o3: number;
      no2: number;
      so2: number;
      co: number;
    };
  };
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  precipitationChance: number;
}

// Search Query Type
export interface SearchQuery {
  queryType: 'weather' | 'crop-recommendation' | 'soil-analysis' | 'pest-control' | 'irrigation';
  location: string;
  soilType?: string;
  season?: string;
  farmSize?: number;
  cropType?: string;
  additionalParams?: {
    pH?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    symptoms?: string;
  };
  currentCrops?: string[];
}

// Crop Types
export interface CropRecommendation {
  id: string;
  name: string;
  category: string;
  suitability: number;
  plantingTime: string;
  harvestTime: string;
  expectedYield: string;
  profitability: string;
  waterRequirement: string;
  soilType: string;
  climateRequirement: string;
  tips: string[];
  image: string;
  marketPrice: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    currency: string;
  };
}

export interface CropCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  crops: string[];
}

// Soil Types
export interface SoilAnalysis {
  location: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
  temperature: number;
  salinity: number;
  healthScore: number;
  recommendations: SoilRecommendation[];
  lastUpdated: string;
}

export interface SoilRecommendation {
  type: 'fertilizer' | 'amendment' | 'irrigation' | 'cultivation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  cost: string;
}

// Pest Control Types
export interface PestRisk {
  pestName: string;
  riskLevel: 'low' | 'medium' | 'high';
  affectedCrops: string[];
  symptoms: string[];
  prevention: string[];
  treatment: {
    organic: string[];
    chemical: string[];
  };
  seasonality: string;
  weatherFactors: string[];
}

// Irrigation Types
export interface IrrigationSchedule {
  date: string;
  day: string;
  waterAmount: number;
  duration: number;
  method: string;
  priority: 'low' | 'medium' | 'high';
  weatherCondition: string;
  soilMoisture: number;
  evapotranspiration: number;
}

export interface IrrigationMethod {
  name: string;
  efficiency: number;
  waterSaving: number;
  cost: string;
  suitability: string[];
  pros: string[];
  cons: string[];
}

// Education Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  students: number;
  thumbnail: string;
  lessons: number;
  price: number;
  tags: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'calculator' | 'guide';
  description: string;
  category: string;
  downloadUrl: string;
  size: string;
  downloads: number;
  rating: number;
  thumbnail: string;
}

// Community Types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    location: string;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  createdAt: string;
  lastReply: string;
  isAnswered: boolean;
  isPinned: boolean;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  experience: string;
  rating: number;
  consultations: number;
  avatar: string;
  location: string;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  hourlyRate: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'field-day' | 'conference';
  date: string;
  time: string;
  duration: string;
  location: string;
  isOnline: boolean;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  image: string;
  tags: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region: string;
}

// Dashboard Types
export interface DashboardStats {
  totalFarms: number;
  activeCrops: number;
  weatherAlerts: number;
  pendingTasks: number;
  recentActivities: Activity[];
  weatherSummary: {
    temperature: number;
    condition: string;
    humidity: number;
    rainfall: number;
  };
  cropHealth: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

export interface Activity {
  id: string;
  type: 'weather' | 'crop' | 'soil' | 'pest' | 'irrigation';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  status: 'completed' | 'pending' | 'in-progress';
}