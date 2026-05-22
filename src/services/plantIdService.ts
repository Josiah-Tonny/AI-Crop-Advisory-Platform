import axios, { AxiosInstance } from 'axios';

// Define types for Plant.id API
interface PlantIdResponse {
  id: string;
  custom_id: string | null;
  images: PlantIdImage[];
  suggestions: PlantIdSuggestion[];
  modifiers: string[];
  secret: string;
  fail_cause: string | null;
  countable: boolean;
  feedback: string | null;
  is_plant: boolean | null;
  is_plant_probability: number | null;
}

interface PlantIdImage {
  file_name: string;
  url: string;
  url_small: string;
}

interface PlantIdSuggestion {
  id: number;
  name: string;
  probability: number;
  similar_images: PlantIdSimilarImage[];
  details?: PlantIdDetails;
}

interface PlantIdSimilarImage {
  id: string;
  url: string;
  similarity: number;
  url_small: string;
  license_name: string;
  license_url: string;
}

interface PlantIdDetails {
  common_names?: string[];
  taxonomy?: {
    class: string;
    family: string;
    genus: string;
    kingdom: string;
    order: string;
    phylum: string;
  };
  url?: string;
  description?: {
    value: string;
    citation: string;
    license_name: string;
    license_url: string;
  };
  wiki_description?: {
    value: string;
    citation: string;
    license_name: string;
    license_url: string;
  };
  edible_parts?: {
    part: string;
    confidence: number;
  }[];
  watering?: {
    min: number;
    max: number;
  };
  images?: {
    id: string;
    url: string;
    license_name: string;
    license_url: string;
  }[];
}

interface PlantIdRequestData {
  images: string[];  // base64 encoded images
  similar_images?: boolean;
  plant_details?: string[];
  modifiers?: string[];
  disease_details?: string[];
}

interface DiseaseDetectionResult {
  disease: string;
  probability: number;
  scientificName?: string;
  description?: string;
  treatment?: string[];
}

interface PlantIdentificationResult {
  plantName: string;
  scientificName: string;
  probability: number;
  details?: PlantIdDetails;
  imageUrl?: string;
}

class PlantIdService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/external',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Identifies a plant from base64 encoded image data
   */
  async identifyPlant(imageBase64: string[]): Promise<PlantIdentificationResult[]> {
    try {
      const requestData: PlantIdRequestData = {
        images: imageBase64,
        similar_images: true,
        plant_details: ["common_names", "taxonomy", "url", "description", "wiki_description", "watering", "images"]
      };

      const response = await this.client.post<PlantIdResponse>('/plant-id/identify', requestData);

      return response.data.suggestions.map(suggestion => ({
        plantName: suggestion.name,
        scientificName: suggestion.name, // Plant.id often returns scientific names directly
        probability: suggestion.probability,
        details: suggestion.details,
        imageUrl: suggestion.similar_images[0]?.url_small
      }));
    } catch {
      // Error handling for plant identification
      throw new Error('Failed to identify plant');
    }
  }

  /**
   * Detects diseases in plants from base64 encoded image data
   */
  async detectDisease(imageBase64: string[]): Promise<DiseaseDetectionResult[]> {
    try {
      const requestData: PlantIdRequestData = {
        images: imageBase64,
        disease_details: ["description", "treatment", "classification", "common_names"],
        modifiers: ["disease_similar_images"]
      };

      const response = await this.client.post<PlantIdResponse>('/plant-id/health-assessment', requestData);

      return response.data.suggestions.map(suggestion => ({
        disease: suggestion.name,
        probability: suggestion.probability,
        scientificName: suggestion.name,
        description: suggestion.details?.description?.value,
        treatment: suggestion.details?.description?.value 
          ? [suggestion.details.description.value.split('.').slice(0, 2).join('.') + '.'] // Basic treatment extraction
          : []
      }));
    } catch {
      // Error handling for disease detection
      throw new Error('Failed to detect plant disease');
    }
  }

  /**
   * Converts a file object to base64 encoding
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Create and export instance
const plantIdService = new PlantIdService();
export default plantIdService;
