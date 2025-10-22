import axios from 'axios';
import { WeatherData } from '../types';

// Get API key from environment variable - NO FALLBACK for security
const AIMLAPI_AI_API_KEY = import.meta.env.VITE_AIMLAPI_AI_API_KEY;

// Backend URL for any server-side APIs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Verify API key is configured
if (!AIMLAPI_AI_API_KEY) {
  console.error('VITE_AIMLAPI_AI_API_KEY is not configured. Please check your .env file.');
}

// Create axios instance for AI API service
const aimlClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': AIMLAPI_AI_API_KEY
  },
  timeout: 30000 // 30 seconds
});

// Common error handler for API requests
const handleApiError = (error: Error | unknown, customMessage: string): never => {
  console.error(`API Error (${customMessage}):`, error);
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${customMessage}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      throw new Error(`Network error: Unable to reach API. Please check your connection.`);
    }
  }
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${customMessage}: ${errorMessage}`);
};

export const aimlService = {
  /**
   * Get soil analysis recommendations based on location and parameters
   */
  getSoilAnalysis: async (location: { lat: number, lon: number }, params?: {
    cropType?: string,
    soilType?: string,
    previousCrops?: string[],
    weatherData?: {
      temperature?: number;
      humidity?: number;
      rainfall?: number;
    }
  }) => {
    try {
      // Use real API data
      const response = await aimlClient.post('/soil/analyze', {
        location,
        ...params
      });
      
      return response.data;
    } catch (error) {
      // Use the common error handler
      handleApiError(error, 'Failed to get soil analysis');
    }
  },

  /**
   * Analyze pest image for detection and identification
   */
  analyzePestImage: async (imageData: string) => {
    try {
      const response = await aimlClient.post('/pest/analyze-image', {
        image: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze pest image:', error);
      throw error; // Let calling component handle the error
    }
  },

  /**
   * Get pest detection and control recommendations
   */
  getPestControl: async (params: {
    cropType: string,
    location: { lat: number, lon: number },
    symptoms?: string[],
    imageUrl?: string
  }) => {
    try {
      // Use correct endpoint path 
      const response = await aimlClient.post('/pest/detect', params);
      return response.data;
    } catch (error) {
      console.error('Failed to get pest control recommendations:', error);
      throw error; // Let calling component handle the error
    }
  },

  /**
   * Get irrigation recommendations based on weather and crop type
   */
  getIrrigationRecommendations: async (params: {
    location: { lat: number, lon: number },
    cropType: string,
    soilType?: string,
    fieldSize?: number,
    currentMoisture?: number,
    weatherData?: Partial<WeatherData>
  }) => {
    try {
      const response = await aimlClient.post('/irrigation/recommend', params);
      
      // Process the data to ensure it has the expected structure
      const data = response.data;
      
      // Ensure we have a standardized format with all required fields
      return {
        recommendedWaterAmount: data.recommendedWaterAmount || 0,
        schedule: data.schedule || [],
        recommendations: data.recommendations || [],
        warnings: data.warnings || [],
        waterRequirements: data.waterRequirements || '',
        irrigationMethods: data.irrigationMethods || [
          // Default methods if not provided by API
          {
            name: 'Drip Irrigation',
            efficiency: 95,
            waterSaving: 40,
            cost: 'Medium',
            suitability: ['Vegetables', 'Fruits'],
            pros: ['90-95% water efficiency', 'Reduces weed growth', 'Precise water delivery'],
            cons: ['Higher initial cost', 'Requires maintenance', 'Can clog easily']
          },
          {
            name: 'Sprinkler System',
            efficiency: 75,
            waterSaving: 25,
            cost: 'Low',
            suitability: ['Cereals', 'Pasture'],
            pros: ['Lower installation cost', 'Good for large areas', 'Easy to operate'],
            cons: ['Water loss to evaporation', 'Wind affects distribution', 'Can promote diseases']
          }
        ],
        conservationTips: data.conservationTips || [
          // Default tips if not provided by API
          {
            title: 'Mulching',
            description: 'Apply organic mulch to reduce evaporation by up to 70%',
            savings: '30-50%'
          },
          {
            title: 'Soil Improvement',
            description: 'Add compost to improve water retention capacity',
            savings: '20-30%'
          },
          {
            title: 'Timing Optimization',
            description: 'Water early morning or evening to reduce evaporation',
            savings: '15-25%'
          },
          {
            title: 'Rainwater Harvesting',
            description: 'Collect and store rainwater for dry periods',
            savings: '40-60%'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to get irrigation recommendations:', error);
      // Let calling component handle the error
      throw error;
    }
  },

  /**
   * Get crop recommendations based on location and parameters
   */
  getCropRecommendations: async (params: {
    location: { lat: number, lon: number },
    soilType?: string,
    previousCrops?: string[],
    weatherData?: Partial<WeatherData>
  }) => {
    try {
      // Call the real API endpoint - NO FALLBACK DATA
      const response = await aimlClient.post('/crops/recommend', {
        location: params.location,
        soilType: params.soilType,
        previousCrops: params.previousCrops,
        weatherData: params.weatherData
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get crop recommendations:', error);
      // Re-throw error - let calling component handle it
      // NO FALLBACK DATA - endpoint must be implemented
      throw error;
    }
  },

  /**
   * Get educational content related to agriculture
   */
  getEducationalContent: async (params: {
    topic?: string,
    cropType?: string,
    skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  }) => {
    try {
      // Call real API endpoint - NO FALLBACK DATA
      const response = await aimlClient.get('/education/content', {
        params: params
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get educational content:', error);
      // Re-throw error - let calling component handle it
      // NO FALLBACK DATA - endpoint must be implemented
      throw error;
    }
  },

};