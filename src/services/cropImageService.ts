import { ImageAnalysisResult, ImageTimelineEntry, GrowthComparison } from '../types/crops';
import { imageService as originalImageService } from './secureImageService';

// Extend the original imageService with the required functions
export const analyzeCropImage = async (params: {
  file: File;
  cropType?: string;
  fieldName?: string;
  cropId?: string;
}): Promise<ImageAnalysisResult> => {
  // Convert the file to base64 
  const base64 = await originalImageService.fileToBase64(params.file);
  
  // Upload the image
  const uploadResult = await originalImageService.uploadImage(base64, {
    folder: 'agri-advisor/crop-analysis',
    tags: ['crop-analysis', params.cropType || 'unknown-crop'],
    context: {
      crop_type: params.cropType || 'unknown',
      field_name: params.fieldName || 'unnamed-field',
      crop_id: params.cropId || 'none'
    }
  });
  
  // Analyze the uploaded image
  const analysisResult = await originalImageService.analyzeCropImage(uploadResult.secure_url);
  
  // Add health score and growth stage from the analysis
  const healthScore = analysisResult.analysis?.plantHealth?.overallScore || 75;
  const growthStage = determineGrowthStage(analysisResult);
  
  // Add disease information
  const diseases = analysisResult.analysis?.crop_disease?.map(disease => ({
    name: disease.name,
    confidence: disease.confidence,
    description: disease.description
  })) || [];
  
  // Add recommendations based on analysis
  const recommendations = generateRecommendations(analysisResult);
  
  return {
    ...analysisResult,
    healthScore,
    growthStage,
    diseases,
    recommendations
  };
};

export const getCropImageTimeline = async (cropId: string): Promise<ImageTimelineEntry[]> => {
  // Fetch real timeline data from Cloudinary
  const timelineEntries = await originalImageService.getFieldImageTimeline(undefined, cropId);
  
  // Map Cloudinary data to our timeline entry format
  return timelineEntries.map(entry => ({
    id: entry.id,
    timestamp: entry.date,
    imageUrl: entry.imageUrl,
    metadata: {
      healthScore: entry.measurements?.healthScore || 75,
      growthStage: determineGrowthStageFromMeasurements(entry.measurements),
      fieldName: entry.metadata?.fieldName || 'Unknown Field',
      diseases: []
    }
  }));
};

export const compareGrowth = async (beforeImageId: string, afterImageId: string): Promise<GrowthComparison> => {
  // Use the actual Cloudinary API to compare images
  const comparisonResult = await originalImageService.compareGrowth(beforeImageId, afterImageId);
  
  return {
    comparisonUrl: comparisonResult.comparisonUrl,
    beforeImageUrl: comparisonResult.beforeImageUrl,
    afterImageUrl: comparisonResult.afterImageUrl,
    beforeDate: comparisonResult.beforeDate,
    afterDate: comparisonResult.afterDate,
    growthMetrics: {
      heightChange: comparisonResult.growthMetrics.heightChange,
      widthChange: comparisonResult.growthMetrics.widthChange,
      colorIntensity: comparisonResult.growthMetrics.colorIntensity || 85,
      estimatedGrowthRate: comparisonResult.growthMetrics.estimatedGrowthRate,
      healthChangeScore: comparisonResult.growthMetrics.healthChangeScore
    },
    analysis: comparisonResult.analysis
  };
};

// Helper function to determine growth stage based on analysis
function determineGrowthStage(result: ImageAnalysisResult): string {
  const tags = result.tags || [];
  const colors = result.analysis?.colors?.prominent || [];
  
  if (tags.includes('seedling') || tags.includes('sprout')) {
    return 'Seedling Stage';
  } else if (tags.includes('flowering') || colors.includes('#ffff00')) {
    return 'Flowering Stage';
  } else if (tags.includes('fruiting')) {
    return 'Fruiting Stage';
  } else if (colors.includes('#006400') || colors.includes('#228B22')) {
    return 'Vegetative Growth';
  } else {
    return 'Mature Stage';
  }
}

// Helper function to determine growth stage from measurements
function determineGrowthStageFromMeasurements(measurements?: { height?: number; healthScore?: number }): string {
  if (!measurements) return 'Unknown';
  
  if (measurements.height && measurements.height < 30) {
    return 'Seedling Stage';
  } else if (measurements.height && measurements.height < 100) {
    return 'Vegetative Growth';
  } else if (measurements.healthScore && measurements.healthScore > 80) {
    return 'Mature Stage';
  } else {
    return 'Mid Growth';
  }
}

// Helper function to generate recommendations
function generateRecommendations(result: ImageAnalysisResult): string[] {
  const recommendations: string[] = [];
  const health = result.analysis?.plantHealth?.overallScore || 0;
  
  if (health < 50) {
    recommendations.push('Consider applying a balanced fertilizer to improve plant health');
    recommendations.push('Check for signs of nutrient deficiency or pest issues');
  } else if (health < 70) {
    recommendations.push('Monitor moisture levels and adjust watering schedule as needed');
    recommendations.push('Consider a light application of organic fertilizer');
  } else {
    recommendations.push('Continue current care regimen');
    recommendations.push('Ensure consistent watering to maintain healthy growth');
  }
  
  // Add disease-specific recommendations
  const diseases = result.analysis?.crop_disease || [];
  diseases.forEach(disease => {
    if (disease.treatment && disease.treatment.length > 0) {
      recommendations.push(...disease.treatment);
    }
  });
  
  return recommendations;
}

// Export functions to be used by the component
export default {
  ...originalImageService,
  analyzeCropImage,
  getCropImageTimeline,
  compareGrowth
};
