import axios from 'axios';
import { WeatherData } from '../types';
import { weatherService } from './weatherService';
import plantService from './plantService';
import imageService from './secureImageService';
import educationService from './educationService';

// Backend URL for any server-side APIs
// Authentication should be handled by server-side session cookies or JWTs, not by exposing secrets in the frontend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance for AI API service
const aimlClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Common error handler for API requests
const handleApiError = (error: Error | unknown, customMessage: string): never => {
  // Handle API error silently
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${customMessage}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      throw new Error(`Network error: Unable to reach API. Please check your connection.`);
    }
  }
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${customMessage}: ${errorMessage}`);
};

/**
 * Get water needs (mm/day) for different crop types
 */
const getCropWaterNeeds = (cropType: string): number => {
  const cropWaterNeeds: Record<string, number> = {
    'maize': 5.5,
    'corn': 5.5,
    'rice': 8.0,
    'wheat': 4.5,
    'barley': 4.0,
    'sorghum': 4.0,
    'millet': 4.0,
    'oats': 4.0,
    'rye': 4.0,
    'beans': 4.0,
    'peas': 4.0,
    'lentils': 4.0,
    'chickpeas': 4.0,
    'soybeans': 5.0,
    'peanuts': 5.5,
    'potatoes': 5.0,
    'sweet potatoes': 4.5,
    'cassava': 4.0,
    'yams': 4.0,
    'tomatoes': 5.5,
    'peppers': 5.0,
    'eggplant': 5.0,
    'okra': 5.0,
    'cabbage': 4.0,
    'lettuce': 3.5,
    'spinach': 3.5,
    'kale': 3.5,
    'broccoli': 4.0,
    'cauliflower': 4.0,
    'onions': 3.5,
    'garlic': 3.5,
    'carrots': 3.5,
    'radishes': 3.5,
    'beets': 3.5,
    'turnips': 3.5,
    'cucumbers': 5.0,
    'squash': 5.0,
    'pumpkins': 5.0,
    'melons': 5.5,
    'watermelons': 5.5,
    'strawberries': 4.0,
    'blueberries': 4.0,
    'raspberries': 4.0,
    'grapes': 4.5,
    'apples': 4.0,
    'pears': 4.0,
    'peaches': 4.5,
    'plums': 4.0,
    'cherries': 4.0,
    'oranges': 5.0,
    'lemons': 4.5,
    'limes': 4.5,
    'grapefruits': 4.5,
    'coffee': 5.0,
    'tea': 4.5,
    'cotton': 6.0,
    'sugarcane': 7.0,
    'sunflowers': 5.0,
    'canola': 4.5,
    'flax': 4.5,
    'alfalfa': 5.5,
    'clover': 4.5,
    'pasture': 4.0,
    'grass': 4.0
  };
  
  const normalizedCropType = cropType.toLowerCase();
  return cropWaterNeeds[normalizedCropType] || 5.0; // Default to 5.0 mm/day if not found
};

/**
 * Get the number of days until the next significant rainfall
 */
const getNextRainyDay = (forecast?: Array<{ date: string; precipitation: number }>): number | null => {
  if (!forecast || forecast.length === 0) {
    return null;
  }
  
  // Define significant rainfall as >= 2mm
  const significantRainfall = 2.0;
  
  for (let i = 0; i < forecast.length; i++) {
    if (forecast[i].precipitation >= significantRainfall) {
      return i + 1; // Days from now (1-based)
    }
  }
  
  return null; // No significant rainfall in forecast period
};

/**
 * Get the current season based on the date
 * This is a simplified version and would need to be adjusted for different hemispheres
 */
const getCurrentSeason = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  // Northern hemisphere seasons
  if (month >= 3 && month <= 5) {
    return 'Spring';
  } else if (month >= 6 && month <= 8) {
    return 'Summer';
  } else if (month >= 9 && month <= 11) {
    return 'Fall';
  } else {
    return 'Winter';
  }
};

/**
 * Helper function to get soil characteristics based on soil type
 */
const getSoilCharacteristics = (soilType: string): Record<string, string | number> => {
  const soilCharacteristics: Record<string, Record<string, string | number>> = {
    'clay': {
      waterRetention: 'High',
      nutrientRetention: 'High',
      drainage: 'Poor',
      warming: 'Slow',
      tillage: 'Difficult',
      compaction: 'High Risk'
    },
    'silt': {
      waterRetention: 'Medium',
      nutrientRetention: 'Medium',
      drainage: 'Medium',
      warming: 'Medium',
      tillage: 'Moderate',
      compaction: 'Medium Risk'
    },
    'sand': {
      waterRetention: 'Low',
      nutrientRetention: 'Low',
      drainage: 'Excellent',
      warming: 'Fast',
      tillage: 'Easy',
      compaction: 'Low Risk'
    },
    'loam': {
      waterRetention: 'Medium-High',
      nutrientRetention: 'High',
      drainage: 'Good',
      warming: 'Medium',
      tillage: 'Easy',
      compaction: 'Medium Risk'
    },
    'clay loam': {
      waterRetention: 'Medium-High',
      nutrientRetention: 'High',
      drainage: 'Medium',
      warming: 'Medium',
      tillage: 'Moderate',
      compaction: 'Medium-High Risk'
    },
    'sandy loam': {
      waterRetention: 'Low-Medium',
      nutrientRetention: 'Medium',
      drainage: 'Good',
      warming: 'Medium-Fast',
      tillage: 'Easy',
      compaction: 'Low-Medium Risk'
    },
    'silty loam': {
      waterRetention: 'Medium',
      nutrientRetention: 'Medium-High',
      drainage: 'Medium',
      warming: 'Medium',
      tillage: 'Moderate',
      compaction: 'Medium Risk'
    },
    'peat': {
      waterRetention: 'Very High',
      nutrientRetention: 'Medium',
      drainage: 'Poor',
      warming: 'Very Slow',
      tillage: 'Easy when dry',
      compaction: 'Low when dry, High when wet'
    },
    'chalk': {
      waterRetention: 'Low',
      nutrientRetention: 'Low',
      drainage: 'Excessive',
      warming: 'Fast',
      tillage: 'Variable',
      compaction: 'Low Risk'
    }
  };
  
  const normalizedSoilType = soilType.toLowerCase();
  return soilCharacteristics[normalizedSoilType] || soilCharacteristics['loam']; // Default to loam if not found
};

export const aimlService = {
  /**
   * Get soil analysis recommendations based on location and parameters
   * Enhanced with real-time weather data from OpenWeather API
   */
  getSoilAnalysis: async (location: { lat: number, lon: number }, params?: {
    cropType?: string,
    soilType?: string,
    previousCrops?: string[],
    weatherData?: {
      temperature?: number;
      humidity?: number;
      rainfall?: number;
    }
    
  }) => {
    try {
      // Get real-time weather data to enhance soil analysis
      let weatherData = params?.weatherData;
      
      if (!weatherData) {
        try {
          const weatherResponse = await weatherService.getCurrentWeather(location.lat, location.lon);
          weatherData = {
            temperature: weatherResponse.temperature,
            humidity: weatherResponse.humidity,
            rainfall: weatherResponse.forecast?.[0]?.precipitation || 0
          };
        } catch (weatherError: unknown) {
          // Continue without weather data
          if (weatherError instanceof Error) {
            console.warn('Failed to fetch weather data:', weatherError.message);
          } else {
            console.warn('Failed to fetch weather data:', String(weatherError));
          }
        }
      }
      
      // Use real API data with enhanced params
      const response = await aimlClient.post('/soil/analysis', {
        location,
        ...params,
        weatherData
      });
      
      return response.data;
    } catch (error) {
      // Use the common error handler
      handleApiError(error, 'Failed to get soil analysis');
    }
  },
  
  /**
   * Get soil analysis with additional data from SoilGrids
   * This method provides more comprehensive soil data by combining multiple sources
   */
  getEnhancedSoilAnalysis: async (location: { lat: number, lon: number }, params?: {
    cropType?: string,
    soilType?: string,
    fieldSize?: number,
    previousCrops?: string[]
  }) => {
    try {
      // Get basic soil analysis
      const basicAnalysis = await aimlService.getSoilAnalysis(location, params);
      
      // Get weather data for context
      const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
      
      // Use AgroMonitoring API for additional soil data if available
      let agroData = null;
      try {
        // This would be replaced with actual AgroMonitoring API call
        // Get real AgroMonitoring data
        const agroResponse = await axios.get('/api/external/agromonitoring/soil', {
          params: {
            lat: location.lat,
            lon: location.lon
          }
        });

        if (agroResponse.status === 200) {
          const agroResult = agroResponse.data;
          agroData = {
            moisture: agroResult.moisture,
            temperature: agroResult.temperature || agroResult.t10,
            soilType: params?.soilType || agroResult.soilType || agroResult.soil_type
          };
        }
      } catch (agroError) {
        // Continue without Agro Monitoring data
        console.warn('Failed to fetch Agro Monitoring data:', (agroError as Error).message);
      }
      
      // Combine all data sources
      return {
        ...basicAnalysis,
        weatherContext: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          rainfall: weatherData.forecast?.[0]?.precipitation || 0,
          forecast: weatherData.forecast?.slice(0, 5).map(day => ({
            date: day.date,
            rainfall: day.precipitation,
            temperature: (day.high + day.low) / 2
          }))
        },
        extendedSoilData: agroData ? {
          soilMoisture: agroData.moisture,
          soilTemperature: agroData.temperature,
          soilTypeDetails: {
            type: agroData.soilType,
            characteristics: getSoilCharacteristics(agroData.soilType)
          }
        } : undefined
      };
    } catch (error) {
      return handleApiError(error, 'Failed to get enhanced soil analysis');
    }
  },

  /**
   * Analyze pest image for detection and identification
   */
  analyzePestImage: async (imageData: string) => {
    const response = await aimlClient.post('/pest/analyze-image', {
      image: imageData
    });
    return response.data;
  },

  /**
   * Get pest control recommendations
   * This method provides pest detection and control recommendations
   */
  getPestControl: async (params: {
    cropType: string,
    location: { lat: number, lon: number },
    symptoms?: string[],
    imageUrl?: string,
    imageData?: string // Base64 encoded image data
  }) => {
    // Delegate to assessPestRisk method with the same parameters
    return await aimlService.assessPestRisk(params);
  },

  /**
   * Assess pest risk for crops with enhanced analysis using Plant.id and Cloudinary
   * Enhanced with real-time weather data and educational resources
   */
  assessPestRisk: async (params: {
    cropType: string,
    location: { lat: number, lon: number },
    symptoms?: string[],
    imageUrl?: string,
    imageData?: string // Base64 encoded image data
  }) => {
    // If we have image data, use Plant.id and Cloudinary for enhanced analysis
    const enhancedData: Record<string, unknown> = {};
    
    if (params.imageData) {
      try {
        // Use Plant.id to identify the plant and potential diseases
        const plantIdentification = await plantService.identifyPlant(
          params.imageData,
          ['crops_fast', 'disease_similar_images']
        );
        
        if (plantIdentification && plantIdentification.result?.classification?.suggestions) {
          // Extract plant identification results
          const suggestions = plantIdentification.result.classification.suggestions;
          
          // Find potential diseases
          const plantDisease = suggestions.find(s => 
            s.details?.description?.toLowerCase().includes('disease') ||
            s.name.toLowerCase().includes('disease'));
          
          if (plantDisease) {
            enhancedData.plantDisease = {
              name: plantDisease.name,
              confidence: plantDisease.probability,
              description: plantDisease.details?.description,
              scientificName: plantDisease.details?.scientific_name
            };
          }
          
          // Identify the crop if not specified
          if (!params.cropType && suggestions.length > 0) {
            enhancedData.identifiedCrop = {
              name: suggestions[0].name,
              scientificName: suggestions[0].details?.scientific_name,
              confidence: suggestions[0].probability
            };
          }
        }
        
        // Upload to Cloudinary for additional analysis if needed
        try {
          const uploadResponse = await imageService.uploadImage(params.imageData, {
            folder: 'pest-analysis',
            tags: ['pest-analysis', params.cropType],
            cropAnalysis: true
          });
          
          // Use the uploaded image URL for the backend API
          params.imageUrl = uploadResponse.secure_url;
          
          // Get additional analysis from Cloudinary
          const imageAnalysis = await imageService.analyzeCropImage(uploadResponse.secure_url);
          
          if (imageAnalysis.analysis?.crop_disease) {
            enhancedData.cloudinaryAnalysis = imageAnalysis.analysis.crop_disease;
          }
        } catch (cloudinaryError: unknown) {
          // Continue without Cloudinary data
          if (cloudinaryError instanceof Error) {
            console.warn('Failed to upload to Cloudinary:', cloudinaryError.message);
          } else {
            console.warn('Failed to upload to Cloudinary:', String(cloudinaryError));
          }
        }
      } catch (imageAnalysisError: unknown) {
        // Continue without enhanced data
        if (imageAnalysisError instanceof Error) {
          console.warn('Failed to analyze image:', imageAnalysisError.message);
        } else {
          console.warn('Failed to analyze image:', String(imageAnalysisError));
        }
      }
    }
    
    // Get weather data for additional context
    try {
      const weatherData = await weatherService.getCurrentWeather(
        params.location.lat,
        params.location.lon
      );
      
      enhancedData.weatherContext = {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        conditions: weatherData.condition
      };
    } catch (weatherError: unknown) {
      // Continue without weather data
      if (weatherError instanceof Error) {
        console.warn('Failed to fetch weather data:', weatherError.message);
      } else {
        console.warn('Failed to fetch weather data:', String(weatherError));
      }
    }
    
    // Use correct endpoint path with enhanced data
    const apiResponse = await aimlClient.post('/pest/assess-risk', {
      location: {
        lat: params.location.lat,
        lon: params.location.lon
      },
      cropType: params.cropType,
      symptoms: params.symptoms,
      imageUrl: params.imageUrl,
      enhancedData: enhancedData
    });
    
    // Find relevant educational videos about detected pests
    let educationalVideos: Array<{id: string; title: string; thumbnailUrl: string; embedUrl: string;}> = [];
    if (apiResponse.data.riskAssessment?.possibleThreats && apiResponse.data.riskAssessment.possibleThreats.length > 0) {
      try {
        const pestName = apiResponse.data.riskAssessment.possibleThreats[0].name || apiResponse.data.riskAssessment.possibleThreats[0];
        const videoResponse = await educationService.getPestControlVideos(pestName);
        
        if (videoResponse && videoResponse.items.length > 0) {
          educationalVideos = videoResponse.items.slice(0, 3).map(video => ({
            id: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnails.medium.url,
            embedUrl: educationService.getEmbedUrl(video.id)
          }));
        }
      } catch (videoError: unknown) {
        // Continue without videos
        if (videoError instanceof Error) {
          console.warn('Failed to fetch educational videos:', videoError.message);
        } else {
          console.warn('Failed to fetch educational videos:', String(videoError));
        }
      }
    }
    
    // Return enhanced response
    return {
      ...apiResponse.data,
      educationalVideos
    };
  },

  /**
   * Get irrigation recommendations based on weather and crop type
   * Enhanced with real-time weather forecasts and improved soil data
   */
  getIrrigationRecommendations: async (params: {
    location: { lat: number, lon: number },
    cropType: string,
    soilType?: string,
    fieldSize?: number,
    currentMoisture?: number,
    weatherData?: Partial<WeatherData>
  }) => {
    // Get real-time weather forecast if not provided
    let weatherData = params.weatherData;
    
    if (!weatherData) {
      try {
        const forecast = await weatherService.getForecast(params.location.lat, params.location.lon, 7);
        const currentWeather = await weatherService.getCurrentWeather(params.location.lat, params.location.lon);
        
        weatherData = {
          temperature: currentWeather.temperature,
          humidity: currentWeather.humidity,
          forecast: forecast.map(day => ({
            date: day.date,
            day: day.day || '',
            high: day.high,
            low: day.low,
            condition: day.condition,
            icon: day.icon,
            humidity: day.humidity,
            windSpeed: day.windSpeed,
            precipitation: day.precipitation,
            precipitationChance: day.precipitationChance
          }))
        };
      } catch (weatherError: unknown) {
        // Continue without weather data
        if (weatherError instanceof Error) {
          console.warn('Failed to fetch weather data:', weatherError.message);
        } else {
          console.warn('Failed to fetch weather data:', String(weatherError));
        }
      }
    }
    
    // Get soil characteristics based on soil type for better recommendations
    const soilCharacteristics = params.soilType 
      ? getSoilCharacteristics(params.soilType)
      : null;
    
    // Use correct endpoint path
    const apiResponse = await aimlClient.post('/irrigation/recommend', {
      location: {
        lat: params.location.lat,
        lon: params.location.lon
      },
      cropType: params.cropType,
      soilType: params.soilType,
      fieldSize: params.fieldSize,
      currentMoisture: params.currentMoisture,
      weatherData: weatherData,
      soilCharacteristics: soilCharacteristics
    });
    
    // Find relevant educational videos about irrigation techniques
    let educationalVideos: Array<{id: string; title: string; thumbnailUrl: string; embedUrl: string;}> = [];
    try {
      const videoResponse = await educationService.getIrrigationVideos(params.cropType);
      
      if (videoResponse && videoResponse.items.length > 0) {
        educationalVideos = videoResponse.items.slice(0, 3).map(video => ({
          id: video.id,
          title: video.title,
          thumbnailUrl: video.thumbnails.medium.url,
          embedUrl: educationService.getEmbedUrl(video.id)
        }));
      }
    } catch (videoError: unknown) {
      // Continue without videos
      if (videoError instanceof Error) {
        console.warn('Failed to fetch educational videos:', videoError.message);
      } else {
        console.warn('Failed to fetch educational videos:', String(videoError));
      }
    }
    
    // Return enhanced response
    return {
      ...apiResponse.data,
      educationalVideos
    };
  },

  /**
   * Get crop recommendations based on location and parameters
   * Enhanced with Trefle plant database and detailed climate matching
   */
  getCropRecommendations: async (params: {
    location: { lat: number, lon: number },
    soilType?: string,
    previousCrops?: string[],
    weatherData?: Partial<WeatherData>
  }) => {
    try {
      // Get current weather and forecast if not provided
      let weatherData = params.weatherData;
      
      if (!weatherData) {
        try {
          const currentWeather = await weatherService.getCurrentWeather(params.location.lat, params.location.lon);
          const forecast = await weatherService.getForecast(params.location.lat, params.location.lon, 10);
          
          weatherData = {
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            main: currentWeather.main,
            wind: currentWeather.wind,
            forecast: forecast
          };
        } catch (weatherError: unknown) {
          // Continue without weather data
          if (weatherError instanceof Error) {
            console.warn('Failed to fetch weather data:', weatherError.message);
          } else {
            console.warn('Failed to fetch weather data:', String(weatherError));
          }
        }
      }
      
      // Get soil characteristics based on soil type
      const soilCharacteristics = params.soilType 
        ? getSoilCharacteristics(params.soilType)
        : null;
      
      // Search Trefle database for plants suitable for the climate conditions
      let trefleRecommendations: Array<{name: string; scientificName: string; suitability: number; waterRequirement: string; growthPeriod: string; family: string; imageUrl: string; dataSource: string;}> = [];
      try {
        // Convert temperature from Celsius to Fahrenheit for Trefle API
        const tempF = weatherData?.temperature ? (weatherData.temperature * 9/5) + 32 : null;
        
        if (tempF !== null) {
          // Search plants by temperature range and other criteria
          const trefleCriteria = {
            temperature_minimum_deg_f: Math.max(tempF - 15, 0), // Min suitable temp
            temperature_maximum_deg_f: tempF + 15, // Max suitable temp
            // Other criteria could be added based on soil type and conditions
          };
          
          const trefleResponse = await plantService.getPlantsByCriteria(trefleCriteria);
          if (trefleResponse && trefleResponse.data && trefleResponse.data.length > 0) {
            // Map Trefle data to our recommendation format
            trefleRecommendations = trefleResponse.data.slice(0, 5).map(plant => ({
              name: plant.common_name || plant.scientific_name,
              scientificName: plant.scientific_name,
              suitability: 85, // Default high suitability since they match climate criteria
              waterRequirement: 'Medium', // Would need to map from Trefle data
              growthPeriod: 'Varies',
              family: plant.family,
              imageUrl: plant.image_url || '',
              dataSource: 'Trefle Plant Database'
            }));
          }
        }
      } catch (trefleError: unknown) {
        // Continue without Trefle data
        if (trefleError instanceof Error) {
          console.warn('Failed to fetch Trefle data:', trefleError.message);
        } else {
          console.warn('Failed to fetch Trefle data:', String(trefleError));
        }
      }
      
      // Check companion planting compatibility for previous crops
      let companionPlantingData = null;
      if (params.previousCrops && params.previousCrops.length > 0) {
        try {
          // Get companion planting recommendations for the most recent previous crop
          companionPlantingData = await plantService.getCompanionPlants(params.previousCrops[0]);
        } catch (companionError: unknown) {
          // Continue without companion planting data
          if (companionError instanceof Error) {
            console.warn('Failed to fetch companion planting data:', companionError.message);
          } else {
            console.warn('Failed to fetch companion planting data:', String(companionError));
          }
        }
      }
      
      // Get educational videos about sustainable crop rotation
      let educationalVideos: Array<{id: string; title: string; thumbnailUrl: string; embedUrl: string;}> = [];
      try {
        const videoResponse = await educationService.getTopicVideos('crop rotation benefits', 'beginner');
        
        if (videoResponse && videoResponse.items.length > 0) {
          educationalVideos = videoResponse.items.slice(0, 3).map(video => ({
            id: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnails.medium.url,
            embedUrl: educationService.getEmbedUrl(video.id)
          }));
        }
      } catch (videoError: unknown) {
        // Continue without videos
        if (videoError instanceof Error) {
          console.warn('Failed to fetch educational videos:', videoError.message);
        } else {
          console.warn('Failed to fetch educational videos:', String(videoError));
        }
      }
      
      // Enhanced parameters for the API call
      const enhancedParams = {
        ...params,
        weatherData,
        soilCharacteristics,
        trefleRecommendations: trefleRecommendations.length > 0 ? trefleRecommendations : undefined,
        companionPlanting: companionPlantingData
      };
      
      // Call the real API endpoint with enhanced data
      const apiResponse = await aimlClient.post('/crops/recommend', enhancedParams);
      
      // Combine API response with additional data sources
      const enhancedResponse = {
        ...apiResponse.data,
        // Add Trefle recommendations if they exist and aren't already included
        recommendations: [
          ...(apiResponse.data.recommendations || []),
          // Only add Trefle recommendations that don't overlap with API recommendations
          ...(trefleRecommendations.filter(tr => 
            !apiResponse.data.recommendations?.some((r: {name: string;}) => 
              r.name.toLowerCase() === tr.name.toLowerCase()
            )
          ))
        ],
        // Add companion planting data if available
        companionPlanting: companionPlantingData,
        // Add educational resources
        educationalResources: {
          videos: educationalVideos
        }
      };
      
      return enhancedResponse;
    } catch (error) {
      // Let calling component handle the error
      throw error;
    }
  },

  /**
   * Get educational content related to agriculture
   * Enhanced with YouTube educational videos and learning paths
   */
  getEducationalContent: async (params: {
    topic?: string,
    cropType?: string,
    skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  }) => {
    try {
      // Start with a parallel request to YouTube API for related content
      const youtubePromise = (async () => {
        try {
          let videos: Array<{id: string; title: string; description: string; duration: string; thumbnails: {medium: {url: string;};}; viewCount?: number; channelTitle: string; publishedAt: string;}> = [];
          let learningPath = null;
          
          // Get videos based on parameters
          if (params.topic) {
            const videoResponse = await educationService.getTopicVideos(
              params.topic, 
              params.skillLevel || 'beginner'
            );
            videos = videoResponse.items || [];
          } else if (params.cropType) {
            const videoResponse = await educationService.getCropVideos(params.cropType);
            videos = videoResponse.items || [];
          } else {
            // Default to sustainable farming videos
            const videoResponse = await educationService.searchVideos('sustainable farming practices', 8);
            videos = videoResponse.items || [];
          }
          
          // Create a learning path if a topic is specified
          if (params.topic) {
            learningPath = await educationService.createLearningPath(
              params.topic,
              params.skillLevel || 'beginner'
            );
          }
          
          return { videos, learningPath };
        } catch (_youtubeError: unknown) {
          return { videos: [], learningPath: null };
        }
      })();
      
      // In parallel, call our backend API for content
      const apiPromise = (async () => {
        try {
          const apiResponse = await aimlClient.get('/education/content', {
            params: params
          });
          return apiResponse.data;
        } catch (_apiError) {
          // If endpoint not available, provide minimal fallback data
          return {
            courses: [],
            totalCount: 0,
            recommendations: []
          };
        }
      })();
      
      // Wait for both promises to resolve
      const [youtubeContent, apiContent] = await Promise.all([youtubePromise, apiPromise]);
      
      // Process YouTube videos into our format
      const formattedVideos = youtubeContent.videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        thumbnailUrl: video.thumbnails.medium.url,
        embedUrl: educationService.getEmbedUrl(video.id),
        viewCount: video.viewCount,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        type: 'youtube'
      }));
      
      // Process learning path if available
      const formattedLearningPath = youtubeContent.learningPath ? (() => {
        const learningPath = youtubeContent.learningPath;
        return {
          id: learningPath.id,
          title: learningPath.title,
          description: learningPath.description,
          skillLevel: learningPath.skillLevel,
          topics: learningPath.topics,
          modules: learningPath.videos.map((video, index) => ({
            id: `${learningPath.id}-${index}`,
            title: video.title,
            description: video.description,
            order: index + 1,
            duration: video.duration,
            thumbnailUrl: video.thumbnails.medium.url,
            embedUrl: educationService.getEmbedUrl(video.id),
            type: 'youtube'
          }))
        };
      })() : null;
      
      // Combine data from both sources
      const combinedResponse = {
        // Courses from API
        courses: apiContent.courses || [],
        // Add YouTube videos as multimedia resources
        multimedia: formattedVideos,
        // Add learning path if available
        learningPaths: formattedLearningPath ? [formattedLearningPath] : [],
        // Keep API recommendations
        recommendations: apiContent.recommendations || [],
        // Total count
        totalCount: (apiContent.courses?.length || 0) + formattedVideos.length,
        // Add seasonal content based on current month
        seasonal: {
          title: `${getCurrentSeason()} Farming Tips`,
          resources: formattedVideos.slice(0, 2) // Just use first 2 videos as examples
        }
      };
      
      return combinedResponse;
    } catch (error) {
      // Let calling component handle the error
      throw error;
    }
  }
};

