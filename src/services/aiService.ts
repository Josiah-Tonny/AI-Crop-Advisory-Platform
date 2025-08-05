import axios from 'axios';
import { weatherService } from './weatherService';
import { 
  CropRecommendation, 
  DiseasePrediction, 
  CropRecommendationRequest,
  WeatherData
} from '../types';

const cropCache = new Map<string, CropRecommendation[]>();
const diseaseCache = new Map<string, DiseasePrediction>();

// AI Configuration from environment
const AI_CONFIG = {
  weather: {
    apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1'
  }
};

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
 * Get AI-powered crop recommendations using real weather data
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

    // Use the proper searchLocation method
    const locations = await weatherService.searchLocation(location);
    if (!locations || locations.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon } = locations[0];
    const weatherData = await weatherService.getCurrentWeather(lat, lon);
    
    if (!weatherData) {
      throw new Error('Weather data is incomplete or invalid');
    }

    // Generate recommendations based on real weather data
    const recommendations = generateRecommendationsFromWeather(weatherData, soilType, previousCrops);
    
    cropCache.set(cacheKey, recommendations);
    return recommendations;
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    throw new Error('Failed to get crop recommendations');
  }
};

/**
 * Generate crop recommendations based on real weather data
 */
const generateRecommendationsFromWeather = (
  weatherData: WeatherData, 
  soilType: string, 
  previousCrops: string[]
): CropRecommendation[] => {
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const rainfall = weatherData.forecast.reduce((total, day) => total + day.precipitation, 0) / weatherData.forecast.length;
  
  const recommendations: CropRecommendation[] = [];
  
  // Crop database with real conditions matching
  const crops = [
    {
      crop: 'Maize',
      variety: 'Hybrid DH04',
      minTemp: 18,
      maxTemp: 32,
      minRainfall: 500,
      maxRainfall: 1200,
      soilTypes: ['loam', 'clay loam', 'sandy loam'],
      season: 'rainy'
    },
    {
      crop: 'Rice',
      variety: 'Nerica 4',
      minTemp: 20,
      maxTemp: 35,
      minRainfall: 1000,
      maxRainfall: 2000,
      soilTypes: ['clay', 'clay loam'],
      season: 'rainy'
    },
    {
      crop: 'Beans',
      variety: 'Rosecoco',
      minTemp: 15,
      maxTemp: 28,
      minRainfall: 400,
      maxRainfall: 800,
      soilTypes: ['loam', 'sandy loam'],
      season: 'any'
    },
    {
      crop: 'Cassava',
      variety: 'TME 419',
      minTemp: 25,
      maxTemp: 35,
      minRainfall: 600,
      maxRainfall: 1500,
      soilTypes: ['sandy', 'sandy loam', 'loam'],
      season: 'dry'
    },
    {
      crop: 'Coffee',
      variety: 'SL28',
      minTemp: 15,
      maxTemp: 24,
      minRainfall: 1200,
      maxRainfall: 2000,
      soilTypes: ['loam', 'clay loam'],
      season: 'highland'
    }
  ];

  crops.forEach(crop => {
    let confidence = 0.5; // Base confidence
    const reasons: string[] = [];
    
    // Temperature suitability
    if (temp >= crop.minTemp && temp <= crop.maxTemp) {
      confidence += 0.25;
      reasons.push(`Optimal temperature range (${crop.minTemp}-${crop.maxTemp}°C)`);
    } else if (Math.abs(temp - ((crop.minTemp + crop.maxTemp) / 2)) <= 3) {
      confidence += 0.15;
      reasons.push('Acceptable temperature conditions');
    }
    
    // Rainfall suitability
    const annualRainfall = rainfall * 365; // Estimate annual rainfall
    if (annualRainfall >= crop.minRainfall && annualRainfall <= crop.maxRainfall) {
      confidence += 0.2;
      reasons.push(`Good rainfall conditions (${Math.round(annualRainfall)}mm annually)`);
    }
    
    // Soil type suitability
    if (crop.soilTypes.includes(soilType.toLowerCase())) {
      confidence += 0.15;
      reasons.push(`Suitable soil type (${soilType})`);
    }
    
    // Humidity considerations
    if (humidity > 80 && crop.crop === 'Rice') {
      confidence += 0.1;
      reasons.push('High humidity favorable for rice');
    } else if (humidity < 60 && crop.crop === 'Cassava') {
      confidence += 0.1;
      reasons.push('Lower humidity suitable for cassava');
    }
    
    // Crop rotation benefits
    if (!previousCrops.includes(crop.crop.toLowerCase())) {
      confidence += 0.1;
      reasons.push('Good for crop rotation');
    }
    
    // Market demand and weather patterns
    const currentMonth = new Date().getMonth();
    const isRainySeason = currentMonth >= 2 && currentMonth <= 5; // March to June
    
    if (isRainySeason && ['Maize', 'Rice', 'Beans'].includes(crop.crop)) {
      confidence += 0.1;
      reasons.push('Excellent timing for rainy season crop');
    }
    
    // Calculate expected yield based on conditions
    const baseYield = {
      'Maize': 5,
      'Rice': 4,
      'Beans': 1.5,
      'Cassava': 20,
      'Coffee': 2
    };
    
    const yieldMultiplier = Math.min(1.5, confidence * 2);
    const expectedYield = `${Math.round(baseYield[crop.crop as keyof typeof baseYield] * yieldMultiplier * 10) / 10} tons/hectare`;
    
    // Determine planting date based on current weather
    let plantingDate = 'March-April';
    if (isRainySeason) {
      plantingDate = 'Now (Rainy season optimal)';
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      plantingDate = 'October-November (Short rains)';
    }
    
    if (confidence >= 0.6) {
      recommendations.push({
        name: crop.crop,
        crop: crop.crop, // Add for backward compatibility
        variety: crop.variety,
        plantingDate,
        expectedYield,
        confidence: Math.min(confidence, 1),
        reasons,
        requirements: {
          temperature: `${crop.minTemp}-${crop.maxTemp}°C`,
          rainfall: `${crop.minRainfall}-${crop.maxRainfall}mm annually`,
          soilPH: crop.crop === 'Rice' ? '5.5-7.0' : '6.0-7.5',
          fertilizer: getFertilizerRecommendation(crop.crop, soilType)
        },
        tips: getCropTips(crop.crop, weatherData)
      });
    }
  });
  
  // Sort by confidence score
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
};

