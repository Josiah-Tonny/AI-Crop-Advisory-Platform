import axios from 'axios';

const WEATHER_API_KEY = 'c6fbd54581688fcc0d5509271b63656c';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Enhanced crop categories and types
export const cropCategories = {
  cereals: {
    name: 'Cereals & Grains',
    crops: ['Maize', 'Rice', 'Wheat', 'Sorghum', 'Millet', 'Barley', 'Oats']
  },
  legumes: {
    name: 'Legumes & Pulses',
    crops: ['Beans', 'Peas', 'Lentils', 'Chickpeas', 'Cowpeas', 'Soybeans', 'Groundnuts']
  },
  vegetables: {
    name: 'Vegetables',
    crops: ['Tomatoes', 'Onions', 'Cabbage', 'Kale', 'Spinach', 'Carrots', 'Peppers', 'Cucumbers']
  },
  fruits: {
    name: 'Fruits',
    crops: ['Bananas', 'Mangoes', 'Avocados', 'Oranges', 'Pineapples', 'Papayas', 'Passion Fruit']
  },
  tubers: {
    name: 'Root & Tuber Crops',
    crops: ['Irish Potatoes', 'Sweet Potatoes', 'Cassava', 'Yams', 'Arrowroots']
  },
  cash_crops: {
    name: 'Cash Crops',
    crops: ['Coffee', 'Tea', 'Cotton', 'Sugarcane', 'Tobacco', 'Pyrethrum']
  },
  herbs_spices: {
    name: 'Herbs & Spices',
    crops: ['Coriander', 'Ginger', 'Turmeric', 'Chili', 'Garlic', 'Basil']
  }
};

export const getAllCrops = () => {
  return Object.values(cropCategories).flatMap(category => category.crops);
};

// OpenWeatherMap API client
export const weatherClient = axios.create({
  baseURL: WEATHER_BASE_URL,
  params: {
    appid: WEATHER_API_KEY,
    units: 'metric'
  },
});

// Weather API functions
export const weatherAPI = {
  getCurrentWeather: (location: string) =>
    weatherClient.get(`/weather?q=${location}`),
  
  getForecast: (location: string) =>
    weatherClient.get(`/forecast?q=${location}`),
  
  getWeatherByCoords: (lat: number, lon: number) =>
    weatherClient.get(`/weather?lat=${lat}&lon=${lon}`),
  
  getForecastByCoords: (lat: number, lon: number) =>
    weatherClient.get(`/forecast?lat=${lat}&lon=${lon}`),
};

// AI Advisory functions for crop recommendations
export const aiAdvisoryAPI = {
  getCropRecommendations: async (data: {
    location: string;
    soilType: string;
    season: string;
    farmSize: number;
    currentCrops?: string[];
  }) => {
    try {
      // Get weather data for the location
      const weatherResponse = await weatherAPI.getCurrentWeather(data.location);
      const weather = weatherResponse.data;
      
      // AI-powered crop recommendations based on weather and location
      const recommendations = generateCropRecommendations(data, weather);
      
      return { data: recommendations };
    } catch (error) {
      console.error('Error in getCropRecommendations:', error);
      throw error;
    }
  },

  getSoilAnalysis: async (data: {
    location: string;
    pH?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
  }) => {
    try {
      const weatherResponse = await weatherAPI.getCurrentWeather(data.location);
      const weather = weatherResponse.data;
      
      const analysis = generateSoilAnalysis(data, weather);
      
      return { data: analysis };
    } catch (error) {
      console.error('Error in getSoilAnalysis:', error);
      throw error;
    }
  },

  getPestControl: async (data: {
    location: string;
    cropType: string;
    symptoms: string[];
  }) => {
    try {
      const weatherResponse = await weatherAPI.getCurrentWeather(data.location);
      const weather = weatherResponse.data;
      
      const pestControl = generatePestControlAdvice(data, weather);
      
      return { data: pestControl };
    } catch (error) {
      console.error('Error in getPestControl:', error);
      throw error;
    }
  },

  getIrrigationAdvice: async (data: {
    location: string;
    cropType: string;
    soilType: string;
    farmSize: number;
  }) => {
    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        weatherAPI.getCurrentWeather(data.location),
        weatherAPI.getForecast(data.location)
      ]);
      
      const irrigation = generateIrrigationAdvice(data, weatherResponse.data, forecastResponse.data);
      
      return { data: irrigation };
    } catch (error) {
      console.error('Error in getIrrigationAdvice:', error);
      throw error;
    }
  },
};

