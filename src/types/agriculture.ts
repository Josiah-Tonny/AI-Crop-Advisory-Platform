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

export interface DiseasePrediction {
  disease: string;
  confidence: number;
  treatment: string[];
  prevention: string[];
}

export interface CropRecommendationRequest {
  location: string;
  soilType: string;
  season?: string;
  farmSize?: number;
  previousCrops?: string[];
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details: Record<string, unknown>;
}
