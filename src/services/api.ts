import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const AGRO_API_KEY = import.meta.env.VITE_AGROMONITORING_API_KEY;
const LOCATION_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const AGRO_BASE_URL = 'http://api.agromonitoring.com/agro/1.0';
const LOCATION_BASE_URL = 'https://us1.locationiq.com/v1';

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
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('Weather API key not found. Please check your environment configuration.');
      }

      console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else if (response.status === 404) {
          throw new Error('Location not found. Please check the coordinates.');
        } else {
          throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Validate essential data fields
      if (!data.main || !data.weather || !Array.isArray(data.weather) || data.weather.length === 0) {
        throw new Error('Invalid weather data received from API');
      }

      console.log('Weather data received:', {
        location: data.name,
        temp: data.main.temp,
        condition: data.weather[0].description
      });

      return data;
    } catch (error) {
      console.error('Weather API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather data. Please try again.');
    }
  },

  searchLocation: async (locationName: string) => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('Weather API key not found');
      }

      console.log(`Searching for location: ${locationName}`);
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=5&appid=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No locations found for "${locationName}". Please try a different search term.`);
      }

      // Return locations with proper formatting
      const locations = data.map(location => ({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        country: location.country,
        state: location.state
      }));

      console.log(`Found ${locations.length} locations for "${locationName}"`);
      return locations;
    } catch (error) {
      console.error('Geocoding API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search location. Please try again.');
    }
  },

  getForecast: async (lat: number, lon: number) => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('Weather API key not found');
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.list || !Array.isArray(data.list)) {
        throw new Error('Invalid forecast data received');
      }

      return data;
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw error;
    }
  },

  getAirQuality: async (lat: number, lon: number) => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('Weather API key not found');
      }

      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Air Quality API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Air Quality API Error:', error);
      throw error;
    }
  }
};

// Agro Monitoring Service
export const agroService = {
  getFieldInfo: async (fieldId: string) => {
    try {
      const response = await axios.get(
        `${AGRO_BASE_URL}/fields/${fieldId}?appid=${AGRO_API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Agro Field Info Error:', error);
      throw new Error('Failed to fetch field information');
    }
  },

  getSoilData: async (lat: number, lon: number) => {
    try {
      // First get the field ID by creating a polygon
      const polygon = await createFieldPolygon(lat, lon);
      const fieldId = polygon.id;
      
      // Get soil data for the field
      const response = await axios.get(
        `${AGRO_BASE_URL}/soil?polyid=${fieldId}&appid=${AGRO_API_KEY}`
      );
      
      // Clean up the temporary field
      await deleteField(fieldId);
      
      return response.data;
    } catch (error) {
      console.error('Soil Data Error:', error);
      throw new Error('Failed to fetch soil data');
    }
  }
};

// Helper function to create a temporary field for soil data
async function createFieldPolygon(lat: number, lon: number) {
  const polygon = {
    name: 'temp_soil_analysis',
    geo_json: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lon - 0.01, lat - 0.01],
          [lon + 0.01, lat - 0.01],
          [lon + 0.01, lat + 0.01],
          [lon - 0.01, lat + 0.01],
          [lon - 0.01, lat - 0.01]
        ]]
      }
    }
  };

  const response = await axios.post(
    `${AGRO_BASE_URL}/fields?appid=${AGRO_API_KEY}`,
    polygon
  );
  
  return response.data;
}

// Helper function to delete temporary field
async function deleteField(fieldId: string) {
  try {
    await axios.delete(
      `${AGRO_BASE_URL}/fields/${fieldId}?appid=${AGRO_API_KEY}`
    );
  } catch (error) {
    console.error('Error deleting temporary field:', error);
  }
}

// Location Service
export const locationService = {
  reverseGeocode: async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `${LOCATION_BASE_URL}/reverse.php?key=${LOCATION_API_KEY}&lat=${lat}&lon=${lon}&format=json`
      );
      return response.data;
    } catch (error) {
      console.error('Reverse Geocode Error:', error);
      throw new Error('Failed to get location information');
    }
  },

  forwardGeocode: async (query: string) => {
    try {
      const response = await axios.get(
        `${LOCATION_BASE_URL}/search.php?key=${LOCATION_API_KEY}&q=${encodeURIComponent(query)}&format=json`
      );
      return response.data;
    } catch (error) {
      console.error('Forward Geocode Error:', error);
      throw new Error('Failed to geocode location');
    }
  }
};

