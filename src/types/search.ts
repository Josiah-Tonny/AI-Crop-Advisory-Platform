export interface SearchQuery {
  queryType: 'weather' | 'crop-recommendation' | 'soil-analysis' | 'pest-control' | 'irrigation';
  location: string;
  soilType?: string;
  season?: string;
  farmSize?: number;
  cropType?: string;
  additionalParams?: Record<string, unknown>;
}

export interface SearchResponse {
  weather?: {
    current: WeatherData;
    forecast: WeatherData[];
  };
  recommendations?: CropRecommendation[];
  soilAnalysis?: {
    ph: number;
    nutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    texture: string;
    recommendations: string[];
  };
  pestControl?: {
    identifiedPests: string[];
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
    preventiveMeasures: string[];
  };
  irrigation?: {
    recommendedSchedule: string[];
    waterRequirement: number;
    frequency: string;
    recommendations: string[];
  };
  error?: string;
}

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
}