// AI recommendation algorithms
function generateCropRecommendations(data: any, weather: any) {
  const { location, soilType, season, farmSize } = data;
  const { main, weather: weatherConditions } = weather;
  
  const enhancedCrops = [
    {
      name: 'Maize',
      category: 'Cereals & Grains',
      suitability: calculateSuitability('maize', main, soilType, season),
      plantingDate: getOptimalPlantingDate('maize', season, location),
      expectedYield: calculateExpectedYield('maize', farmSize, main, soilType),
      profitability: calculateProfitability('maize', farmSize, main),
      marketDemand: 'High',
      growthDuration: '120-150 days',
      requirements: {
        rainfall: '500-800mm annually',
        temperature: '20-30°C',
        soilPH: '6.0-7.5',
        fertilizer: 'NPK 17:17:17 at planting, Urea top-dressing',
        spacing: '75cm x 25cm',
        seedRate: '20-25kg/hectare'
      },
      diseases: ['Fall Armyworm', 'Maize Streak Virus', 'Grey Leaf Spot'],
      pests: ['Stalk Borer', 'Cutworms', 'Aphids'],
      tips: [
        'Plant during long rains (March-May) or short rains (October-December)',
        'Ensure proper spacing: 75cm between rows, 25cm between plants',
        'Apply organic manure 2 weeks before planting',
        'Monitor for fall armyworm and apply appropriate control measures',
        'Top-dress with nitrogen fertilizer at knee-high stage',
        'Harvest when moisture content is 20-25%'
      ]
    },
    {
      name: 'Beans',
      category: 'Legumes & Pulses',
      suitability: calculateSuitability('beans', main, soilType, season),
      plantingDate: getOptimalPlantingDate('beans', season, location),
      expectedYield: calculateExpectedYield('beans', farmSize, main, soilType),
      profitability: calculateProfitability('beans', farmSize, main),
      marketDemand: 'Very High',
      growthDuration: '75-90 days',
      requirements: {
        rainfall: '400-600mm annually',
        temperature: '18-24°C',
        soilPH: '6.0-7.0',
        fertilizer: 'DAP at planting, minimal nitrogen needed',
        spacing: '30cm x 10cm',
        seedRate: '60-90kg/hectare'
      },
      diseases: ['Bean Rust', 'Angular Leaf Spot', 'Anthracnose'],
      pests: ['Bean Fly', 'Aphids', 'Bean Beetle'],
      tips: [
        'Beans fix nitrogen, excellent for crop rotation',
        'Plant spacing: 30cm between rows, 10cm between plants',
        'Harvest when pods are dry and rattle',
        'Store in airtight containers to prevent weevil damage',
        'Inoculate seeds with rhizobia for better nitrogen fixation',
        'Practice intercropping with maize for better land use'
      ]
    },
    {
      name: 'Coffee',
      category: 'Cash Crops',
      suitability: calculateSuitability('coffee', main, soilType, season),
      plantingDate: getOptimalPlantingDate('coffee', season, location),
      expectedYield: calculateExpectedYield('coffee', farmSize, main, soilType),
      profitability: calculateProfitability('coffee', farmSize, main),
      marketDemand: 'High',
      growthDuration: '3-4 years to maturity',
      requirements: {
        rainfall: '1000-1500mm annually',
        temperature: '15-24°C',
        soilPH: '6.0-6.5',
        fertilizer: 'NPK 17:17:17, organic matter essential',
        spacing: '2.5m x 2.5m',
        altitude: '1200-2100m above sea level'
      },
      diseases: ['Coffee Berry Disease', 'Coffee Leaf Rust', 'Bacterial Blight'],
      pests: ['Coffee Berry Borer', 'Antestia Bug', 'Thrips'],
      tips: [
        'Requires shade trees for optimal growth',
        'Plant during rainy season for establishment',
        'Prune regularly to maintain shape and productivity',
        'Harvest only ripe cherries for best quality',
        'Mulch around plants to conserve moisture',
        'Process cherries within 24 hours of harvesting'
      ]
    },
    {
      name: 'Tomatoes',
      category: 'Vegetables',
      suitability: calculateSuitability('tomatoes', main, soilType, season),
      plantingDate: getOptimalPlantingDate('tomatoes', season, location),
      expectedYield: calculateExpectedYield('tomatoes', farmSize, main, soilType),
      profitability: calculateProfitability('tomatoes', farmSize, main),
      marketDemand: 'Very High',
      growthDuration: '90-120 days',
      requirements: {
        rainfall: '600-1000mm annually',
        temperature: '18-27°C',
        soilPH: '6.0-7.0',
        fertilizer: 'High potassium fertilizer for fruit development',
        spacing: '60cm x 45cm',
        seedRate: '200-300g/hectare'
      },
      diseases: ['Early Blight', 'Late Blight', 'Bacterial Wilt'],
      pests: ['Whiteflies', 'Thrips', 'Cutworms'],
      tips: [
        'Stake plants for support and better air circulation',
        'Mulch around plants to retain moisture',
        'Regular pruning improves fruit quality',
        'Monitor for blight and apply preventive fungicides',
        'Harvest fruits at breaker stage for better shelf life',
        'Practice crop rotation to prevent soil-borne diseases'
      ]
    }
  ];

  return enhancedCrops.sort((a, b) => b.suitability - a.suitability);
}

