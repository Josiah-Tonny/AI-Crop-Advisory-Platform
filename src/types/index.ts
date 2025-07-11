export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    vis_km: number;
    uv: number;
    dewpoint_c: number;
  };
}

export interface ForecastData {
  location: WeatherData['location'];
  current: WeatherData['current'];
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        totalprecip_mm: number;
        avghumidity: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      desc: string;
      effective: string;
      expires: string;
    }>;
  };
}

export interface CropRecommendation {
  name: string;
  suitability: number;
  plantingDate: string;
  expectedYield: string;
  requirements: {
    rainfall: string;
    temperature: string;
    soilPH: string;
    fertilizer: string;
  };
  tips: string[];
}

export interface SoilAnalysis {
  location: string;
  testDate: string;
  results: {
    pH: {
      value: number;
      status: string;
      recommendation: string;
    };
    nitrogen: {
      value: number;
      status: string;
      recommendation: string;
    };
    phosphorus: {
      value: number;
      status: string;
      recommendation: string;
    };
    potassium: {
      value: number;
      status: string;
      recommendation: string;
    };
  };
  overallHealth: string;
  recommendations: string[];
}

export interface PestControlAdvice {
  location: string;
  cropType: string;
  weatherConditions: {
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
  weatherBasedAdvice: string;
}

export interface IrrigationAdvice {
  location: string;
  cropType: string;
  soilType: string;
  currentConditions: {
    temperature: number;
    humidity: number;
    lastRain: string;
  };
  weeklyForecast: {
    expectedRainfall: number;
    irrigationNeeded: number;
    recommendation: string;
  };
  irrigationSchedule: Array<{
    date: string;
    rainExpected: number;
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
}

export interface SearchQuery {
  location: string;
  cropType?: string;
  soilType?: string;
  season?: string;
  farmSize?: number;
  queryType: 'crop-recommendation' | 'soil-analysis' | 'pest-control' | 'irrigation' | 'weather';
  additionalParams?: Record<string, any>;
}