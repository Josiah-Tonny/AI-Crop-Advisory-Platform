import axios from 'axios';

// The frontend should never persist API keys. These endpoints are proxied through the backend.

// Create API clients
const trefleClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Use backend proxy instead of Trefle directly
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const plantIdClient = axios.create({
  baseURL: '/api/external',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define interfaces for response types
export interface Plant {
  id: number;
  common_name: string;
  scientific_name: string;
  family: string;
  image_url?: string;
  year?: number;
  bibliography?: string;
  author?: string;
  rank?: string;
  genus?: string;
  family_common_name?: string;
}

export interface PlantResponse {
  data: Plant[];
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
  meta: {
    total: number;
  };
}

export interface PlantIdentificationResult {
  id: string;
  customId?: string;
  meta: {
    date: string;
    datetime: string;
    latitude?: number;
    longitude?: number;
  };
  input: {
    images: string[];
  };
  result: {
    classification: {
      suggestions: Array<{
        id: string;
        name: string;
        probability: number;
        similar_images: string[];
        details: {
          common_names?: string[];
          url?: string;
          description?: string;
          taxonomy: {
            class: string;
            family: string;
            genus: string;
            kingdom: string;
            order: string;
            phylum: string;
          };
          language?: string;
          rank?: string;
          scientific_name: string;
        };
      }>;
    };
  };
}

// Handle API errors consistently
const handleApiError = (error: unknown, message: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${message}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      throw new Error(`Network error: Unable to reach Plant API. Please check your connection.`);
    }
  }
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${message}: ${errorMessage}`);
};

// Plant service methods
export const plantService = {
  /**
   * Search for plants in the Trefle database
   */
  searchPlants: async (query: string, page: number = 1, perPage: number = 20): Promise<PlantResponse> => {
    try {
      const response = await trefleClient.get(`/plants/search`, {
        params: {
          q: query,
          page,
          per_page: perPage
        }
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to search for plants with query: ${query}`);
    }
  },

  /**
   * Get plant details by ID
   */
  getPlantById: async (id: number): Promise<Plant> => {
    try {
      const response = await trefleClient.get(`/plants/${id}`);
      
      return response.data.data;
    } catch (error) {
      return handleApiError(error, `Failed to get plant details for ID: ${id}`);
    }
  },

  /**
   * Get plants suitable for specific growth conditions
   */
  getPlantsByCriteria: async (params: {
    temperature_minimum_deg_f?: number;
    temperature_maximum_deg_f?: number;
    precipitation_minimum_inches?: number;
    precipitation_maximum_inches?: number;
    light?: number;
    soil_nutriments?: number;
    soil_humidity?: number;
    page?: number;
    per_page?: number;
  }): Promise<PlantResponse> => {
    try {
      // Use our backend proxy endpoint to avoid CORS issues
      const response = await trefleClient.get(`/crops/trefle/plants`, {
        params: {
          ...params
        }
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to get plants by criteria`);
    }
  },

  /**
   * Get plants by scientific family
   */
  getPlantsByFamily: async (family: string, page: number = 1, perPage: number = 20): Promise<PlantResponse> => {
    try {
      const response = await trefleClient.get(`/plants`, {
        params: {
          filter: {
            family_name: family
          },
          page,
          per_page: perPage
        }
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to get plants by family: ${family}`);
    }
  },

  /**
   * Identify a plant from an image using Plant.id API
   */
  identifyPlant: async (imageBase64: string, modifiers?: string[]): Promise<PlantIdentificationResult> => {
    try {
      // Ensure imageBase64 doesn't include the data:image prefix
      const base64Data = imageBase64.includes('base64,') 
        ? imageBase64.split('base64,')[1] 
        : imageBase64;

      const requestData = {
        images: [base64Data],
        modifiers: modifiers || ['crops_fast', 'similar_images'],
        plant_language: 'en',
        plant_details: [
          'common_names',
          'url',
          'description',
          'taxonomy',
          'rank',
          'scientific_name'
        ]
      };

      const response = await plantIdClient.post('/identification', requestData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to identify plant from image');
    }
  },
  
  /**
   * Get companion planting recommendations for a specific crop
   */
  getCompanionPlants: async (cropName: string): Promise<{
    goodCompanions: string[];
    badCompanions: string[];
    reasons: { [companion: string]: string };
  }> => {
    // This is a placeholder for a potential future API
    // Currently uses a static mapping of common companion planting knowledge
    const companionPlantingData: Record<string, { 
      goodCompanions: string[]; 
      badCompanions: string[]; 
      reasons: { [companion: string]: string };
    }> = {
      'tomato': {
        goodCompanions: ['basil', 'marigold', 'nasturtium', 'asparagus', 'carrot', 'onion', 'parsley'],
        badCompanions: ['potato', 'corn', 'fennel', 'brassicas'],
        reasons: {
          'basil': 'Repels tomato hornworm, improves growth and flavor',
          'marigold': 'Repels nematodes and other pests',
          'nasturtium': 'Acts as trap crop for aphids',
          'potato': 'Both are susceptible to late blight disease',
          'corn': 'Both attract the same pest (corn earworm/tomato fruitworm)'
        }
      },
      'corn': {
        goodCompanions: ['beans', 'peas', 'pumpkin', 'cucumber', 'squash'],
        badCompanions: ['tomato'],
        reasons: {
          'beans': 'Fix nitrogen in soil that corn needs',
          'pumpkin': 'Provides ground cover and reduces weeds',
          'tomato': 'Compete for nutrients and share pests'
        }
      },
      'beans': {
        goodCompanions: ['corn', 'potatoes', 'cucumber', 'strawberry', 'celery', 'carrots'],
        badCompanions: ['onion', 'garlic', 'shallot', 'leek'],
        reasons: {
          'corn': 'Corn provides support for beans to climb',
          'onion': 'Onions inhibit growth of beans'
        }
      },
      'carrot': {
        goodCompanions: ['tomato', 'peas', 'lettuce', 'rosemary', 'sage', 'chives'],
        badCompanions: ['dill', 'parsnip', 'beetroot'],
        reasons: {
          'tomato': 'Tomatoes provide shade for carrots',
          'rosemary': 'Repels carrot fly',
          'dill': 'Can cross-pollinate and stunt growth'
        }
      }
    };
    
    // Normalize crop name for lookup
    const normalizedCrop = cropName.toLowerCase().trim();
    
    if (normalizedCrop in companionPlantingData) {
      return companionPlantingData[normalizedCrop];
    }
    
    // Return empty result if crop not found
    return {
      goodCompanions: [],
      badCompanions: [],
      reasons: {}
    };
  }
};

export default plantService;