function calculateProfitability(crop: string, farmSize: number, weather: any): string {
  const baseProfits = {
    maize: 50000, // KES per hectare
    beans: 80000,
    coffee: 150000,
    tomatoes: 200000
  };
  
  let baseProfit = baseProfits[crop.toLowerCase()] || 60000;
  
  // Weather factor
  if (weather.temp >= 20 && weather.temp <= 28) baseProfit *= 1.1;
  if (weather.humidity >= 60 && weather.humidity <= 75) baseProfit *= 1.05;
  
  const totalProfit = baseProfit * farmSize;
  
  return `KES ${totalProfit.toLocaleString()} (${baseProfit.toLocaleString()}/hectare)`;
}

function generateSoilAnalysis(data: any, weather: any) {
  const { location, pH = 6.5, nitrogen = 40, phosphorus = 20, potassium = 200 } = data;
  
  const analysis = {
    location,
    testDate: new Date().toISOString(),
    results: {
      pH: {
        value: pH,
        status: pH >= 6.0 && pH <= 7.5 ? 'optimal' : pH < 6.0 ? 'acidic' : 'alkaline',
        recommendation: pH < 6.0 ? 'Apply lime to raise pH' : pH > 7.5 ? 'Apply sulfur to lower pH' : 'pH is optimal'
      },
      nitrogen: {
        value: nitrogen,
        status: nitrogen >= 40 ? 'adequate' : nitrogen >= 20 ? 'moderate' : 'deficient',
        recommendation: nitrogen < 40 ? 'Apply nitrogen fertilizer or organic matter' : 'Maintain current levels'
      },
      phosphorus: {
        value: phosphorus,
        status: phosphorus >= 25 ? 'adequate' : phosphorus >= 15 ? 'moderate' : 'deficient',
        recommendation: phosphorus < 25 ? 'Apply phosphorus fertilizer (DAP or TSP)' : 'Maintain current levels'
      },
      potassium: {
        value: potassium,
        status: potassium >= 150 ? 'adequate' : potassium >= 100 ? 'moderate' : 'deficient',
        recommendation: potassium < 150 ? 'Apply potassium fertilizer (Muriate of Potash)' : 'Maintain current levels'
      }
    },
    overallHealth: calculateSoilHealth(pH, nitrogen, phosphorus, potassium),
    recommendations: [
      'Test soil every 2-3 years for optimal management',
      'Add organic matter to improve soil structure',
      'Practice crop rotation to maintain soil fertility',
      'Consider cover crops during off-season',
      'Maintain proper drainage to prevent waterlogging'
    ]
  };

  return analysis;
}

