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

const apiClient = axios.create({
  baseURL: '/api/ai',
  headers: {
    'Content-Type': 'application/json'
  }
});

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Detect plant diseases from an image
 */
export const detectPlantDisease = async (imageFile: File): Promise<DiseasePrediction> => {
  const cacheKey = `disease_${imageFile.name}_${imageFile.size}`;
  
  const cachedResult = diseaseCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const base64Image = await fileToBase64(imageFile);
  const response = await apiClient.post('/detect-plant-disease', {
    image: base64Image
  });

  const result = response.data as DiseasePrediction;
  diseaseCache.set(cacheKey, result);
  return result;
};

/**
 * Get AI-powered crop recommendations using real weather data
 */
export const getCropRecommendations = async ({
  location,
  soilType,
  previousCrops = [],
}: CropRecommendationRequest): Promise<CropRecommendation[]> => {
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
        variety: crop.variety,
        suitability: confidence,
        reasons,
        plantingTime: plantingDate,
        harvestTime: '', // Not provided in current data
        expectedYield,
        waterRequirement: '', // Not provided in current data
        requirements: {
          fertilizer: getFertilizerRecommendation(crop.crop)
        },
        tips: getCropTips(crop.crop, weatherData)
      });
    }
  });
  
  // Sort by confidence score
  return recommendations.sort((a, b) => (b.suitability || 0) - (a.suitability || 0)).slice(0, 5);
};

const getFertilizerRecommendation = (crop: string): string => {
  const recommendations = {
    'Maize': 'NPK 17-17-17 at planting, Urea top-dressing at 6 weeks',
    'Rice': 'NPK 15-15-15, split application every 3 weeks',
    'Beans': 'DAP at planting, minimal nitrogen (nitrogen-fixing crop)',
    'Cassava': 'NPK 15-15-15, organic matter incorporation',
    'Coffee': 'Balanced NPK with micronutrients, organic compost'
  };
  return recommendations[crop as keyof typeof recommendations] || 'Balanced NPK fertilizer';
};

// Remove unused parameter
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
  const response = await apiClient.post('/chat', {
    query
  });

  return response.data.content;
};

// Export the service
export default {
  detectPlantDisease,
  getCropRecommendations,
  getFarmingAdvice,
};
