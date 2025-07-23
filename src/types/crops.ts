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