function generatePestControlAdvice(data: any, weather: any) {
  const { location, cropType, symptoms } = data;
  const { main } = weather;
  
  const commonPests = {
    maize: [
      {
        name: 'Fall Armyworm',
        symptoms: ['Holes in leaves', 'Damaged growing points', 'Frass in leaf whorls'],
        treatment: 'Apply Bt-based insecticides or neem oil early morning or evening',
        prevention: 'Early planting, crop rotation, biological control with natural enemies'
      },
      {
        name: 'Maize Stalk Borer',
        symptoms: ['Holes in stems', 'Broken stems', 'Dead hearts'],
        treatment: 'Apply systemic insecticides, remove and destroy affected plants',
        prevention: 'Clean cultivation, use resistant varieties, proper field sanitation'
      }
    ],
    beans: [
      {
        name: 'Bean Fly',
        symptoms: ['Yellowing leaves', 'Stunted growth', 'Stem mining'],
        treatment: 'Apply approved insecticides, remove affected plants immediately',
        prevention: 'Early planting, field sanitation, use certified seeds'
      },
      {
        name: 'Bean Aphids',
        symptoms: ['Curled leaves', 'Sticky honeydew', 'Yellowing'],
        treatment: 'Spray with insecticidal soap or neem oil',
        prevention: 'Encourage beneficial insects, avoid over-fertilization'
      }
    ],
    coffee: [
      {
        name: 'Coffee Berry Borer',
        symptoms: ['Holes in coffee berries', 'Premature berry drop'],
        treatment: 'Apply approved insecticides, harvest all berries regularly',
        prevention: 'Regular pruning, field sanitation, proper shade management'
      },
      {
        name: 'Coffee Leaf Rust',
        symptoms: ['Orange spots on leaves', 'Leaf drop', 'Reduced yield'],
        treatment: 'Apply copper-based fungicides during dry weather',
        prevention: 'Proper spacing, pruning for air circulation, resistant varieties'
      }
    ],
    tomatoes: [
      {
        name: 'Tomato Hornworm',
        symptoms: ['Large holes in leaves', 'Defoliation', 'Green caterpillars'],
        treatment: 'Hand-pick large caterpillars, apply Bt insecticides',
        prevention: 'Regular inspection, encourage beneficial insects'
      },
      {
        name: 'Early Blight',
        symptoms: ['Dark spots on leaves', 'Yellowing', 'Fruit spots'],
        treatment: 'Apply fungicides, remove affected plant parts',
        prevention: 'Proper spacing, avoid overhead watering, crop rotation'
      }
    ]
  };

  const relevantPests = commonPests[cropType.toLowerCase()] || [];
  
  return {
    location,
    cropType,
    weatherConditions: {
      temperature: main.temp,
      humidity: main.humidity,
      riskLevel: main.humidity > 70 && main.temp > 25 ? 'high' : main.humidity > 60 ? 'moderate' : 'low'
    },
    identifiedPests: relevantPests,
    generalAdvice: [
      'Monitor crops regularly for early pest detection',
      'Use integrated pest management (IPM) approaches',
      'Maintain field hygiene and remove crop residues',
      'Consider biological control methods when possible',
      'Rotate crops to break pest cycles',
      'Use certified seeds and resistant varieties'
    ],
    weatherBasedAdvice: main.humidity > 70 
      ? 'High humidity increases disease risk - ensure good air circulation and avoid overhead irrigation'
      : main.humidity < 40
      ? 'Low humidity may stress plants - monitor soil moisture and consider light irrigation'
      : 'Current weather conditions are favorable for crop health'
  };
}

