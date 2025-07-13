import axios from 'axios';

// Types
type DiseasePrediction = {
  disease: string;
  confidence: number;
  treatment: string;
  prevention: string[];
};

type CropRecommendation = {
  crop: string;
  variety: string;
  plantingDate: string;
  expectedYield: string;
  confidence: number;
  reasons: string[];
};

// AI Service Configuration
const AI_CONFIG = {
  plantVillage: {
    baseUrl: 'https://plantvillage.herokuapp.com/api/v1',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },
  googleCloud: {
    projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
    location: 'us-central1',
    modelId: 'text-bison@001',
  },
};

// Cache for API responses
const cache = new Map<string, any>();

/**
 * Detect plant diseases from an image
 */
export const detectPlantDisease = async (imageFile: File): Promise<DiseasePrediction> => {
  try {
    const cacheKey = `disease_${imageFile.name}_${imageFile.size}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await axios.post(
      `${AI_CONFIG.plantVillage.baseUrl}/predict`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Transform response to our format
    const result: DiseasePrediction = {
      disease: response.data.disease_name,
      confidence: parseFloat(response.data.confidence),
      treatment: response.data.treatment || 'No specific treatment available',
      prevention: response.data.prevention || [
        'Maintain proper plant spacing',
        'Ensure good air circulation',
        'Water at the base of plants',
        'Remove and destroy infected plants',
      ],
    };

    // Cache the result
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error detecting plant disease:', error);
    throw new Error('Failed to detect plant disease. Please try again.');
  }
};

/**
 * Get AI-powered crop recommendations
 */
export const getCropRecommendations = async ({
  location,
  soilType,
  weatherData,
  previousCrops = [],
}: {
  location: string;
  soilType: string;
  weatherData: any;
  previousCrops?: string[];
}): Promise<CropRecommendation[]> => {
  try {
    const cacheKey = `recommendations_${location}_${soilType}_${JSON.stringify(weatherData)}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Use OpenAI for recommendations
    const prompt = `Based on the following conditions, provide 3 crop recommendations:
    - Location: ${location}
    - Soil Type: ${soilType}
    - Temperature: ${weatherData.temp}°C
    - Humidity: ${weatherData.humidity}%
    - Previous Crops: ${previousCrops.join(', ') || 'None'}
    
    For each recommendation, include:
    1. Crop name and variety
    2. Best planting date
    3. Expected yield
    4. Confidence score (0-1)
    5. 3 key reasons for recommendation
    
    Format as JSON array.`;

    const response = await axios.post(
      `${AI_CONFIG.openai.baseUrl}/chat/completions`,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural advisor. Provide detailed crop recommendations based on the given conditions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
      }
    );

    // Parse the response
    const content = response.data.choices[0].message.content;
    const recommendations = JSON.parse(content) as CropRecommendation[];

    // Cache the result
    cache.set(cacheKey, recommendations);
    return recommendations;
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    
    // Fallback to static recommendations if API fails
    return getFallbackRecommendations(location, soilType);
  }
};

// Fallback recommendations when AI service is unavailable
const getFallbackRecommendations = (location: string, soilType: string): CropRecommendation[] => {
  // Basic fallback logic based on soil type
  const recommendations: Record<string, CropRecommendation[]> = {
    loam: [
      {
        crop: 'Maize',
        variety: 'DH04',
        plantingDate: 'March-April',
        expectedYield: '5-7 tons/acre',
        confidence: 0.85,
        reasons: [
          'Well-drained soil is ideal',
          'Good water retention',
          'Suitable for most Kenyan climates',
        ],
      },
      // Add more fallback recommendations
    ],
    clay: [
      {
        crop: 'Rice',
        variety: 'Nerica',
        plantingDate: 'April-May',
        expectedYield: '3-4 tons/acre',
        confidence: 0.78,
        reasons: [
          'Thrives in water-retentive soil',
          'Good for lowland areas',
          'High market demand',
        ],
      },
      // Add more fallback recommendations
    ],
    // Add more soil types
  };

  return recommendations[soilType.toLowerCase()] || [];
};

/**
 * Get personalized farming advice
 */
export const getFarmingAdvice = async (query: string): Promise<string> => {
  try {
    const response = await axios.post(
      `${AI_CONFIG.openai.baseUrl}/chat/completions`,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural advisor providing concise, practical farming advice. Keep responses under 200 words.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting farming advice:', error);
    return 'I apologize, but I am unable to provide farming advice at the moment. Please try again later.';
  }
};

export default {
  detectPlantDisease,
  getCropRecommendations,
  getFarmingAdvice,
};
