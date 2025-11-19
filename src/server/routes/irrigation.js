/**
 * Irrigation Recommendation Routes
 * Provides AI-powered irrigation scheduling based on real-time weather,
 * crop requirements, and soil conditions
 */

import express from 'express';
import { fetchCurrentWeather, fetchForecast } from '../services/weatherFetcher.js';
import axios from 'axios';
import { calculateET0 } from '../services/et0Calculator.js';
import { getCropCoefficient, isCropSupported, getSupportedCrops } from '../services/cropCoefficients.js';
import { calculateSoilCapacity, estimateSoilMoisture } from '../services/soilWaterBalance.js';
import { generateSchedule, generateRecommendations, generateWarnings } from '../services/irrigationScheduler.js';

const router = express.Router();

// Simple logger
const logger = {
  info: (msg) => {},
  error: (msg) => {}
};

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

/**
 * POST /recommend
 * Generate irrigation recommendations based on location, crop, and soil data
 */
router.post('/recommend', async (req, res) => {
  try {
    // Received irrigation recommendation request

    // Extract request parameters
    const {
      location,
      cropType,
      soilType = 'loamy',
      fieldSize,
      currentMoisture,
      plantingDate,
      weatherData // Ignored - we fetch fresh data
    } = req.body;

    // === INPUT VALIDATION ===

    // Validate required fields
    if (!location || !location.lat || !location.lon) {
      return res.status(400).json({
        success: false,
        message: 'Location with latitude and longitude is required',
        error: 'Missing required field: location'
      });
    }

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'Crop type is required',
        error: 'Missing required field: cropType'
      });
    }

    // Validate latitude and longitude ranges
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude. Must be between -90 and 90',
        error: 'Invalid coordinate'
      });
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude. Must be between -180 and 180',
        error: 'Invalid coordinate'
      });
    }

    // Validate crop type
    if (!isCropSupported(cropType)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported crop type: ${cropType}`,
        error: `Supported crops: ${getSupportedCrops().join(', ')}`
      });
    }

    // === FETCH WEATHER DATA ===

    // Fetching weather for location: lat, lon

    let currentWeather, forecast;
    try {
      currentWeather = await fetchCurrentWeather(lat, lon);
      forecast = await fetchForecast(lat, lon);

      if (!forecast || forecast.length === 0) {
        throw new Error('No forecast data available');
      }

      // Weather data fetched successfully. Forecast days: forecast.length
    } catch (weatherError) {
      // Weather API error: weatherError.message

      if (weatherError.message.includes('unavailable')) {
        return res.status(503).json({
          success: false,
          message: 'Weather service temporarily unavailable',
          error: 'Unable to fetch weather data. Please try again later.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch weather data',
        error: weatherError.message
      });
    }

    // === CALCULATE PLANTING DATE AND DAYS AFTER PLANTING ===

    let daysAfterPlanting;
    if (plantingDate) {
      const plantDate = new Date(plantingDate);
      const today = new Date();
      const diffTime = Math.abs(today - plantDate);
      daysAfterPlanting = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      // Default to 30 days after planting if not provided
      daysAfterPlanting = 30;
      // No planting date provided, assuming 30 days after planting
    }

    // === CALCULATE ET0 (REFERENCE EVAPOTRANSPIRATION) ===

    // Calculating reference evapotranspiration (ET0)

    let et0;
    try {
      et0 = calculateET0(currentWeather, lat, new Date());
      // ET0 calculated: et0 mm/day
    } catch (et0Error) {
      // ET0 calculation error: et0Error.message
      return res.status(500).json({
        success: false,
        message: 'Error calculating evapotranspiration',
        error: et0Error.message
      });
    }

    // === GET CROP COEFFICIENT AND INFO ===

    // Getting crop coefficient for cropType, daysAfterPlanting days after planting

    let cropData;
    try {
      cropData = getCropCoefficient(cropType, daysAfterPlanting);
      // Crop coefficient: cropData.kc, Stage: cropData.stage
    } catch (cropError) {
      // Crop coefficient error: cropError.message
      return res.status(400).json({
        success: false,
        message: 'Error retrieving crop data',
        error: cropError.message
      });
    }

    // Calculate crop water need (ETc = ET0  Kc)
    const cropWaterNeed = et0 * cropData.kc;

    // === SOIL WATER BALANCE ===

    // Calculating soil water balance for soilType soil

    const soilCapacityData = calculateSoilCapacity(soilType, cropData.rootDepth);
    const soilCapacity = soilCapacityData.totalCapacity;

    // Estimate current soil moisture if not provided
    let estimatedMoisture;
    if (currentMoisture !== null && currentMoisture !== undefined) {
      estimatedMoisture = currentMoisture;
    } else {
      // Estimate from recent weather (simplified - assume last 7 days similar to forecast)
      const recentRainfall = forecast.slice(0, 3).reduce((sum, day) => sum + day.precipitation, 0);
      const recentET = cropWaterNeed * 3; // Estimate for 3 days

      const moistureEstimate = estimateSoilMoisture(
        soilType,
        recentRainfall,
        recentET,
        null,
        cropData.rootDepth
      );

      estimatedMoisture = moistureEstimate.moisturePercent;
      // Estimated soil moisture: estimatedMoisture%
    }

    // === GENERATE IRRIGATION SCHEDULE ===

    // Generating 7-day irrigation schedule

    let schedule;
    try {
      schedule = generateSchedule({
        et0: et0,
        cropData: cropData,
        forecast: forecast,
        soilType: soilType,
        soilCapacity: soilCapacity,
        currentMoisture: estimatedMoisture,
        latitude: lat
      });

      // Schedule generated with schedule.length days
    } catch (scheduleError) {
      // Schedule generation error: scheduleError.message
      return res.status(500).json({
        success: false,
        message: 'Error generating irrigation schedule',
        error: scheduleError.message
      });
    }

    // === GENERATE RECOMMENDATIONS ===

    const weatherConditions = {
      avgTemp: forecast.reduce((sum, day) => sum + day.avgTemp, 0) / forecast.length,
      maxTemp: Math.max(...forecast.map(day => day.high)),
      minTemp: Math.min(...forecast.map(day => day.low)),
      avgHumidity: forecast.reduce((sum, day) => sum + day.avgHumidity, 0) / forecast.length,
      avgWind: forecast.reduce((sum, day) => sum + day.avgWindSpeed, 0) / forecast.length
    };

    const recommendations = generateRecommendations({
      soilType: soilType,
      cropData: cropData,
      weatherConditions: weatherConditions,
      schedule: schedule
    });

    // === GENERATE WARNINGS ===

    const warnings = generateWarnings({
      weatherConditions: weatherConditions,
      schedule: schedule,
      currentMoisture: estimatedMoisture
    });

    // === BUILD RESPONSE ===

    const response = {
      success: true,
      recommendedWaterAmount: Math.round(cropWaterNeed * 10) / 10,
      schedule: schedule,
      recommendations: recommendations,
      warnings: warnings,
      waterRequirements: `${cropData.stage === 'initial' ? 'Young' : cropData.stage === 'midSeason' ? 'Mature' : 'Late-stage'} ${cropType} requires ${Math.round(cropWaterNeed * 10) / 10}mm/day`,
      calculations: {
        et0: et0,
        cropCoefficient: cropData.kc,
        cropWaterNeed: Math.round(cropWaterNeed * 10) / 10,
        soilWaterCapacity: Math.round(soilCapacity),
        effectiveRainfall: Math.round(forecast.reduce((sum, day) => sum + day.precipitation, 0) * 10) / 10,
        method: 'FAO-56 Penman-Monteith',
        growthStage: cropData.stage,
        daysAfterPlanting: daysAfterPlanting
      },
      weatherSummary: {
        current: {
          temperature: currentWeather.temperature,
          humidity: currentWeather.humidity,
          windSpeed: currentWeather.windSpeed,
          condition: currentWeather.weatherDescription
        },
        forecast: forecast.map(day => ({
          date: day.date,
          high: Math.round(day.high),
          low: Math.round(day.low),
          precipitation: Math.round(day.precipitation * 10) / 10,
          precipitationChance: day.precipitationChance
        }))
      }
    };

    // Irrigation recommendation generated successfully

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
 * GET /supported-crops
 * Get list of supported crops
 */
router.get('/supported-crops', (req, res) => {
  try {
    const crops = getSupportedCrops();
    res.status(200).json({
      success: true,
      crops: crops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving supported crops',
      error: error.message
    });
  }
});

export default router;