function generateIrrigationAdvice(data: any, currentWeather: any, forecast: any) {
  const { location, cropType, soilType, farmSize } = data;
  const { main } = currentWeather;
  
  const cropWaterNeeds = {
    maize: { daily: 5, critical: ['tasseling', 'grain filling'] },
    beans: { daily: 3, critical: ['flowering', 'pod filling'] },
    coffee: { daily: 4, critical: ['flowering', 'berry development'] },
    tomatoes: { daily: 6, critical: ['flowering', 'fruit development'] },
    cabbage: { daily: 4, critical: ['head formation'] }
  };

  const soilWaterHolding = {
    clay: { capacity: 'high', drainage: 'poor', retentionDays: 7 },
    loam: { capacity: 'medium', drainage: 'good', retentionDays: 4 },
    sand: { capacity: 'low', drainage: 'excellent', retentionDays: 2 }
  };

  const cropNeeds = cropWaterNeeds[cropType.toLowerCase()] || cropWaterNeeds.maize;
  const soilProps = soilWaterHolding[soilType.toLowerCase()] || soilWaterHolding.loam;

  // Calculate irrigation needs based on weather forecast
  const upcomingRainfall = forecast.list
    .slice(0, 8) // Next 24 hours (3-hour intervals)
    .reduce((total: number, item: any) => total + (item.rain?.['3h'] || 0), 0);

  const irrigationNeeded = cropNeeds.daily - upcomingRainfall;

  return {
    location,
    cropType,
    soilType,
    currentConditions: {
      temperature: main.temp,
      humidity: main.humidity,
      pressure: main.pressure
    },
    dailyForecast: {
      expectedRainfall: upcomingRainfall,
      irrigationNeeded: Math.max(0, irrigationNeeded),
      recommendation: irrigationNeeded > 0 
        ? `Apply ${irrigationNeeded.toFixed(1)}mm of water today`
        : 'Natural rainfall should be sufficient today'
    },
    irrigationSchedule: generateIrrigationSchedule(cropNeeds, soilProps, forecast),
    methods: [
      {
        name: 'Drip Irrigation',
        efficiency: '90-95%',
        suitability: 'Excellent for all crops',
        cost: 'High initial, low operating'
      },
      {
        name: 'Sprinkler System',
        efficiency: '75-85%',
        suitability: 'Good for field crops',
        cost: 'Medium initial, medium operating'
      },
      {
        name: 'Furrow Irrigation',
        efficiency: '60-70%',
        suitability: 'Suitable for row crops',
        cost: 'Low initial, low operating'
      }
    ],
    tips: [
      'Water early morning (6-8 AM) or late evening to reduce evaporation',
      'Check soil moisture before irrigating - stick finger 2 inches deep',
      'Mulch around plants to retain moisture and suppress weeds',
      'Adjust irrigation based on crop growth stage and weather conditions',
      'Ensure proper drainage to prevent waterlogging and root rot'
    ]
  };
}

function generateIrrigationSchedule(cropNeeds: any, soilProps: any, forecast: any) {
  const schedule = [];
  
  // Group forecast by days (8 items per day, 3-hour intervals)
  for (let i = 0; i < Math.min(5, Math.floor(forecast.list.length / 8)); i++) {
    const dayStart = i * 8;
    const dayEnd = Math.min(dayStart + 8, forecast.list.length);
    const dayData = forecast.list.slice(dayStart, dayEnd);
    
    const rainExpected = dayData.reduce((total: number, item: any) => 
      total + (item.rain?.['3h'] || 0), 0);
    
    const needsIrrigation = rainExpected < cropNeeds.daily;
    const date = new Date(dayData[0].dt * 1000);
    
    schedule.push({
      date: date.toISOString().split('T')[0],
      rainExpected: rainExpected.toFixed(1),
      irrigationNeeded: needsIrrigation,
      amount: needsIrrigation ? `${(cropNeeds.daily - rainExpected).toFixed(1)}mm` : '0mm',
      timing: needsIrrigation ? 'Early morning (6-8 AM)' : 'No irrigation needed'
    });
  }
  
  return schedule;
}

