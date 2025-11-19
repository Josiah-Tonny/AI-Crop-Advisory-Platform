import express from 'express';
import axios from 'axios';
import { calculateSoilCapacity, estimateSoilMoisture } from '../services/soilWaterBalance.js';
import { fetchCurrentWeather } from '../services/weatherFetcher.js';

// Get external API keys
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'c6fbd54581688fcc0d5509271b63656c';
const AIMLAPI_AI_API_KEY = process.env.AIMLAPI_AI_API_KEY || process.env.VITE_AIMLAPI_AI_API_KEY || 'dcc847936b14463cac35a898489fb72e';

// Create axios instance for external AI API
const aiClient = axios.create({
  baseURL: 'https://api.aimlapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AIMLAPI_AI_API_KEY}`
  },
  timeout: 30000
});

const router = express.Router();

// Simple logger
const logger = {
  info: (msg) => {},
  error: (msg) => {}
};

/**
 * POST /analysis
 * Generate soil analysis based on location, soil type, and weather data
 */
router.post('/analysis', async (req, res) => {
  try {
    // Received soil analysis request
    
    // Extract request parameters
    const {
      location,
      cropType,
      soilType = 'loam',
      previousCrops = [],
      fieldSize,
      weatherData // Optional - if not provided, we'll fetch it
    } = req.body;
    
    // Validate required parameters
    if (!location || !location.lat || !location.lon) {
      // Missing location data
      return res.status(400).json({
        success: false,
        message: 'Location data (lat, lon) is required'
      });
    }
    
    // Get weather data if not provided
    let currentWeather = weatherData;
    if (!currentWeather) {
      try {
        currentWeather = await fetchCurrentWeather(location.lat, location.lon);
        // Fetched current weather data for soil analysis
      } catch (weatherError) {
        // Failed to fetch weather data: weatherError.message
        // Continue without weather data
      }
    }
    
    // Calculate soil capacity based on soil type
    const soilCapacityData = calculateSoilCapacity(soilType, 1.0); // Default 1m root depth
    
    // Estimate current soil moisture
    const soilMoisture = estimateSoilMoisture(
      soilType,
      currentWeather?.rain?.['1h'] || 0, // Recent rainfall
      currentWeather?.main?.temp ? (currentWeather.main.temp * 0.5) : 0, // Approximate ET
      null, // No current moisture reading
      1.0 // Root depth
    );
    
    // Generate recommendations based on soil analysis
    const recommendations = generateSoilRecommendations(soilCapacityData, soilMoisture, cropType);
    
    // Calculate soil health score
    const healthScore = calculateSoilHealth(soilCapacityData, soilMoisture);
    
    // Prepare response
    const response = {
      success: true,
      soilAnalysis: {
        location: {
          lat: location.lat,
          lon: location.lon
        },
        soilType: soilType,
        soilCapacity: soilCapacityData,
        moisture: soilMoisture,
        healthScore: healthScore,
        recommendations: recommendations,
        weatherContext: currentWeather ? {
          temperature: currentWeather.main?.temp,
          humidity: currentWeather.main?.humidity,
          rainfall: currentWeather.rain?.['1h'] || 0
        } : null,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Soil analysis generated successfully
    return res.status(200).json(response);
    
  } catch (error) {
    // Unexpected error: error.message
    // error.stack
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while processing your request'
    });
  }
});

/**
 * GET /analysis/history
 * Get soil analysis history
 */
router.get('/analysis/history', async (req, res) => {
  try {
    // For now, return a placeholder response
    // In a real implementation, this would fetch historical data from a database
    return res.status(200).json({
      success: true,
      history: [],
      message: 'Soil history endpoint is working'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch soil history',
      error: error.message
    });
  }
});

/**
 * POST /samples
 * Upload soil sample data
 */
router.post('/samples', async (req, res) => {
  try {
    // For now, return a placeholder response
    // In a real implementation, this would save sample data to a database
    return res.status(200).json({
      success: true,
      message: 'Soil sample uploaded successfully',
      data: req.body
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload soil sample',
      error: error.message
    });
  }
});

/**
 * POST /recommendations
 * Get soil recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    // For now, return a placeholder response
    // In a real implementation, this would generate recommendations based on soil data
    return res.status(200).json({
      success: true,
      recommendations: [
        'Add organic compost to improve soil structure',
        'Test soil pH and adjust if necessary',
        'Consider crop rotation to maintain soil health'
      ],
      message: 'Soil recommendations generated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate soil recommendations',
      error: error.message
    });
  }
});

/**
 * Generate soil recommendations based on analysis
 */
function generateSoilRecommendations(soilCapacity, soilMoisture, cropType) {
  const recommendations = [];
  
  // pH recommendations based on soil type
  if (soilCapacity.soilType === 'sandy') {
    recommendations.push('Sandy soil: Add organic matter to improve water retention');
    recommendations.push('Consider using mulch to reduce water evaporation');
  } else if (soilCapacity.soilType === 'clay') {
    recommendations.push('Clay soil: Add sand and organic matter to improve drainage');
    recommendations.push('Avoid working soil when wet to prevent compaction');
  } else if (soilCapacity.soilType === 'silt') {
    recommendations.push('Silt soil: Add organic matter to improve structure');
    recommendations.push('Ensure good drainage to prevent waterlogging');
  }
  
  // Moisture-based recommendations
  if (soilMoisture.status === 'critical') {
    recommendations.push('Critical soil moisture: Immediate irrigation needed');
    recommendations.push('Consider drip irrigation for efficient water use');
  } else if (soilMoisture.status === 'low') {
    recommendations.push('Low soil moisture: Plan irrigation within 2-3 days');
  } else if (soilMoisture.status === 'optimal') {
    recommendations.push('Optimal soil moisture: Maintain current watering schedule');
  }
  
  // Crop-specific recommendations
  if (cropType) {
    recommendations.push(`For ${cropType}: Monitor soil moisture closely during critical growth stages`);
  }
  
  return recommendations;
}

/**
 * Calculate soil health score based on capacity and moisture
 */
function calculateSoilHealth(soilCapacity, soilMoisture) {
  let score = 0;
  
  // Base score from soil type (loamy is ideal)
  if (soilCapacity.soilType === 'loamy') {
    score += 40;
  } else if (soilCapacity.soilType === 'silt') {
    score += 35;
  } else if (soilCapacity.soilType === 'clay') {
    score += 30;
  } else if (soilCapacity.soilType === 'sandy') {
    score += 25;
  }
  
  // Score from moisture status
  if (soilMoisture.status === 'optimal') {
    score += 35;
  } else if (soilMoisture.status === 'adequate') {
    score += 30;
  } else if (soilMoisture.status === 'moderate') {
    score += 20;
  } else if (soilMoisture.status === 'low') {
    score += 10;
  } else if (soilMoisture.status === 'critical') {
    score += 5;
  }
  
  // Score from capacity
  if (soilCapacity.totalCapacity >= 150) {
    score += 25;
  } else if (soilCapacity.totalCapacity >= 100) {
    score += 20;
  } else if (soilCapacity.totalCapacity >= 70) {
    score += 15;
  } else {
    score += 10;
  }
  
  return Math.min(100, Math.round(score));
}

export default router;
