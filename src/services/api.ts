const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather API Service
export const weatherService = {
  getCurrentWeather: async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('Weather data fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  },

  getForecast: async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('Forecast data fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw error;
    }
  },

  getAirQuality: async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
      );
      if (!response.ok) throw new Error('Air quality data fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Air Quality API Error:', error);
      throw error;
    }
  },

  searchLocation: async (query: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${WEATHER_API_KEY}`
      );
      if (!response.ok) throw new Error('Location search failed');
      return await response.json();
    } catch (error) {
      console.error('Location Search Error:', error);
      throw error;
    }
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
  }
};

// Pest Control Service
export const pestService = {
  assessPestRisk: async (location: { lat: number; lon: number }, cropType: string) => {
    try {
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      const forecast = await weatherService.getForecast(location.lat, location.lon);
      
      const crop = cropDatabase[cropType as keyof typeof cropDatabase];
      if (!crop) throw new Error('Crop not found');

      // Calculate pest risk based on weather conditions
      const riskFactors = {
        temperature: calculateTemperatureRisk(weather.main.temp),
        humidity: calculateHumidityRisk(weather.main.humidity),
        rainfall: calculateRainfallRisk(weather.rain?.['1h'] || 0),
        windSpeed: weather.wind.speed
      };

      const overallRisk = (riskFactors.temperature + riskFactors.humidity + riskFactors.rainfall) / 3;

      return {
        overallRisk: Math.round(overallRisk),
        riskLevel: overallRisk > 70 ? 'High' : overallRisk > 40 ? 'Medium' : 'Low',
        commonPests: crop.pests.map(pest => ({
          name: pest,
          riskLevel: Math.round(overallRisk + (Math.random() - 0.5) * 20),
          symptoms: getPestSymptoms(pest),
          treatment: getPestTreatment(pest)
        })),
        weatherImpact: {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          rainfall: weather.rain?.['1h'] || 0
        },
        recommendations: generatePestRecommendations(overallRisk, crop.pests),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Pest Assessment Error:', error);
      throw error;
    }
  }
};

// Irrigation Service
export const irrigationService = {
  getIrrigationSchedule: async (location: { lat: number; lon: number }, cropType: string) => {
    try {
      const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
      const forecast = await weatherService.getForecast(location.lat, location.lon);
      
      const crop = cropDatabase[cropType as keyof typeof cropDatabase];
      if (!crop) throw new Error('Crop not found');

      // Calculate daily water requirements
      const schedule = forecast.list.slice(0, 7).map((day: any, index: number) => {
        const date = new Date(day.dt * 1000);
        const rainfall = day.rain?.['3h'] || 0;
        const temp = day.main.temp;
        const humidity = day.main.humidity;
        
        // Calculate evapotranspiration (simplified)
        const et = calculateEvapotranspiration(temp, humidity, day.wind.speed);
        const waterNeed = Math.max(0, et - rainfall);
        
        return {
          date: date.toLocaleDateString(),
          waterAmount: Math.round(waterNeed * 10) / 10,
          duration: Math.round(waterNeed * 60 / 10), // minutes
          method: waterNeed > 5 ? 'Drip' : waterNeed > 2 ? 'Sprinkler' : 'Natural',
          priority: waterNeed > 8 ? 'High' : waterNeed > 4 ? 'Medium' : 'Low',
          weather: {
            temp: Math.round(temp),
            humidity: humidity,
            rainfall: Math.round(rainfall * 10) / 10,
            conditions: day.weather[0].description
          }
        };
      });

      return {
        schedule,
        totalWaterWeek: schedule.reduce((sum, day) => sum + day.waterAmount, 0),
        recommendations: generateIrrigationRecommendations(schedule, crop),
        efficiency: {
          drip: { efficiency: 90, cost: 'High', suitability: 'All crops' },
          sprinkler: { efficiency: 75, cost: 'Medium', suitability: 'Field crops' },
          furrow: { efficiency: 60, cost: 'Low', suitability: 'Row crops' }
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Irrigation Schedule Error:', error);
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
    recommendations.push('Apply nitrogen fertilizer or compost');
  }
  
  if (analysis.phosphorus < 30) {
    recommendations.push('Apply phosphorus fertilizer (DAP or TSP)');
  }
  
  if (analysis.potassium < 200) {
    recommendations.push('Apply potassium fertilizer (Muriate of Potash)');
  }
  
  if (analysis.organicMatter < 3) {
    recommendations.push('Increase organic matter with compost or manure');
  }
  
  return recommendations;
}

function calculateSoilHealth(analysis: any) {
  let score = 0;
  
  // pH score (optimal 6.0-7.0)
  if (analysis.ph >= 6.0 && analysis.ph <= 7.0) score += 25;
  else if (analysis.ph >= 5.5 && analysis.ph <= 7.5) score += 15;
  else score += 5;
  
  // Nutrient scores
  score += Math.min(25, (analysis.nitrogen / 100) * 25);
  score += Math.min(25, (analysis.phosphorus / 100) * 25);
  score += Math.min(25, (analysis.organicMatter / 6) * 25);
  
  return Math.round(score);
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

// Export all services
export default {
  weatherService,
  soilService,
  pestService,
  irrigationService,
  cropDatabase,
  cropCategories
};