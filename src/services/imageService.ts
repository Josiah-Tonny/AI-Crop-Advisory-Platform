import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import browserEnv from '../utils/browserEnv';

// Initialize Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: browserEnv.getEnv('VITE_CLOUDINARY_CLOUD_NAME', 'dl5rwjjol'),
  api_key: browserEnv.getEnv('VITE_CLOUDINARY_API_KEY', '739594788726412'),
  api_secret: browserEnv.getEnv('VITE_CLOUDINARY_API_SECRET', 'nxznHMRstCTrksqgZFhrR0d6Rjc'),
  secure: true
});

// Define interfaces for response types
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
      affectedArea?: number; // percentage of image affected
      description?: string;
    }>;
    plantHealth?: {
      overallScore: number; // 0-100
      leafColor: number;    // 0-100
      growth: number;       // 0-100
      pestDamage: number;   // 0-100
    };
  };
  metadata?: Record<string, unknown>;
  enhancedImageUrl?: string; // URL to enhanced version for analysis
}

export interface ImageTimelineEntry {
  id: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string; // New: small version for timeline display
  location?: {
    lat?: number;
    lon?: number;
    name?: string;
  };
  tags?: string[];
  metadata?: Record<string, unknown>;
  measurements?: {    // New: store growth measurements
    height?: number;  // in cm
    width?: number;   // in cm
    healthScore?: number; // 0-100
    growthRate?: number;  // percentage since last image
  };
}

export interface GrowthComparisonResult {
  comparisonUrl: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeDate: string;
  afterDate: string;
  growthMetrics: {
    heightChange: number;  // percentage
    widthChange: number;   // percentage
    colorIntensity: number; // 0-100
    estimatedGrowthRate: number; // units per day
    healthChangeScore: number; // -100 to 100, negative means decline
  };
  analysis: string; // AI-generated analysis text
}

