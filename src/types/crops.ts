export interface CropRecommendation {
  cropName: string;
  suitability: number;
  reasons: string[];
  plantingTime: string;
  harvestTime: string;
  expectedYield: string;
  waterRequirements: string;
  fertilizers: string[];
  bestPractices: string[];
}

export interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
}

export interface CropRecommendationRequest {
  location: string;
  soilType: string;
  season?: string;
  farmSize?: number;
  previousCrops?: string[];
}

export interface AIServiceError extends Error {
  code?: string;
  details?: any;
}

export interface CropImage {
  id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface ImageAnalysisResult {
  id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  tags: string[];
  analysis?: {
    colors?: {
      prominent: string[];
      foreground: string[];
      background: string[];
    };
    tags?: Array<{
      name: string;
      confidence: number;
    }>;
    crop_disease?: Array<{
      name: string;
      confidence: number;
      treatment?: string[];
      affectedArea?: number; 
      description?: string;
    }>;
    plantHealth?: {
      overallScore: number;
      leafColor: number;
      growth: number;
      pestDamage: number;
    };
  };
  metadata?: Record<string, any>;
  enhancedImageUrl?: string;
  healthScore?: number;
  growthStage?: string;
  diseases?: Array<{
    name: string;
    confidence: number;
    description?: string;
  }>;
  recommendations?: string[];
}

export interface ImageTimelineEntry {
  id: string;
  timestamp: string;
  imageUrl: string;
  thumbnailUrl?: string;
  location?: {
    lat?: number;
    lon?: number;
    name?: string;
  };
  tags?: string[];
  metadata?: Record<string, any>;
  measurements?: {
    height?: number;
    width?: number;
    healthScore?: number;
    growthRate?: number;
  };
}

export interface GrowthComparison {
  comparisonUrl: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeDate: string;
  afterDate: string;
  growthMetrics: {
    heightChange: number;
    widthChange: number;
    colorIntensity: number;
    estimatedGrowthRate: number;
    healthChangeScore: number;
  };
  analysis: string;
}
