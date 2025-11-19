/**
 * Crop Recommendation Routes
 * Provides AI-powered crop recommendations based on location, soil conditions, and weather
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Simple logger
const logger = {
  info: (msg) => console.log(`[CROPS] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[CROPS ERROR] ${new Date().toISOString()} - ${msg}`)
};

// Trefle API configuration
const TREFLE_API_KEY = process.env.TREFLE_API_KEY || process.env.VITE_TREFLE_API_KEY || 'usr-FI3Q4yNp4sIfzzhtlYu20zBSvjEhKaN5r67aihtHrzQ';
const TREFLE_BASE_URL = 'https://trefle.io/api/v1';

/**
 * POST /recommend
 * Generate crop recommendations based on location, soil, and weather data
 */
router.post('/recommend', async (req, res) => {
  try {
    logger.info('Received crop recommendation request');
    
    // Extract request parameters
    const {
      location,
      soilType = 'loam',
      previousCrops = [],
      weatherData,
      trefleRecommendations,
      companionPlanting
    } = req.body;
    
    // Validate required parameters
    if (!location || !location.lat || !location.lon) {
      logger.error('Missing location data');
      return res.status(400).json({
        success: false,
        message: 'Location data (lat, lon) is required'
      });
    }
    
    // If we already have Trefle recommendations from the client, use them
    let recommendations = trefleRecommendations || [];
    
    // If we don't have Trefle recommendations, fetch them
    if (!recommendations || recommendations.length === 0) {
      try {
        recommendations = await fetchTrefleRecommendations(weatherData);
        logger.info('Trefle recommendations fetched successfully');
      } catch (trefleError) {
        logger.error(`Failed to fetch Trefle recommendations: ${trefleError.message}`);
        // Continue without Trefle data
      }
    }
    
    // Prepare response
    const response = {
      success: true,
      recommendations: recommendations,
      companionPlanting: companionPlanting,
      metadata: {
        location: {
          lat: location.lat,
          lon: location.lon
        },
        soilType: soilType,
        weather: weatherData
      }
    };
    
    logger.info('Crop recommendations generated successfully');
    return res.status(200).json(response);
    
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.error(error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while processing your request'
    });
  }
});

/**
 * Proxy endpoint for Trefle API calls to avoid CORS issues
 */
router.get('/trefle/plants', async (req, res) => {
  try {
    const { ...params } = req.query;
    
    // Make request to Trefle API
    const response = await axios.get(`${TREFLE_BASE_URL}/plants`, {
      params: {
        ...params,
        token: TREFLE_API_KEY
      },
      timeout: 10000
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    logger.error(`Trefle API error: ${error.message}`);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch data from Trefle API',
      error: error.message
    });
  }
});

/**
 * Fetch crop recommendations from Trefle API based on weather data
 */
async function fetchTrefleRecommendations(weatherData) {
  if (!weatherData || !weatherData.temperature) {
    return [];
  }
  
  try {
    // Convert temperature from Celsius to Fahrenheit for Trefle API
    const tempF = (weatherData.temperature * 9/5) + 32;
    
    // Search plants by temperature range
    const trefleCriteria = {
      temperature_minimum_deg_f: Math.max(tempF - 15, 0), // Min suitable temp
      temperature_maximum_deg_f: tempF + 15 // Max suitable temp
    };
    
    // Make request to Trefle API directly (not through our proxy)
    const response = await axios.get(`${TREFLE_BASE_URL}/plants`, {
      params: {
        ...trefleCriteria,
        token: TREFLE_API_KEY
      },
      timeout: 10000
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      // Map Trefle data to our recommendation format
      return response.data.data.slice(0, 5).map(plant => ({
        name: plant.common_name || plant.scientific_name,
        scientificName: plant.scientific_name,
        suitability: 85, // Default high suitability since they match climate criteria
        waterRequirement: 'Medium', // Would need to map from Trefle data
        growthPeriod: 'Varies',
        family: plant.family,
        imageUrl: plant.image_url,
        dataSource: 'Trefle Plant Database'
      }));
    }
    
    return [];
  } catch (error) {
    logger.error(`Failed to fetch Trefle recommendations: ${error.message}`);
    throw error;
  }
}

export default router;