// Handle API errors consistently
const handleApiError = (error: unknown, message: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${message}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      throw new Error(`Network error: Unable to reach Cloudinary API. Please check your connection.`);
    }
  }
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${message}: ${errorMessage}`);
};

// Cloudinary service for image management and analysis
export const imageService = {
  /**
   * Upload an image to Cloudinary
   * @param file Base64 string or File object
   * @param options Upload options (folder, tags, etc.)
   * @returns Upload response
   */
  uploadImage: async (
    file: string | File, 
    options: { 
      folder?: string; 
      tags?: string[]; 
      context?: Record<string, unknown>;
      cropAnalysis?: boolean;
    } = {}
  ): Promise<CloudinaryUploadResponse> => {
    try {
      // Prepare upload options
      const uploadOptions: Record<string, unknown> = {
        folder: options.folder || 'agri-advisor',
        tags: options.tags || [],
        context: options.context || {}
      };
      
      // Add auto tagging if crop analysis is requested
      if (options.cropAnalysis) {
        uploadOptions.categorization = 'google_tagging';
        uploadOptions.auto_tagging = 0.6; // Confidence threshold
      }
      
      let result;
      if (typeof file === 'string') {
        // Handle base64 string upload
        result = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
          cloudinary.uploader.upload(
            file,
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResponse);
            }
          );
        });
      } else {
        // Handle File object upload
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(uploadOptions).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value as string);
          }
        });
        
        // Use the upload API endpoint directly
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/upload`;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
          { 
            timestamp, 
            ...uploadOptions 
          },
          cloudinary.config().api_secret as string
        );
        
        formData.append('api_key', cloudinary.config().api_key as string);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        
        const response = await axios.post(uploadUrl, formData);
        result = response.data;
      }
      
      return result;
    } catch (error) {
      return handleApiError(error, 'Failed to upload image to Cloudinary');
    }
  },
  
  /**
   * Convert a File to base64 string
   */
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
      reader.onerror = error => reject(error);
    });
  },
  
  /**
   * Create a thumbnail from an existing image
   */
  createThumbnail: (publicId: string, width: number = 150, height: number = 150): string => {
    const cloudName = browserEnv.getEnv('VITE_CLOUDINARY_CLOUD_NAME', 'dl5rwjjol');
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
  },
  
  /**
   * Apply visual filters to enhance disease detection
   */
  enhanceForDiseaseDetection: (publicId: string): string => {
    const cloudName = browserEnv.getEnv('VITE_CLOUDINARY_CLOUD_NAME', 'dl5rwjjol');
    // Apply enhanced contrast and saturation for better disease visibility
    return `https://res.cloudinary.com/${cloudName}/image/upload/e_contrast:50,e_saturation:30,e_sharpen:100/${publicId}`;
  },
  
  /**
   * Analyze an image for crop diseases and pests
   * @param imageUrl URL of the image to analyze (must be a Cloudinary URL)
   * @returns Analysis result
   */
  analyzeCropImage: async (imageUrl: string): Promise<ImageAnalysisResult> => {
    try {
      // Check if it's a Cloudinary URL
      if (!imageUrl.includes('cloudinary')) {
        throw new Error('The image must be hosted on Cloudinary for analysis');
      }
      
      // Extract public ID from Cloudinary URL
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.+?)(?:\.\w+)?$/);
      if (!publicIdMatch) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      const publicId = publicIdMatch[1];
      
      // Get image info with tags
      const imageInfo = await new Promise<Record<string, unknown>>((resolve, reject) => {
        cloudinary.api.resource(
          publicId, 
          { 
            colors: true,
            image_metadata: true,
            tags: true
          },
          (error: unknown, result: unknown) => {
            if (error) reject(error);
            else resolve(result as Record<string, unknown>);
          }
        );
      });
      
      // Create enhanced version for analysis
      const enhancedImageUrl = imageService.enhanceForDiseaseDetection(publicId);
      
      // Build an analysis from cloudinary resource info
      const analysisResult: ImageAnalysisResult = {
        id: imageInfo.public_id as string,
        url: imageInfo.url as string,
        secure_url: imageInfo.secure_url as string,
        width: imageInfo.width as number,
        height: imageInfo.height as number,
        format: imageInfo.format as string,
        created_at: imageInfo.created_at as string,
        tags: (imageInfo.tags as string[]) || [],
        enhancedImageUrl,
        analysis: {
          colors: {
            prominent: (imageInfo.colors as string[]) || [],
            foreground: [],
            background: []
          },
          tags: (imageInfo.tags as string[])?.map((tag: string) => ({
            name: tag,
            confidence: 0.8 // Default confidence value
          })) || [],
          plantHealth: {
            overallScore: 75, // Default good health
            leafColor: 80,
            growth: 85,
            pestDamage: 10
          }
        },
        metadata: imageInfo.image_metadata as Record<string, unknown> || {}
      };
      
      // Use Cloudinary's AI-based analysis if available
      if ((imageInfo.auto_tagging as Array<unknown> | undefined) && Array.isArray(imageInfo.auto_tagging) && (imageInfo.auto_tagging as Array<unknown>).length > 0) {
        // Extract disease information from auto-tagging
        const diseaseTags = (imageInfo.auto_tagging as Array<{ tag: string; confidence: number }> | undefined)?.filter(tag => 
          tag.tag.includes('disease') || tag.tag.includes('pest') || tag.tag.includes('damage')
        ) || [];
        
        if (diseaseTags.length > 0) {
          analysisResult.analysis!.crop_disease = diseaseTags.map((tag) => ({
            name: tag.tag,
            confidence: tag.confidence,
            affectedArea: Math.round(tag.confidence * 100),
            description: `Detected ${tag.tag} with ${Math.round(tag.confidence * 100)}% confidence`,
            treatment: [
              'Consult agricultural expert for proper diagnosis',
              'Consider using Plant.id service for detailed analysis',
              'Monitor affected areas closely'
            ]
          }));
          
          // Adjust health metrics based on detected issues
          const avgConfidence = diseaseTags.reduce((sum: number, tag) => sum + tag.confidence, 0) / diseaseTags.length;
          analysisResult.analysis!.plantHealth!.overallScore = Math.max(10, 100 - Math.round(avgConfidence * 50));
          analysisResult.analysis!.plantHealth!.pestDamage = Math.round(avgConfidence * 100);
        }
      }
      
      return analysisResult;
    } catch (error) {
      return handleApiError(error, 'Failed to analyze crop image');
    }
  },
  
  /**
   * Store an image with location data for farm record-keeping
   */
  storeFieldImage: async (
    imageData: string | File, 
    metadata: {
      cropType?: string;
      fieldName?: string;
      location?: { lat: number; lon: number; name?: string };
      notes?: string;
      date?: string;
      tags?: string[];
      measurements?: {
        height?: number;
        width?: number;
        healthScore?: number;
      };
    }
  ): Promise<CloudinaryUploadResponse> => {
    try {
      const tags = [
        'field-image',
        ...(metadata.cropType ? [`crop-${metadata.cropType.toLowerCase()}`] : []),
        ...(metadata.tags || [])
      ];
      
      const context = {
        field_name: metadata.fieldName || 'Unnamed Field',
        notes: metadata.notes || '',
        date: metadata.date || new Date().toISOString(),
        ...(metadata.location ? {
          lat: metadata.location.lat.toString(),
          lon: metadata.location.lon.toString(),
          location_name: metadata.location.name || ''
        } : {}),
        ...(metadata.measurements ? {
          height: metadata.measurements.height?.toString(),
          width: metadata.measurements.width?.toString(),
          health_score: metadata.measurements.healthScore?.toString()
        } : {})
      };
      
      return await imageService.uploadImage(imageData, {
        folder: 'farm-records',
        tags,
        context,
        cropAnalysis: true
      });
    } catch (error) {
      return handleApiError(error, 'Failed to store field image');
    }
  },
  
  /**
   * Get a timeline of field images for growth tracking
   */
  getFieldImageTimeline: async (fieldName?: string, cropType?: string): Promise<ImageTimelineEntry[]> => {
    try {
      const searchOptions: Record<string, string | string[] | number> = {
        type: 'upload',
        prefix: 'farm-records',
        tags: ['field-image'],
        max_results: 100
      };
      
      if (cropType) {
        searchOptions.tags = [...(searchOptions.tags as string[]), `crop-${cropType.toLowerCase()}`];
      }
      
      const result = await cloudinary.search
        .expression((searchOptions.tags as string[]).map((tag: string) => `tags:${tag}`).join(' AND '))
        .with_field('context')
        .with_field('tags')
        .max_results(100)
        .execute();
      
      // Filter by field name if specified
      const resources = (result && result.resources) ? (result.resources as Record<string, unknown>[]) : [];
      let filteredResources = resources;
      
      if (fieldName) {
        filteredResources = resources.filter((resource) => 
          (resource.context as Record<string, unknown>)?.custom &&
          ((resource.context as Record<string, unknown>).custom as Record<string, unknown>)?.field_name === fieldName);
      }
      
      // Map to timeline entries and sort by date
      const timeline: ImageTimelineEntry[] = filteredResources.map((resource) => {
        const context = resource.context as Record<string, unknown>;
        const custom = context?.custom as Record<string, unknown>;
        
        return {
          id: resource.public_id as string,
          date: (custom?.date as string) || (resource.created_at as string),
          imageUrl: resource.secure_url as string,
          thumbnailUrl: imageService.createThumbnail(resource.public_id as string),
          location: custom?.lat ? {
            lat: parseFloat(custom.lat as string),
            lon: parseFloat(custom.lon as string),
            name: custom.location_name as string
          } : undefined,
          tags: (resource.tags as string[]) || [],
          metadata: {
            fieldName: custom?.field_name as string,
            notes: custom?.notes as string,
            plantType: custom?.crop_type as string
          },
          measurements: {
            height: custom?.height ? parseFloat(custom.height as string) : undefined,
            width: custom?.width ? parseFloat(custom.width as string) : undefined,
            healthScore: custom?.health_score ? parseFloat(custom.health_score as string) : undefined
          }
        };
      });
      
      // Sort by date (newest first) and calculate growth rates
      const sortedTimeline = timeline.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calculate growth rates where possible
      for (let i = 0; i < sortedTimeline.length - 1; i++) {
        const current = sortedTimeline[i];
        const next = sortedTimeline[i + 1];
        
        if (current.measurements?.height && next.measurements?.height) {
          const heightGrowth = ((current.measurements.height - next.measurements.height) / 
            next.measurements.height) * 100;
            
          current.measurements.growthRate = Math.round(heightGrowth * 10) / 10; // Round to 1 decimal
        }
      }
      
      return sortedTimeline;
    } catch (error) {
      return handleApiError(error, 'Failed to get field image timeline');
    }
  },
  
  /**
   * Generate a before/after comparison of two field images for growth tracking
   */
  compareGrowth: async (beforeImageId: string, afterImageId: string): Promise<GrowthComparisonResult> => {
    try {
      // First, get details of both images
      const [beforeInfo, afterInfo] = await Promise.all([
        new Promise<Record<string, unknown>>((resolve, reject) => {
          cloudinary.api.resource(
            beforeImageId,
            { context: true, image_metadata: true },
            (error: unknown, result: unknown) => {
              if (error) reject(error);
              else resolve(result as Record<string, unknown>);
            }
          );
        }),
        new Promise<Record<string, unknown>>((resolve, reject) => {
          cloudinary.api.resource(
            afterImageId,
            { context: true, image_metadata: true },
            (error: unknown, result: unknown) => {
              if (error) reject(error);
              else resolve(result as Record<string, unknown>);
            }
          );
        })
      ]);
      
      // Create a side-by-side comparison URL
      const cloudName = browserEnv.getEnv('VITE_CLOUDINARY_CLOUD_NAME', 'dl5rwjjol');
      const comparisonUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,h_400,w_400/${afterImageId}/fl_layer_apply,g_east,h_400,w_400,x_400/c_fill,h_400,w_400/${beforeImageId}`;
      
      // Extract measurements from context if available
      const beforeContext = beforeInfo.context as Record<string, unknown>;
      const beforeCustom = beforeContext?.custom as Record<string, unknown>;
      
      const afterContext = afterInfo.context as Record<string, unknown>;
      const afterCustom = afterContext?.custom as Record<string, unknown>;
      
      const beforeHeight = beforeCustom?.height ? 
        parseFloat(beforeCustom.height as string) : 0;
      const afterHeight = afterCustom?.height ? 
        parseFloat(afterCustom.height as string) : 0;
        
      const beforeWidth = beforeCustom?.width ? 
        parseFloat(beforeCustom.width as string) : 0;
      const afterWidth = afterCustom?.width ? 
        parseFloat(afterCustom.width as string) : 0;
        
      const beforeHealth = beforeCustom?.health_score ? 
        parseFloat(beforeCustom.health_score as string) : 70;
      const afterHealth = afterCustom?.health_score ? 
        parseFloat(afterCustom.health_score as string) : 70;
        
      // Calculate growth metrics
      const heightChange = beforeHeight && afterHeight ? 
        ((afterHeight - beforeHeight) / beforeHeight) * 100 : 0;
        
      const widthChange = beforeWidth && afterWidth ? 
        ((afterWidth - beforeWidth) / beforeWidth) * 100 : 0;
        
      const healthChange = afterHealth - beforeHealth;
      
      // Calculate days between images
      const beforeDate = beforeCustom?.date as string || beforeInfo.created_at as string;
      const afterDate = afterCustom?.date as string || afterInfo.created_at as string;
      
      const daysDiff = Math.max(1, Math.round(
        (new Date(afterDate).getTime() - new Date(beforeDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ));
      
      // Calculate growth rate per day
      const estimatedGrowthRate = heightChange / daysDiff;
      
      // Generate analysis text based on metrics
      let analysisText = `Plant growth analysis comparing images from ${new Date(beforeDate).toLocaleDateString()} to ${new Date(afterDate).toLocaleDateString()} (${daysDiff} days):\n\n`;
      
      if (heightChange > 0) {
        analysisText += `• Height increased by ${Math.round(heightChange)}% (${estimatedGrowthRate.toFixed(2)}% per day)\n`;
      } else if (heightChange < 0) {
        analysisText += `• Height decreased by ${Math.abs(Math.round(heightChange))}% which may indicate pruning or stress\n`;
      } else {
        analysisText += `• No significant change in height detected\n`;
      }
      
      if (healthChange > 5) {
        analysisText += `• Plant health has improved significantly\n`;
      } else if (healthChange < -5) {
        analysisText += `• Plant health has declined and may need attention\n`;
      } else {
        analysisText += `• Plant health is stable\n`;
      }
      
      // Add recommendations based on analysis
      if (healthChange < -10) {
        analysisText += `
Recommendations:
• Check for pests and diseases
• Ensure adequate watering and nutrition
• Consider adjusting light conditions`;
      } else if (heightChange < 5 && daysDiff > 14) {
        analysisText += `
Recommendations:
• Growth is slower than expected
• Check soil nutrients and consider fertilization
• Ensure plant is receiving adequate sunlight`;
      } else if (heightChange > 30 && daysDiff < 14) {
        analysisText += `
Recommendations:
• Growth rate is excellent
• Continue current care regimen
• Consider pruning if the plant becomes too large for its location`;
      }
      
      return {
        comparisonUrl,
        beforeImageUrl: beforeInfo.secure_url as string,
        afterImageUrl: afterInfo.secure_url as string,
        beforeDate,
        afterDate,
        growthMetrics: {
          heightChange: Math.round(heightChange * 10) / 10,
          widthChange: Math.round(widthChange * 10) / 10,
          colorIntensity: 70, // Mock value - would be calculated from image analysis
          estimatedGrowthRate: Math.round(estimatedGrowthRate * 100) / 100,
          healthChangeScore: healthChange
        },
        analysis: analysisText
      };
    } catch (error) {
      return handleApiError(error, 'Failed to compare growth between images');
    }
  },
  
  /**
   * Process multiple images for crop disease detection at once
   */
  batchAnalyzeCropImages: async (imageUrls: string[]): Promise<ImageAnalysisResult[]> => {
    try {
      // Process each image in parallel
      const analysisPromises = imageUrls.map(url => imageService.analyzeCropImage(url));
      const results = await Promise.all(analysisPromises);
      
      return results;
    } catch (error) {
      return handleApiError(error, 'Failed to perform batch analysis of crop images');
    }
  },
  
  /**
   * Generate a visual growth timeline from multiple images
   */
  createGrowthTimelineVisualization: async (imageIds: string[]): Promise<string> => {
    try {
      if (imageIds.length < 2) {
        throw new Error('At least 2 images are required for a timeline visualization');
      }
      
      // Sort images by date (we'll get the data for each)
      const imagesData = await Promise.all(
        imageIds.map(id => new Promise<Record<string, unknown>>((resolve, reject) => {
          cloudinary.api.resource(
            id,
            { context: true },
            (error: unknown, result: unknown) => {
              if (error) reject(error);
              else resolve(result as Record<string, unknown>);
            }
          );
        }))
      );
      
      // Sort by date
      const sortedImages = imagesData
        .map(data => {
          const context = data.context as Record<string, unknown>;
          const custom = context?.custom as Record<string, unknown>;
          return {
            id: data.public_id as string,
            date: custom?.date as string || data.created_at as string
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Create a multiframe animation or collage
      // For simplicity, we'll create a side-by-side sequence of thumbnails
      const cloudName = browserEnv.getEnv('VITE_CLOUDINARY_CLOUD_NAME', 'dl5rwjjol');
      const width = Math.floor(800 / sortedImages.length);
      
      let transformationUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;
      
      // Add each image as a layer
      sortedImages.forEach((img, index) => {
        transformationUrl += `l_${img.id.replace(/\//g, ':')},w_${width},h_400,c_fill,g_west,x_${index * width}/`;
      });
      
      // Add a blank canvas as the base
      transformationUrl += `w_800,h_400,c_fill,e_brightness:0/e_blur:800/e_brightness:40/c_fill,w_800,h_400`;
      
      return transformationUrl;
    } catch (error) {
      return handleApiError(error, 'Failed to create growth timeline visualization');
    }
  }
};

export default imageService;