// Database Service for storing API responses
const databaseService = {
  saveApiResponse: async (endpoint: string, params: any, response: any) => {
    try {
      await apiClient.post('/api-responses', {
        endpoint,
        params,
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving API response to database:', error);
      // Continue execution even if saving to DB fails
    }
  },

  getCachedResponse: async (endpoint: string, params: any) => {
    try {
      const response = await apiClient.get('/api-responses/cache', {
        params: { endpoint, ...params }
      });
      return response.data;
    } catch (error) {
      return null; // No cached response available
    }
  }
};

// Higher-order function to add caching and database logging
export function withCachingAndLogging(apiFunction: Function) {
  return async function(...args: any[]) {
    const cacheKey = apiFunction.name;
    const cacheParams = args.length > 0 ? args[0] : {};
    
    try {
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
    } catch (error) {
      console.error(`Error in ${cacheKey}:`, error);
      throw error;
    }
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
    try {
      // Get weather data to influence soil analysis
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      
      // Simulate soil analysis based on location and weather
      const baseAnalysis = {
        ph: 6.5 + (Math.random() - 0.5) * 2,
        nitrogen: 50 + Math.random() * 100,
        phosphorus: 30 + Math.random() * 70,
        potassium: 200 + Math.random() * 300,
        organicMatter: 2 + Math.random() * 4,
        moisture: Math.max(10, Math.min(90, weather.main.humidity + (Math.random() - 0.5) * 20)),
        temperature: weather.main.temp + (Math.random() - 0.5) * 5,
        salinity: 0.1 + Math.random() * 0.5
      };

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
    } catch (error) {
      console.error('Soil Analysis Error:', error);
      throw error;
    }
  },

  // Add the missing getSoilHistory method
  getSoilHistory: async () => {
    try {
      // Since backend might not be ready, return mock data for now
      const mockData = [
        {
          id: 1,
          location: 'Field A - North Section',
          date: '2024-01-10',
          pH: 6.5,
          nitrogen: 45,
          phosphorus: 25,
          potassium: 180,
          organicMatter: 3.2,
          recommendations: [
            'Add lime to increase pH to optimal range (6.8-7.2)',
            'Apply nitrogen fertilizer before planting',
            'Maintain current phosphorus levels'
          ]
        },
        {
          id: 2,
          location: 'Field B - South Section',
          date: '2024-01-08',
          pH: 7.1,
          nitrogen: 38,
          phosphorus: 15,
          potassium: 220,
          organicMatter: 2.8,
          recommendations: [
            'pH levels are optimal',
            'Increase phosphorus with bone meal or rock phosphate',
            'Add compost to improve organic matter content'
          ]
        }
      ];

      return { data: mockData };
    } catch (error) {
      console.error('Error fetching soil history:', error);
      throw error;
    }
  },

  // Add other missing methods
  uploadSample: async (sampleData: any) => {
    try {
      // Mock implementation
      return { success: true, message: 'Sample uploaded successfully' };
    } catch (error) {
      console.error('Error uploading sample:', error);
      throw error;
    }
  },

  getRecommendations: async (soilData: any) => {
    try {
      // Mock implementation
      return {
        data: {
          recommendations: [
            'Apply organic compost to improve soil structure',
            'Test soil pH regularly',
            'Consider crop rotation'
          ]
        }
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
};

// Irrigation Service
export const irrigationService = {
  getIrrigationSchedule: async (location: { lat: number; lon: number }, cropType: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/irrigation/schedule`, {
        params: {
          lat: location.lat,
          lon: location.lon,
          cropType: cropType
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (!response.data) {
        throw new Error('No data received from irrigation service');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching irrigation schedule:', error);
      throw new Error('Server error');
    }
  },

  getSoilMoisture: async (location: { lat: number; lon: number }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/irrigation/soil-moisture`, {
        params: {
          lat: location.lat,
          lon: location.lon
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
      throw new Error('Server error');
    }
  },

  getEvapotranspiration: async (location: { lat: number; lon: number }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/irrigation/evapotranspiration`, {
        params: {
          lat: location.lat,
          lon: location.lon
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching evapotranspiration data:', error);
      throw new Error('Server error');
    }
  }
};

// Pest Control Service
export const pestService = {
  assessPestRisk: async (location: { lat: number; lon: number }, cropType: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pest/assess-risk`, {
        params: {
          lat: location.lat,
          lon: location.lon,
          cropType: cropType
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Pest Risk Assessment Error:', error);
      throw error;
    }
  },

  getCommonPests: async (cropType: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pest/common-pests`, {
        params: { cropType },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch common pests:', error);
      throw error;
    }
  },

  getPestDetails: async (pestId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pest/details/${pestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pest details:', error);
      throw error;
    }
  }
};

// Helper Functions
function generateSoilRecommendations(analysis: any, cropType: string) {
  const recommendations = [];
  
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
  
  return recommendations;
}

function calculateSoilHealth(analysis: any) {
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

function calculateTemperatureRisk(temp: number) {
  if (temp > 35 || temp < 10) return 80;
  if (temp > 30 || temp < 15) return 60;
  return 30;
}

function calculateHumidityRisk(humidity: number) {
  if (humidity > 80) return 70;
  if (humidity > 60) return 40;
  return 20;
}

function calculateRainfallRisk(rainfall: number) {
  if (rainfall > 10) return 60;
  if (rainfall > 5) return 40;
  return 20;
}

function getPestSymptoms(pest: string) {
  const symptoms: { [key: string]: string[] } = {
    'Fall Armyworm': ['Holes in leaves', 'Frass on plants', 'Damaged growing points'],
    'Stem Borer': ['Dead hearts', 'Holes in stems', 'Frass around holes'],
    'Aphids': ['Curled leaves', 'Sticky honeydew', 'Yellowing leaves'],
    'Whitefly': ['Yellow sticky leaves', 'Sooty mold', 'Stunted growth'],
    'Thrips': ['Silver streaks on leaves', 'Black spots', 'Distorted growth']
  };
  return symptoms[pest] || ['Monitor for unusual symptoms'];
}

function getPestTreatment(pest: string) {
  const treatments: { [key: string]: string[] } = {
    'Fall Armyworm': ['Bt spray', 'Neem oil', 'Spinosad insecticide'],
    'Stem Borer': ['Pheromone traps', 'Trichogramma release', 'Carbofuran granules'],
    'Aphids': ['Insecticidal soap', 'Neem oil', 'Imidacloprid'],
    'Whitefly': ['Yellow sticky traps', 'Neem oil', 'Thiamethoxam'],
    'Thrips': ['Blue sticky traps', 'Predatory mites', 'Spinosad']
  };
  return treatments[pest] || ['Consult agricultural extension officer'];
}

function generatePestRecommendations(riskLevel: number, pests: string[]) {
  const recommendations = [];
  
  if (riskLevel > 70) {
    recommendations.push('Implement immediate pest control measures');
    recommendations.push('Increase monitoring frequency to daily');
    recommendations.push('Consider prophylactic treatments');
  } else if (riskLevel > 40) {
    recommendations.push('Monitor crops twice weekly');
    recommendations.push('Prepare pest control materials');
    recommendations.push('Check weather forecasts regularly');
  } else {
    recommendations.push('Continue routine monitoring');
    recommendations.push('Maintain good field hygiene');
    recommendations.push('Monitor weather conditions');
  }
  
  return recommendations;
}

function calculateEvapotranspiration(temp: number, humidity: number, windSpeed: number) {
  // Simplified Penman-Monteith equation
  const delta = 4098 * (0.6108 * Math.exp(17.27 * temp / (temp + 237.3))) / Math.pow(temp + 237.3, 2);
  const gamma = 0.665;
  const u2 = windSpeed * 4.87 / Math.log(67.8 * 10 - 5.42);
  const es = 0.6108 * Math.exp(17.27 * temp / (temp + 237.3));
  const ea = es * humidity / 100;
  
  const et0 = (0.408 * delta * (temp) + gamma * 900 / (temp + 273) * u2 * (es - ea)) / 
              (delta + gamma * (1 + 0.34 * u2));
  
  return Math.max(0, et0);
}

function generateIrrigationRecommendations(schedule: any[], crop: any) {
  const recommendations = [];
  const totalWater = schedule.reduce((sum, day) => sum + day.waterAmount, 0);
  
  if (totalWater > 50) {
    recommendations.push('High water demand week - consider drip irrigation');
    recommendations.push('Monitor soil moisture levels closely');
  } else if (totalWater > 25) {
    recommendations.push('Moderate irrigation needed');
    recommendations.push('Sprinkler irrigation suitable');
  } else {
    recommendations.push('Low irrigation requirements');
    recommendations.push('Natural rainfall may be sufficient');
  }
  
  recommendations.push(`Optimal irrigation time: Early morning (6-8 AM)`);
  recommendations.push(`Avoid irrigation during peak heat (12-3 PM)`);
  
  return recommendations;
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