const getFertilizerRecommendation = (crop: string, soilType: string): string => {
  const recommendations = {
    'Maize': 'NPK 17-17-17 at planting, Urea top-dressing at 6 weeks',
    'Rice': 'NPK 15-15-15, split application every 3 weeks',
    'Beans': 'DAP at planting, minimal nitrogen (nitrogen-fixing crop)',
    'Cassava': 'NPK 15-15-15, organic matter incorporation',
    'Coffee': 'Balanced NPK with micronutrients, organic compost'
  };
  return recommendations[crop as keyof typeof recommendations] || 'Balanced NPK fertilizer';
};

const getCropTips = (crop: string, weather: WeatherData): string[] => {
  const tips = [];
  
  if (weather.temperature > 30) {
    tips.push('Provide shade during hot afternoons to prevent heat stress');
  }
  
  if (weather.humidity > 80) {
    tips.push('Ensure good air circulation to prevent fungal diseases');
  }
  
  const avgRainfall = weather.forecast.reduce((sum, day) => sum + day.precipitation, 0) / weather.forecast.length;
  if (avgRainfall < 2) {
    tips.push('Set up irrigation system - low rainfall expected');
  }
  
  // Crop-specific tips
  const cropSpecificTips = {
    'Maize': ['Plant in rows 75cm apart', 'Apply nitrogen when plants are knee-high'],
    'Rice': ['Maintain 5-10cm water level in paddies', 'Use certified seeds for better yields'],
    'Beans': ['Inoculate seeds with rhizobia for nitrogen fixation', 'Harvest when pods are dry'],
    'Cassava': ['Plant during onset of rains', 'Harvest 8-12 months after planting'],
    'Coffee': ['Prune after harvest for better yields', 'Apply mulch to conserve moisture']
  };
  
  tips.push(...(cropSpecificTips[crop as keyof typeof cropSpecificTips] || []));
  
  return tips;
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
