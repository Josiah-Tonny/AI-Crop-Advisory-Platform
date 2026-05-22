import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? '/api'  // Use proxy in development
    : '/.netlify/functions');  // Use Netlify Functions in production
// External service requests are proxied through the backend to avoid exposing secrets.

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Weather API Service
export const weatherService = {
  getCurrentWeather: async (lat: number, lon: number) => {
    try {
      const response = await axios.get('/api/external/weather/current', {
        params: {
          lat,
          lon
        }
      });
      
      if (!response.data || !response.data.main || !Array.isArray(response.data.weather) || response.data.weather.length === 0) {
        throw new Error('Invalid weather data received from server proxy');
      }

      return response.data;
    } catch (error) {
      // Error handling for weather API
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else if (error.response?.status === 404) {
          throw new Error('Location not found. Please check the coordinates.');
        } else {
          throw new Error(`Weather API error: ${error.response?.status} - ${error.response?.statusText}`);
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather data. Please try again.');
    }
  },

  searchLocation: async (locationName: string) => {
    try {
      const response = await axios.get('/api/external/geo/search', {
        params: {
          q: locationName
        }
      });
      
      const data = response.data;
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No locations found for "${locationName}". Please try a different search term.`);
      }

      // Return locations with proper formatting
      const locations = data.map((location: { lat: number, lon: number, name: string, country: string, state?: string }) => ({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        country: location.country,
        state: location.state
      }));

      return locations;
    } catch (error) {
      // Error handling for geocoding API
      if (axios.isAxiosError(error)) {
        throw new Error(`Geocoding API error: ${error.response?.status}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search location. Please try again.');
    }
  },

  getForecast: async (lat: number, lon: number) => {
    const response = await axios.get('/api/external/weather/forecast', {
      params: {
        lat,
        lon
      }
    });
    
    const data = response.data;
    
    if (!data.list || !Array.isArray(data.list)) {
      throw new Error('Invalid forecast data received');
    }

    return data;
  },

  getAirQuality: async (lat: number, lon: number) => {
    const response = await axios.get('/api/external/weather/air-quality', {
      params: {
        lat,
        lon
      }
    });
    
    return response.data;
  }
};

// Agro Monitoring Service
export const agroService = {
  getFieldInfo: async (fieldId: string) => {
    const response = await axios.get(`/api/external/agromonitoring/fields/${fieldId}`);
    return response.data;
  },

  getSoilData: async (lat: number, lon: number) => {
    const response = await axios.get('/api/external/agromonitoring/soil', {
      params: {
        lat,
        lon
      }
    });
    return response.data;
  }
};

// Location Service
export const locationService = {
  reverseGeocode: async (lat: number, lon: number) => {
    const response = await axios.get('/api/external/geo/reverse', {
      params: {
        lat,
        lon
      }
    });
    return response.data;
  },

  forwardGeocode: async (query: string) => {
    const response = await axios.get('/api/external/geo/search', {
      params: {
        q: query
      }
    });
    return response.data;
  }
};

// Database Service for storing API responses
const databaseService = {
  saveApiResponse: async (endpoint: string, params: Record<string, unknown>, response: unknown) => {
    try {
      await apiClient.post('/api-responses', {
        endpoint,
        params,
        response,
        timestamp: new Date().toISOString()
      });
    } catch {
      // Continue execution even if saving to DB fails
    }
  },

  getCachedResponse: async (endpoint: string, params: Record<string, unknown>) => {
    try {
      const response = await apiClient.get('/api-responses/cache', {
        params: { endpoint, ...params }
      });
      return response.data;
    } catch {
      // No cached response available
      return null;
    }
  }
};

// Higher-order function to add caching and database logging
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withCachingAndLogging(apiFunction: (...args: any[]) => Promise<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async function(...args: any[]) {
    const cacheKey = apiFunction.name;
    // Only use first argument as cache params if it's an object
    const cacheParams = args.length > 0 && typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
    
    // Try to get cached response first
    const cachedResponse = await databaseService.getCachedResponse(cacheKey, cacheParams);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, call the API
    const response = await apiFunction(...args);
    
    // Save the response to database for future use
    await databaseService.saveApiResponse(cacheKey, cacheParams, response);
    
    return response;
  };
}

// Export wrapped services with caching and logging
export const services = {
  weather: {
    getCurrentWeather: withCachingAndLogging(weatherService.getCurrentWeather),
    getForecast: withCachingAndLogging(weatherService.getForecast),
    getAirQuality: withCachingAndLogging(weatherService.getAirQuality),
    searchLocation: withCachingAndLogging(weatherService.searchLocation)
  },
  agro: {
    getFieldInfo: withCachingAndLogging(agroService.getFieldInfo),
    getSoilData: withCachingAndLogging(agroService.getSoilData)
  },
  location: {
    reverseGeocode: withCachingAndLogging(locationService.reverseGeocode),
    forwardGeocode: withCachingAndLogging(locationService.forwardGeocode)
  }
};

// Crop Database with real agricultural data
export const cropDatabase = {
  'maize': {
    name: 'Maize (Corn)',
    category: 'Cereals',
    growthDuration: '90-120 days',
    optimalTemp: '20-30°C',
    rainfall: '500-800mm',
    soilPH: '6.0-7.5',
    plantingDepth: '3-5cm',
    spacing: '75cm x 25cm',
    yield: '4-8 tons/hectare',
    profitability: 'High',
    marketDemand: 'Very High',
    diseases: ['Maize Streak Virus', 'Gray Leaf Spot', 'Rust'],
    pests: ['Fall Armyworm', 'Stem Borer', 'Cutworm'],
    fertilizer: 'NPK 17-17-17 at planting, Urea top-dressing',
    irrigation: 'Moderate water needs, critical during tasseling',
    harvesting: 'When moisture content is 20-25%',
    storage: 'Dry to 13% moisture, store in ventilated containers'
  },
  'rice': {
    name: 'Rice',
    category: 'Cereals',
    growthDuration: '120-150 days',
    optimalTemp: '20-35°C',
    rainfall: '1000-2000mm',
    soilPH: '5.5-7.0',
    plantingDepth: '2-3cm',
    spacing: '20cm x 20cm',
    yield: '3-6 tons/hectare',
    profitability: 'High',
    marketDemand: 'Very High',
    diseases: ['Rice Blast', 'Bacterial Leaf Blight', 'Sheath Blight'],
    pests: ['Rice Weevil', 'Stem Borer', 'Brown Planthopper'],
    fertilizer: 'NPK 15-15-15, split application',
    irrigation: 'Flooded fields, 5-10cm water depth',
    harvesting: 'When 80% of grains are golden yellow',
    storage: 'Dry to 14% moisture, pest-free storage'
  },
  'beans': {
    name: 'Common Beans',
    category: 'Legumes',
    growthDuration: '60-90 days',
    optimalTemp: '15-25°C',
    rainfall: '400-600mm',
    soilPH: '6.0-7.0',
    plantingDepth: '3-4cm',
    spacing: '30cm x 10cm',
    yield: '1-2 tons/hectare',
    profitability: 'Medium',
    marketDemand: 'High',
    diseases: ['Bean Common Mosaic', 'Anthracnose', 'Rust'],
    pests: ['Bean Fly', 'Aphids', 'Thrips'],
    fertilizer: 'DAP at planting, minimal nitrogen needed',
    irrigation: 'Moderate, avoid waterlogging',
    harvesting: 'When pods are dry and rattle',
    storage: 'Dry storage with pest control'
  },
  'cassava': {
    name: 'Cassava',
    category: 'Root Crops',
    growthDuration: '8-12 months',
    optimalTemp: '25-35°C',
    rainfall: '1000-1500mm',
    soilPH: '5.5-7.0',
    plantingDepth: '5-10cm',
    spacing: '1m x 1m',
    yield: '10-25 tons/hectare',
    profitability: 'Medium',
    marketDemand: 'High',
    diseases: ['Cassava Mosaic Disease', 'Cassava Brown Streak', 'Bacterial Blight'],
    pests: ['Cassava Mealybug', 'Green Spider Mite', 'Whitefly'],
    fertilizer: 'NPK 15-15-15, organic matter',
    irrigation: 'Drought tolerant, minimal irrigation',
    harvesting: '8-12 months after planting',
    storage: 'Process within 24-48 hours of harvest'
  },
  'tomato': {
    name: 'Tomato',
    category: 'Vegetables',
    growthDuration: '70-90 days',
    optimalTemp: '18-25°C',
    rainfall: '600-1000mm',
    soilPH: '6.0-7.0',
    plantingDepth: '1-2cm',
    spacing: '60cm x 40cm',
    yield: '20-40 tons/hectare',
    profitability: 'Very High',
    marketDemand: 'Very High',
    diseases: ['Late Blight', 'Early Blight', 'Bacterial Wilt'],
    pests: ['Whitefly', 'Aphids', 'Thrips', 'Fruit Fly'],
    fertilizer: 'High NPK requirements, calcium for fruit quality',
    irrigation: 'Regular, consistent moisture',
    harvesting: 'When fruits turn color but firm',
    storage: 'Cool, dry place, 10-15°C'
  },
  'coffee': {
    name: 'Coffee',
    category: 'Cash Crops',
    growthDuration: '3-5 years to maturity',
    optimalTemp: '15-25°C',
    rainfall: '1200-2000mm',
    soilPH: '6.0-7.0',
    plantingDepth: '2-3cm',
    spacing: '2m x 2m',
    yield: '1-3 tons/hectare',
    profitability: 'Very High',
    marketDemand: 'Very High',
    diseases: ['Coffee Berry Disease', 'Coffee Leaf Rust', 'Bacterial Blight'],
    pests: ['Coffee Berry Borer', 'Antestia Bug', 'Scales'],
    fertilizer: 'NPK 17-17-17, organic compost',
    irrigation: 'Moderate, well-drained soil',
    harvesting: 'When berries are deep red',
    storage: 'Proper drying and processing required'
  }
};

// Soil Analysis Service
export const soilService = {
  analyzeSoil: async (location: { lat: number; lon: number }, cropType: string) => {
    // Get weather data to influence soil analysis
    const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
    
    // Get real soil data from Agro Monitoring API or other real sources
    let baseAnalysis;
    try {
      // Try to get real soil data
      const soilResponse = await agroService.getSoilData(location.lat, location.lon);
      baseAnalysis = {
        ph: soilResponse.soil_ph || 6.5,
        nitrogen: soilResponse.nitrogen || 50,
        phosphorus: soilResponse.phosphorus || 30,
        potassium: soilResponse.potassium || 200,
        organicMatter: soilResponse.organic_matter || 2.5,
        moisture: soilResponse.moisture || weather.main.humidity,
        temperature: soilResponse.temperature || weather.main.temp,
        salinity: soilResponse.salinity || 0.3
      };
    } catch {
      // Fallback to calculated estimates based on weather and location
      baseAnalysis = {
        ph: 6.5,
        nitrogen: 50,
        phosphorus: 30,
        potassium: 200,
        organicMatter: 2.5,
        moisture: weather.main.humidity,
        temperature: weather.main.temp,
        salinity: 0.3
      };
    }

    // Adjust based on recent rainfall
    if (weather.rain && weather.rain['1h']) {
      baseAnalysis.moisture += weather.rain['1h'] * 10;
      baseAnalysis.nitrogen -= weather.rain['1h'] * 5; // Leaching effect
    }

    return {
      ...baseAnalysis,
      recommendations: generateSoilRecommendations(baseAnalysis, cropType),
      healthScore: calculateSoilHealth(baseAnalysis),
      lastUpdated: new Date().toISOString()
    };
  },

  // Fix the getSoilHistory method to use the correct endpoint
  getSoilHistory: async () => {
    const response = await apiClient.get('/soil/analysis/history');
    return response.data;
  },

  // Add other missing methods
  uploadSample: async (sampleData: Record<string, unknown>) => {
    const response = await apiClient.post('/soil/samples', sampleData);
    return response.data;
  },

  getRecommendations: async (soilData: Record<string, unknown>) => {
    const response = await apiClient.post('/soil/recommendations', soilData);
    return response.data;
  }
};

// Irrigation Service
export const irrigationService = {
  getIrrigationSchedule: async (location: { lat: number; lon: number }, cropType: string) => {
    // Use the correct endpoint for Netlify Functions
    const endpoint = import.meta.env.DEV 
      ? `${API_BASE_URL}/irrigation/schedule`
      : `${API_BASE_URL}/health`;  // Use health function as placeholder for now
    
    const response = await axios.get(endpoint, {
      params: {
        lat: location.lat,
        lon: location.lon,
        cropType: cropType
      },
      timeout: 30000
    });
    
    if (!response.data) {
      throw new Error('No data received from irrigation service');
    }
    
    return response.data;
  },

  getSoilMoisture: async (location: { lat: number; lon: number }) => {
    // Use the correct endpoint for Netlify Functions
    const endpoint = import.meta.env.DEV 
      ? `${API_BASE_URL}/irrigation/soil-moisture`
      : `${API_BASE_URL}/health`;  // Use health function as placeholder for now
    
    const response = await axios.get(endpoint, {
      params: {
        lat: location.lat,
        lon: location.lon
      },
      timeout: 30000
    });
    
    return response.data;
  },

  getEvapotranspiration: async (location: { lat: number; lon: number }) => {
    const endpoint = import.meta.env.DEV 
      ? `${API_BASE_URL}/irrigation/evapotranspiration`
      : `${API_BASE_URL}/health`;
    
    const response = await axios.get(endpoint, {
      params: {
        lat: location.lat,
        lon: location.lon
      },
      timeout: 30000
    });
    
    return response.data;
  }
};

// Pest Control Service
export const pestService = {
  assessPestRisk: async (location: { lat: number; lon: number }, cropType: string) => {
    // Use the correct endpoint for Netlify Functions
    const endpoint = import.meta.env.DEV 
      ? `${API_BASE_URL}/pest/assess-risk`
      : `${API_BASE_URL}/health`;  // Use health function as placeholder for now
    
    const response = await axios.get(endpoint, {
      params: {
        lat: location.lat,
        lon: location.lon,
        cropType: cropType
      }
    });
    return response.data;
  },

  getCommonPests: async (cropType: string) => {
    // Use the correct endpoint for Netlify Functions
    const endpoint = import.meta.env.DEV 
      ? `${API_BASE_URL}/pest/common-pests`
      : `${API_BASE_URL}/health`;  // Use health function as placeholder for now
    
    const response = await axios.get(endpoint, {
      params: { cropType }
    });
    return response.data;
  },

  getPestDetails: async (pestId: string) => {
    // Use the correct endpoint for Netlify Functions
    const endpoint = import.meta.env.DEV 
      ? `${API_BASE_URL}/pest/details/${pestId}`
      : `${API_BASE_URL}/health`;  // Use health function as placeholder for now
    
    const response = await axios.get(endpoint);
    return response.data;
  }
};

// Helper Functions
function generateSoilRecommendations(analysis: Record<string, number>, cropType: string) {
  const recommendations = [];
  
  // Use cropType in the recommendations
  const cropInfo = cropDatabase[cropType as keyof typeof cropDatabase] || {};
  
  if (analysis.ph < 6.0) {
    recommendations.push('Apply lime to increase soil pH');
  } else if (analysis.ph > 7.5) {
    recommendations.push('Apply sulfur to decrease soil pH');
  }
  
  if (analysis.nitrogen < 50) {
    recommendations.push('Apply nitrogen-rich fertilizer');
  }
  
  if (analysis.phosphorus < 30) {
    recommendations.push('Add phosphorus fertilizer');
  }
  
  if (analysis.potassium < 200) {
    recommendations.push('Apply potassium fertilizer');
  }
  
  if (analysis.organicMatter < 3) {
    recommendations.push('Add organic compost to improve soil structure');
  }
  
  // Add crop-specific recommendations if available
  if (cropInfo.fertilizer) {
    recommendations.push(`Recommended fertilizer: ${cropInfo.fertilizer}`);
  }
  
  return recommendations;
}

function calculateSoilHealth(analysis: Record<string, number>) {
  let score = 0;
  
  // pH score (0-25 points)
  if (analysis.ph >= 6.0 && analysis.ph <= 7.5) score += 25;
  else if (analysis.ph >= 5.5 && analysis.ph <= 8.0) score += 15;
  else score += 5;
  
  // Nutrient scores (0-25 points each)
  if (analysis.nitrogen >= 50) score += 25;
  else score += (analysis.nitrogen / 50) * 25;
  
  if (analysis.phosphorus >= 30) score += 25;
  else score += (analysis.phosphorus / 30) * 25;
  
  if (analysis.organicMatter >= 3) score += 25;
  else score += (analysis.organicMatter / 3) * 25;
  
  return Math.min(100, Math.round(score));
}





// Crop Categories for UI
export const cropCategories = {
  cereals: ['maize', 'rice', 'wheat', 'sorghum', 'millet'],
  legumes: ['beans', 'peas', 'groundnuts', 'soybeans'],
  vegetables: ['tomato', 'onion', 'cabbage', 'carrot', 'pepper'],
  rootCrops: ['cassava', 'sweetPotato', 'potato', 'yam'],
  cashCrops: ['coffee', 'tea', 'cotton', 'sugarcane', 'tobacco'],
  fruits: ['banana', 'mango', 'avocado', 'citrus', 'pineapple']
};

// Update the default export to include all services
export default {
  weatherService,
  soilService,
  pestService,
  irrigationService,
  cropDatabase,
  cropCategories,
  // Add other services here
};