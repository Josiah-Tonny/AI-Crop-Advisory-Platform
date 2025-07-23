import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { 
  CropRecommendation, 
  DiseasePrediction, 
  CropRecommendationRequest 
} from '../types/agriculture';

const cropCache = new Map<string, CropRecommendation[]>();
const diseaseCache = new Map<string, DiseasePrediction>();

/**
 * Detect plant diseases from an image
 */
export const detectPlantDisease = async (imageFile: File): Promise<DiseasePrediction> => {
  try {
    const cacheKey = `disease_${imageFile.name}_${imageFile.size}`;
    
    // Check cache first
    const cachedResult = diseaseCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${API_CONFIG.BASE_URL}/analyze-plant-disease`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data as DiseasePrediction;
    diseaseCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error detecting plant disease:', error);
    throw new Error('Failed to analyze plant disease');
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
}: CropRecommendationRequest): Promise<CropRecommendation[]> => {
  try {
    const cacheKey = `recommendations_${location}_${soilType}_${previousCrops.join('_')}`;
    const cachedResult = cropCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const weatherData = await getWeatherData(location);
    if (!weatherData?.main?.temp || !weatherData?.weather?.[0]?.main) {
      throw new Error('Weather data is incomplete or invalid');
    }

    const response = await axios.post(`${API_CONFIG.BASE_URL}/crop-recommendations`, {
      location,
      soilType,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity ?? 50,
      rainfall: weatherData.rain?.['1h'] ?? 0,
      weatherCondition: weatherData.weather[0].main,
      previousCrops,
    });

    const recommendations = response.data as CropRecommendation[];
    cropCache.set(cacheKey, recommendations);
    return recommendations;
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    throw new Error('Failed to get crop recommendations');
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
