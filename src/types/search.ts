export interface SearchQuery {
  queryType: 'weather' | 'crop-recommendation' | 'soil-analysis' | 'pest-control' | 'irrigation';
  location: string;
  soilType?: string;
  season?: string;
  farmSize?: number;
  fieldSize?: number;
  cropType?: string;
  previousCrops?: string[];
  symptoms?: string[];
  additionalParams?: Record<string, unknown>;
}

export interface WeatherData {
  main?: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather?: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind?: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds?: {
    all: number;
  };
  dt?: number;
  name?: string;
  temperature?: number;
  humidity?: number;
}

export interface ForecastData {
  list?: Array<WeatherData>;
  city?: {
    name: string;
    country: string;
  };
}

export interface SearchResponse {
  weather?: {
    current: WeatherData;
    forecast?: ForecastData;
    location?: string;
  };
  recommendations?: CropRecommendation[];
  weatherSummary?: {
    temperature: number;
    humidity: number;
    soilType: string;
    growingSeason: string;
  };
  soilAnalysis?: {
    location: string;
    overallHealth: string;
    results?: {
      ph: {
        value: string;
        status: string;
        recommendation: string;
      };
      nitrogen: {
        value: string;
        status: string;
        recommendation: string;
      };
      phosphorus: {
        value: string;
        status: string;
        recommendation: string;
      };
      potassium: {
        value: string;
        status: string;
        recommendation: string;
      };
    };
    recommendations: string[];
    lastUpdated: string;
  };
  pestControl?: {
    cropType: string;
    location: string;
    weatherConditions?: {
      temperature: number;
      humidity: number;
      riskLevel: string;
    };
    identifiedPests: Array<{
      name: string;
      symptoms: string[];
      treatment: string;
      prevention: string;
    }>;
    generalAdvice: string[];
    weatherBasedAdvice?: string;
  };
  irrigation?: {
    cropType: string;
    location: string;
    dailyForecast?: {
      expectedRainfall: number;
      irrigationNeeded: number;
      recommendation: string;
    };
    irrigationSchedule: Array<{
      date: string;
      rainExpected: string;
      irrigationNeeded: boolean;
      amount: string;
      timing: string;
    }>;
    methods: Array<{
      name: string;
      efficiency: string;
      suitability: string;
      cost: string;
    }>;
    tips: string[];
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
