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
    current: any;
    forecast?: any;
    location?: string;
  };
  recommendations?: CropRecommendation[];
  soilAnalysis?: {
    location: string;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
    moisture: number;
    temperature: number;
    healthScore: number;
    recommendations: string[];
    lastUpdated: string;
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

export interface CropRecommendation {
  id?: string;
  name: string;
  category?: string;
  suitability: number;
  plantingDate: string;
  expectedYield: string;
  reasons?: string[];
  tips?: string[];
  requirements?: {
    rainfall: string;
    temperature: string;
    soilPH: string;
    fertilizer: string;
  };
}
