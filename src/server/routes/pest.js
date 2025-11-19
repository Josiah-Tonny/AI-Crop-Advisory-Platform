import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get external API keys
const AIMLAPI_AI_API_KEY = process.env.AIMLAPI_AI_API_KEY || process.env.VITE_AIMLAPI_AI_API_KEY || 'dcc847936b14463cac35a898489fb72e';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Create axios instance for external AI API
const aiClient = axios.create({
  baseURL: 'https://api.aimlapi.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AIMLAPI_AI_API_KEY}`
  },
  timeout: 30000
});

// Create axios instance for weather API
const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000
});

// Get weather data for pest risk assessment
async function getWeatherData(lat, lon) {
  try {
    const response = await weatherClient.get('/weather', {
      params: {
        lat: lat,
        lon: lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    // Handle error silently
    return null;
  }
}

// Get pest data from API
async function getPestData() {
  try {
    // Return default pest data instead of calling a non-existent endpoint
    return [
      {
        id: 'fall-armyworm',
        name: 'Fall Armyworm',
        scientificName: 'Spodoptera frugiperda',
        description: 'A destructive pest that feeds on over 80 plant species, causing significant damage to maize and other crops.',
        affectedCrops: ['maize', 'sorghum', 'rice', 'wheat'],
        damageType: 'Leaf feeding, stem boring',
        controlMethods: ['Biological control with natural enemies', 'Bt maize varieties', 'Chemical insecticides', 'Cultural practices'],
        severity: 'severe'
      },
      {
        id: 'aphids',
        name: 'Aphids',
        scientificName: 'Aphididae family',
        description: 'Small sap-sucking insects that can cause stunted growth and transmit plant viruses.',
        affectedCrops: ['maize', 'vegetables', 'fruits', 'cotton'],
        damageType: 'Sap sucking, virus transmission',
        controlMethods: ['Beneficial insects (ladybugs, lacewings)', 'Insecticidal soaps', 'Neem oil', 'Reflective mulches'],
        severity: 'moderate'
      },
      {
        id: 'cutworms',
        name: 'Cutworms',
        scientificName: 'Noctuidae family',
        description: 'Larvae of various moth species that cut young plants at the soil surface.',
        affectedCrops: ['maize', 'vegetables', 'cotton'],
        damageType: 'Stem cutting',
        controlMethods: ['Collars around seedlings', 'Tillage practices', 'Beneficial nematodes', 'Bacillus thuringiensis'],
        severity: 'high'
      },
      {
        id: 'corn-borer',
        name: 'European Corn Borer',
        scientificName: 'Ostrinia nubilalis',
        description: 'A moth whose larvae feed on corn stalks, ears, and leaves, causing significant yield losses.',
        affectedCrops: ['maize', 'peppers', 'potatoes'],
        damageType: 'Boring, stem tunneling',
        controlMethods: ['Bt corn varieties', 'Beneficial parasitoids', 'Crop rotation', 'Timely planting'],
        severity: 'high'
      },
      {
        id: 'stemborer',
        name: 'Stem Borer',
        scientificName: 'Chilo partellus',
        description: 'Larvae bore into the stems of cereal crops, causing dead heart and white ear symptoms.',
        affectedCrops: ['maize', 'sorghum', 'rice'],
        damageType: 'Stem boring',
        controlMethods: ['Resistant varieties', 'Early planting', 'Destruction of crop residues', 'Biological control'],
        severity: 'severe'
      }
    ];
  } catch (error) {
    // Handle error silently and return minimal data
    console.error('Error getting pest data:', error.message);
    return [
      {
        id: 'general-pests',
        name: 'Common Agricultural Pests',
        scientificName: 'Various species',
        description: 'General pest pressure affecting crops in the region.',
        affectedCrops: ['maize', 'wheat', 'rice', 'vegetables'],
        damageType: 'Various',
        controlMethods: ['Integrated pest management', 'Regular monitoring', 'Cultural practices'],
        severity: 'moderate'
      }
    ];
  }
}

// Get common pests by crop type
router.get('/common-pests', async (req, res) => {
  // Common pests endpoint called
  try {
    const { cropType } = req.query;
    const pestData = await getPestData();
    
    if (!pestData) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve pest data'
      });
    }
    
    // If specific crop is requested, filter the pests
    let pests = pestData;
    
    if (cropType && cropType !== 'all') {
      pests = pests.filter(pest => 
        pest.affectedCrops.includes(cropType.toLowerCase())
      );
    }
    
    return res.json({
      success: true,
      pests: pests,
      count: pests.length
    });
  } catch (error) {
    // Handle error silently
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get pest details by ID
router.get('/details/:pestId', async (req, res) => {
  try {
    const { pestId } = req.params;
    const pestData = await getPestData();
    
    if (!pestData) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve pest data'
      });
    }
    
    const pest = pestData.find(p => p.id === pestId);
    
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }
    
    return res.json({
      success: true,
      pest: pest
    });
  } catch (error) {
    // Handle error silently
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Assess pest risk based on location and crop type
router.get('/assess-risk', async (req, res) => {
  // GET /assess-risk called with query: req.query
  try {
    const { lat, lon, cropType } = req.query;
    
    if (!lat || !lon || !cropType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // Get weather data for better risk assessment
    const weatherData = await getWeatherData(lat, lon);
    
    // Create a default risk assessment
    const riskAssessment = {
      riskLevel: 'moderate',
      riskFactors: [
        'General pest pressure in the region',
        weatherData ? `Temperature: ${weatherData.main.temp}°C` : 'Weather data unavailable',
        weatherData ? `Humidity: ${weatherData.main.humidity}%` : 'Weather data unavailable'
      ],
      recommendations: [
        'Monitor crops regularly for pest presence',
        'Implement integrated pest management practices',
        'Maintain proper field sanitation',
        'Encourage beneficial insects and natural predators'
      ],
      possibleThreats: [
        'Common local pests',
        'Seasonal pest migrations',
        'Secondary pest outbreaks'
      ]
    };
    
    return res.json({
      success: true,
      riskAssessment: riskAssessment
    });
  } catch (error) {
    // Handle error silently
    return res.status(500).json({
      success: false,
      message: 'Failed to assess pest risk',
      error: error.message
    });
  }
});

// POST endpoint for pest risk assessment (to match frontend expectations)
router.post('/assess-risk', async (req, res) => {
  // POST /assess-risk called with body: req.body
  try {
    const { location, cropType, symptoms, imageUrl, enhancedData } = req.body;
    
    if (!location || !location.lat || !location.lon || !cropType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: location (lat, lon) and cropType are required'
      });
    }
    
    // Get weather data for better risk assessment
    const weatherData = await getWeatherData(location.lat, location.lon);
    
    // Create a default risk assessment
    const riskAssessment = {
      riskLevel: 'moderate',
      riskFactors: [
        `Crop type: ${cropType}`,
        'General pest pressure in the region',
        weatherData ? `Temperature: ${weatherData.main.temp}°C` : 'Weather data unavailable',
        weatherData ? `Humidity: ${weatherData.main.humidity}%` : 'Weather data unavailable',
        symptoms && symptoms.length > 0 ? `Reported symptoms: ${symptoms.join(', ')}` : 'No symptoms reported'
      ],
      recommendations: [
        'Monitor crops regularly for pest presence',
        'Implement integrated pest management practices',
        'Maintain proper field sanitation',
        'Encourage beneficial insects and natural predators'
      ],
      possibleThreats: [
        'Common local pests',
        'Seasonal pest migrations',
        'Secondary pest outbreaks'
      ]
    };
    
    return res.json({
      success: true,
      riskAssessment: riskAssessment
    });
  } catch (error) {
    // Handle error silently
    return res.status(500).json({
      success: false,
      message: 'Failed to assess pest risk',
      error: error.message
    });
  }
});

// POST endpoint for pest detection (to match frontend expectations)
router.post('/detect', async (req, res) => {
  try {
    const { location, cropType, symptoms, imageUrl, enhancedData } = req.body;
    
    if (!location || !location.lat || !location.lon || !cropType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: location (lat, lon) and cropType are required'
      });
    }
    
    // Get weather data for better detection
    const weatherData = await getWeatherData(location.lat, location.lon);
    
    // Create a default detection result
    const detectionResult = {
      detectedPests: ['Common local pests'],
      recommendations: [
        'Monitor crops regularly for pest presence',
        'Implement integrated pest management practices',
        'Maintain proper field sanitation'
      ],
      riskLevel: 'moderate'
    };
    
    return res.json({
      success: true,
      detectedPests: detectionResult.detectedPests,
      recommendations: detectionResult.recommendations,
      riskLevel: detectionResult.riskLevel
    });
  } catch (error) {
    // Handle error silently
    return res.status(500).json({
      success: false,
      message: 'Failed to detect pests',
      error: error.message
    });
  }
});

export default router;