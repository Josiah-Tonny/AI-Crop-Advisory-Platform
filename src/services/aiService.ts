import axios from 'axios';
import API_CONFIG from '../config/apiConfig';

// Types
type DiseasePrediction = {
  disease: string;
  confidence: number;
  treatment: string;
  prevention: string[];
};

type CropRecommendation = {
  crop: string;
  variety: string;
  plantingDate: string;
  expectedYield: string;
  confidence: number;
  reasons: string[];
};

// AI Service Configuration
const AI_CONFIG = {
  plantVillage: {
    baseUrl: 'https://plantvillage.herokuapp.com/api/v1',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },
  weather: {
    apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
  googleCloud: {
    projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
    location: 'us-central1',
    modelId: 'text-bison@001',
  },
};

// Cache for API responses
const cache = new Map<string, any>();

/**
 * Detect plant diseases from an image
 */
export const detectPlantDisease = async (imageFile: File): Promise<DiseasePrediction> => {
  try {
    const cacheKey = `disease_${imageFile.name}_${imageFile.size}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await axios.post(
      `${AI_CONFIG.plantVillage.baseUrl}/predict`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Transform response to our format
    const result: DiseasePrediction = {
      disease: response.data.disease_name,
      confidence: parseFloat(response.data.confidence),
      treatment: response.data.treatment || 'No specific treatment available',
      prevention: response.data.prevention || [
        'Maintain proper plant spacing',
        'Ensure good air circulation',
        'Water at the base of plants',
        'Remove and destroy infected plants',
      ],
    };

    // Cache the result
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error detecting plant disease:', error);
    throw new Error('Failed to detect plant disease. Please try again.');
  }
};

/**
 * Get weather data for a location
 */
const getWeatherData = async (location: string) => {
  try {
    // First get coordinates for the location
    const geoResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${AI_CONFIG.weather.apiKey}`
    );
    
    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geoResponse.data[0];
    
    // Get current weather
    const weatherResponse = await axios.get(
      `${AI_CONFIG.weather.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${AI_CONFIG.weather.apiKey}&units=metric`
    );
    
    return weatherResponse.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};

/**
 * Get AI-powered crop recommendations
 */
export const getCropRecommendations = async ({
  location,
  soilType,
  previousCrops = [],
}: {
  location: string;
  soilType: string;
  previousCrops?: string[];
}): Promise<CropRecommendation[]> => {
  try {
    const cacheKey = `recommendations_${location}_${soilType}_${previousCrops.join('_')}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      // Get real-time weather data
      const weatherData = await getWeatherData(location);
      
      // Prepare request data with real weather data
      const requestData = {
        location,
        soilType,
        temperature: weatherData.main?.temp,
        humidity: weatherData.main?.humidity,
        rainfall: weatherData.rain?.['1h'] || 0,
        weatherCondition: weatherData.weather?.[0]?.main || 'Clear',
        previousCrops,
      };

      // Use the backend API endpoint from apiConfig
      const response = await axios.post(
        API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AI.RECOMMENDATIONS),
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT
        }
      );

      // Cache the successful response
      if (response.data && Array.isArray(response.data)) {
        cache.set(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error('Invalid response format from server');
      
    } catch (apiError: any) {
      console.error('API Error getting crop recommendations:', apiError);
      
      // If we have a 401 Unauthorized, clear the token and reload
      if (apiError.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        return [];
      }
      
      // For other errors, try to use OpenWeather data directly
      try {
        const weatherData = await getWeatherData(location);
        return generateRecommendationsFromWeather(weatherData, soilType);
      } catch (weatherError) {
        console.error('Error generating recommendations from weather data:', weatherError);
        throw new Error('Unable to generate recommendations. Please try again later.');
      }
    }
    
  } catch (error) {
    console.error('Error in getCropRecommendations:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Generate basic recommendations based on weather data
 */
const generateRecommendationsFromWeather = (weatherData: any, soilType: string): CropRecommendation[] => {
  const temp = weatherData.main?.temp || 25;
  const humidity = weatherData.main?.humidity || 60;
  const condition = weatherData.weather?.[0]?.main?.toLowerCase() || 'clear';
  
  // Basic recommendation logic based on temperature and soil type
  if (temp > 25) {
    return [{
      crop: 'Sorghum',
      variety: 'Gadam',
      plantingDate: 'March-April',
      expectedYield: '2-3 tons/acre',
      confidence: 0.8,
      reasons: [
        'Drought resistant',
        'Performs well in hot conditions',
        'Suitable for current weather'
      ]
    }];
  } else {
    return [{
      crop: 'Maize',
      variety: 'DH04',
      plantingDate: 'March-April',
      expectedYield: '5-7 tons/acre',
      confidence: 0.85,
      reasons: [
        'Well-suited for current temperature',
        'Good yield potential',
        'Widely adapted'
      ]
    }];
  }
};

/**
 * Get personalized farming advice
 */
export const getFarmingAdvice = async (query: string): Promise<string> => {
  try {
    const response = await axios.post(
      `${AI_CONFIG.openai.baseUrl}/chat/completions`,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural advisor providing concise, practical farming advice. Keep responses under 200 words.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting farming advice:', error);
    return 'I apologize, but I am unable to provide farming advice at the moment. Please try again later.';
  }
};

// Fallback recommendations when backend service is unavailable
const getFallbackRecommendations = (location: string, soilType: string): CropRecommendation[] => {
  console.warn('Using fallback recommendations - ensure the backend service is running and properly configured');
  
  // Basic fallback logic based on soil type
  const recommendations: Record<string, CropRecommendation[]> = {
    loam: [
      {
        crop: 'Maize',
        variety: 'DH04',
        plantingDate: 'March-April',
        expectedYield: '5-7 tons/acre',
        confidence: 0.85,
        reasons: [
          'Well-drained soil is ideal',
          'Good water retention',
          'Suitable for most crops'
        ]
      }
    ],
    clay: [
      {
        crop: 'Rice',
        variety: 'Nerica',
        plantingDate: 'April-May',
        expectedYield: '3-5 tons/acre',
        confidence: 0.8,
        reasons: [
          'Retains water well',
          'Good for paddy',
          'High nutrient content'
        ]
      }
    ],
    sandy: [
      {
        crop: 'Cassava',
        variety: 'TME 419',
        plantingDate: 'Year-round',
        expectedYield: '15-25 tons/acre',
        confidence: 0.9,
        reasons: [
          'Drought resistant',
          'Grows well in poor soils',
          'Low maintenance'
        ]
      }
    ]
  };

  return recommendations[soilType.toLowerCase()] || [
    {
      crop: 'Beans',
      variety: 'Rosecoco',
      plantingDate: 'March-April or September-October',
      expectedYield: '1-2 tons/acre',
      confidence: 0.75,
      reasons: [
        'Good for most soil types',
        'Improves soil fertility',
        'Short growing season'
      ]
    }
  ];
};

// Export the service
export default {
  detectPlantDisease,
  getCropRecommendations,
  getFarmingAdvice,
};
