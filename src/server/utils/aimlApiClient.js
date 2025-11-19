import axios from 'axios';

// Get API key from environment variable
const AIML_API_KEY = process.env.AIMLAPI_AI_API_KEY;

if (!AIML_API_KEY) {
  // ⚠️  AIMLAPI_AI_API_KEY not found in environment variables (silent logging)
  // console.warn('⚠️  AIMLAPI_AI_API_KEY not found in environment variables');
}

// Create axios instance for AI API service
const aimlClient = axios.create({
  baseURL: 'https://api.aimlapi.com', // AIML API base URL
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AIML_API_KEY}`
  },
  timeout: 30000 // 30 seconds
});

/**
 * Detect pests based on crop type, location, and symptoms
 */
export async function detectPests(params) {
  try {
    // Validate API key is present
    if (!AIML_API_KEY) {
      throw new Error('AIML API key not configured');
    }

    const response = await aimlClient.post('/v1/pest-detection', params);
    return response.data;
  } catch (error) {
    // AIML API Error (detectPests) (silent logging)
    // console.error('AIML API Error (detectPests):', error.message);
    throw error;
  }
}

/**
 * Analyze pest images
 */
export async function analyzePestImage(imageData) {
  try {
    // Validate API key is present
    if (!AIML_API_KEY) {
      throw new Error('AIML API key not configured');
    }

    const response = await aimlClient.post('/v1/image-analysis/pests', {
      image: imageData
    });
    return response.data;
  } catch (error) {
    // AIML API Error (analyzePestImage) (silent logging)
    // console.error('AIML API Error (analyzePestImage):', error.message);
    throw error;
  }
}

/**
 * Assess pest risk based on location and crop type
 */
export async function assessPestRisk(params) {
  try {
    // Validate API key is present
    if (!AIML_API_KEY) {
      throw new Error('AIML API key not configured');
    }

    const response = await aimlClient.post('/v1/pest-risk-assessment', params);
    return response.data;
  } catch (error) {
    // AIML API Error (assessPestRisk) (silent logging)
    // console.error('AIML API Error (assessPestRisk):', error.message);
    throw error;
  }
}

export default {
  detectPests,
  analyzePestImage,
  assessPestRisk
};