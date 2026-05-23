import axios from 'axios';

const externalClient = axios.create({
  baseURL: '/api/external',
  headers: {
    'Content-Type': 'application/json'
  }
});

const handleApiError = (error: unknown, message: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${message}: ${error.response.data?.message || error.message}`);
    }
    if (error.request) {
      throw new Error(`${message}: Unable to reach backend proxy. Please check your connection.`);
    }
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${message}: ${errorMessage}`);
};

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
  folder?: string;
  context?: Record<string, unknown>;
}

export interface ImageAnalysisResult {
  id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  tags: string[];
  analysis?: {
    colors?: {
      prominent: string[];
      foreground: string[];
      background: string[];
    };
    tags?: Array<{
      name: string;
      confidence: number;
    }>;
    crop_disease?: Array<{
      name: string;
      confidence: number;
      treatment?: string[];
      affectedArea?: number;
      description?: string;
    }>;
    plantHealth?: {
      overallScore: number;
      leafColor: number;
      growth: number;
      pestDamage: number;
    };
  };
  metadata?: Record<string, unknown>;
  enhancedImageUrl?: string;
}

export interface ImageTimelineEntry {
  id: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  location?: {
    lat?: number;
    lon?: number;
    name?: string;
  };
  tags?: string[];
  metadata?: Record<string, unknown>;
  measurements?: {
    height?: number;
    width?: number;
    healthScore?: number;
    growthRate?: number;
  };
}

export interface GrowthComparisonResult {
  comparisonUrl: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeDate: string;
  afterDate: string;
  growthMetrics: {
    heightChange: number;
    widthChange: number;
    colorIntensity: number;
    estimatedGrowthRate: number;
    healthChangeScore: number;
  };
  analysis: string;
}

export const imageService = {
  fileToBase64: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  },

  uploadImage: async (
    file: string,
    options: {
      folder?: string;
      tags?: string[];
      context?: Record<string, unknown>;
      cropAnalysis?: boolean;
    } = {}
  ): Promise<CloudinaryUploadResponse> => {
    try {
      const response = await externalClient.post('/cloudinary/upload', {
        file,
        options
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to upload image to Cloudinary');
    }
  },

  analyzeCropImage: async (imageUrl: string): Promise<ImageAnalysisResult> => {
    try {
      const response = await externalClient.post('/cloudinary/analyze', {
        imageUrl
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to analyze crop image');
    }
  },

  getFieldImageTimeline: async (fieldId?: string, cropId?: string): Promise<ImageTimelineEntry[]> => {
    try {
      const response = await externalClient.get('/cloudinary/timeline', {
        params: {
          fieldId,
          cropId
        }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch crop image timeline');
    }
  },

  compareGrowth: async (beforeImageId: string, afterImageId: string): Promise<GrowthComparisonResult> => {
    try {
      const response = await externalClient.post('/cloudinary/compare', {
        beforeImageId,
        afterImageId
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to compare crop growth images');
    }
  },

  createThumbnail: (publicId: string, width: number = 150, height: number = 150): string => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dl5rwjjol';
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
  },

  enhanceForDiseaseDetection: (publicId: string): string => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dl5rwjjol';
    return `https://res.cloudinary.com/${cloudName}/image/upload/e_contrast:50,e_saturation:30,e_sharpen:100/${publicId}`;
  }
};

export default imageService;
