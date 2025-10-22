/**
 * Backend Type Definitions
 * Shared types for backend services, routes, and utilities
 */

// ============================================
// WEATHER TYPES
// ============================================

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudiness: number;
  weatherCondition: string;
  weatherDescription: string;
  visibility: number;
  sunrise: number;
  sunset: number;
  timestamp: number;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  avgTemp: number;
  avgHumidity: number;
  avgWindSpeed: number;
  avgPressure: number;
  precipitation: number;
  precipitationChance: number;
  condition: string;
}

export interface WeatherFetcherResponse {
  current: CurrentWeather;
  forecast: DailyForecast[];
}

// ============================================
// CROP TYPES
// ============================================

export interface CropStage {
  days: number;
  kc: number;
  rootDepth: number;
  description: string;
}

export interface CropData {
  name: string;
  stages: {
    initial: CropStage;
    development: CropStage;
    midSeason: CropStage;
    late: CropStage;
  };
  totalDays: number;
  criticalDepletion: number;
  waterRequirement: string;
  sensitivity: string;
}

export interface CropCoefficient {
  kc: number;
  stage: 'initial' | 'development' | 'midSeason' | 'late';
  stageName: string;
  daysInStage: number;
  rootDepth: number;
  criticalDepletion: number;
  waterRequirement: string;
  sensitivity: string;
}

// ============================================
// SOIL TYPES
// ============================================

export interface SoilCapacityData {
  soilType: string;
  capacityPerMeter: number;
  totalCapacity: number;
  rootDepth: number;
  infiltrationRate: string;
  drainageRate: string;
  description: string;
}

export interface SoilMoistureEstimate {
  moisturePercent: number;
  moistureMM: number;
  fieldCapacity: number;
  status: 'optimal' | 'adequate' | 'moderate' | 'low' | 'critical';
  soilType: string;
}

export interface IrrigationNeed {
  needed: boolean;
  amount: number;
  urgency: 'none' | 'low' | 'medium' | 'high';
  currentMoisture: number;
  projectedMoisture: number;
  threshold: number;
  deficit: number;
  daysUntilCritical: number;
}

// ============================================
// IRRIGATION TYPES
// ============================================

export interface IrrigationScheduleItem {
  date: string;
  day: string;
  waterAmount: number;
  duration: number;
  method: string;
  priority: 'none' | 'low' | 'medium' | 'high';
  weatherCondition: string;
  soilMoisture: number;
  evapotranspiration: number;
  rainfall?: number;
  effectiveRainfall?: number;
}

export interface IrrigationRecommendationParams {
  et0: number;
  cropData: CropCoefficient;
  forecast: DailyForecast[];
  soilType: string;
  soilCapacity: number;
  currentMoisture: number;
  latitude: number;
}

export interface WeatherConditions {
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  avgWind: number;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface IrrigationRequest {
  location: {
    lat: number;
    lon: number;
  };
  cropType: string;
  soilType?: string;
  fieldSize?: number;
  currentMoisture?: number;
  plantingDate?: string;
  weatherData?: any; // Ignored, but accepted for compatibility
}

export interface IrrigationResponse {
  success: boolean;
  recommendedWaterAmount: number;
  schedule: IrrigationScheduleItem[];
  recommendations: string[];
  warnings: string[];
  waterRequirements: string;
  calculations: {
    et0: number;
    cropCoefficient: number;
    cropWaterNeed: number;
    soilWaterCapacity: number;
    effectiveRainfall: number;
    method: string;
    growthStage: string;
    daysAfterPlanting: number;
  };
  weatherSummary: {
    current: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      condition: string;
    };
    forecast: Array<{
      date: string;
      high: number;
      low: number;
      precipitation: number;
      precipitationChance: number;
    }>;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
}

// ============================================
// ET0 CALCULATION TYPES
// ============================================

export interface ET0WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  tempMax?: number;
  tempMin?: number;
}

export interface ET0Params {
  weatherData: ET0WeatherData;
  latitude: number;
  date: Date;
  altitude?: number;
}

// ============================================
// PEST TYPES
// ============================================

export interface PestDetectionRequest {
  cropType: string;
  location: {
    lat: number;
    lon: number;
  };
  symptoms?: string[];
  imageUrl?: string;
}

export interface PestDetectionResponse {
  success: boolean;
  detectedPests: Array<{
    name: string;
    scientificName: string;
    confidence: number;
    treatment: string[];
  }>;
  recommendations: string[];
  riskForecast: string;
  location: {
    lat: number;
    lon: number;
  } | null;
  timestamp: string;
}

// ============================================
// SOIL ANALYSIS TYPES
// ============================================

export interface SoilAnalysisRequest {
  location: {
    lat: number;
    lon: number;
  };
  cropType?: string;
  soilType?: string;
  previousCrops?: string[];
  weatherData?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
  };
}

// ============================================
// CROP RECOMMENDATION TYPES
// ============================================

export interface CropRecommendationRequest {
  location: {
    lat: number;
    lon: number;
  };
  soilType?: string;
  previousCrops?: string[];
  weatherData?: any;
}

// ============================================
// UTILITY TYPES
// ============================================

export type ApiResponse<T> = T | ErrorResponse;

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// ENVIRONMENT VARIABLES (for documentation)
// ============================================

export interface BackendEnvVars {
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  FRONTEND_URL: string;
  APP_NAME: string;

  // Database
  MONGODB_URL: string;
  DB_NAME: string;

  // Authentication
  JWT_SECRET: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;

  // External APIs
  OPENWEATHER_API_KEY: string;
  AIMLAPI_AI_API_KEY: string;
  LOCATIONIQ_API_KEY?: string;
  AGROMONITORING_API_KEY?: string;

  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;

  // Admin
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

// ============================================
// TYPE GUARDS
// ============================================

export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false && 'error' in response;
}

export function isValidLatitude(lat: number): boolean {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon: number): boolean {
  return !isNaN(lon) && lon >= -180 && lon <= 180;
}

export function isValidCoordinates(lat: number, lon: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lon);
}