// Helper functions
function calculateSuitability(crop: string, weather: any, soilType: string, season: string): number {
  let score = 50; // Base score
  
  // Temperature suitability
  const temp = weather.temp;
  if (crop === 'maize' && temp >= 20 && temp <= 30) score += 20;
  if (crop === 'beans' && temp >= 18 && temp <= 24) score += 20;
  if (crop === 'coffee' && temp >= 15 && temp <= 24) score += 20;
  if (crop === 'tomatoes' && temp >= 18 && temp <= 27) score += 20;
  
  // Humidity factor
  if (weather.humidity >= 60 && weather.humidity <= 80) score += 10;
  
  // Soil type bonus
  if (soilType === 'loam') score += 15;
  if (soilType === 'clay' && crop === 'coffee') score += 10;
  
  // Season appropriateness
  if (season.includes('rains') && (crop === 'maize' || crop === 'beans')) score += 15;
  
  return Math.min(100, Math.max(0, score));
}

function getOptimalPlantingDate(crop: string, season: string, location: string): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  
  // East Africa planting seasons
  if (season.includes('Long') || (currentMonth >= 2 && currentMonth <= 4)) {
    return 'March - May (Long Rains)';
  } else if (season.includes('Short') || (currentMonth >= 9 && currentMonth <= 11)) {
    return 'October - December (Short Rains)';
  }
  
  return 'Next suitable season: March-May or October-December';
}

function calculateExpectedYield(crop: string, farmSize: number, weather: any, soilType: string): string {
  const baseYields = {
    maize: 2.5, // tons per hectare
    beans: 1.2,
    coffee: 0.8,
    tomatoes: 15,
    cabbage: 25
  };
  
  let baseYield = baseYields[crop.toLowerCase()] || 2.0;
  
  // Weather factor
  const temp = weather.temp;
  if (temp >= 20 && temp <= 28) baseYield *= 1.1;
  if (weather.humidity >= 60 && weather.humidity <= 75) baseYield *= 1.05;
  
  // Soil factor
  if (soilType === 'loam') baseYield *= 1.1;
  if (soilType === 'clay') baseYield *= 0.95;
  if (soilType === 'sand') baseYield *= 0.9;
  
  const totalYield = baseYield * farmSize;
  
  return `${totalYield.toFixed(1)} tons (${baseYield.toFixed(1)} tons/hectare)`;
}

function calculateSoilHealth(pH: number, nitrogen: number, phosphorus: number, potassium: number): string {
  let score = 0;
  
  // pH score (0-25 points)
  if (pH >= 6.0 && pH <= 7.5) score += 25;
  else if (pH >= 5.5 && pH <= 8.0) score += 15;
  else score += 5;
  
  // Nitrogen score (0-25 points)
  if (nitrogen >= 40) score += 25;
  else if (nitrogen >= 20) score += 15;
  else score += 5;
  
  // Phosphorus score (0-25 points)
  if (phosphorus >= 25) score += 25;
  else if (phosphorus >= 15) score += 15;
  else score += 5;
  
  // Potassium score (0-25 points)
  if (potassium >= 150) score += 25;
  else if (potassium >= 100) score += 15;
  else score += 5;
  
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

// Crop and soil data for AI recommendations
export const cropAPI = {
  getCropHistory: async () => {
    // Mock data for demo
    return { data: [] };
  }
};

export const soilAPI = {
  getSoilHistory: async () => {
    // Mock data for demo
    return { data: [] };
  }
};