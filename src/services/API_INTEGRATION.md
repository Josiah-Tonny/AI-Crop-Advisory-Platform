# AI Advisory Platform API Integrations

This document outlines the API integrations implemented in the AI Advisory Platform. The platform leverages multiple external APIs to provide comprehensive agricultural advisory services.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Integrations](#api-integrations)
  - [Weather & Location Services](#weather--location-services)
  - [Plant & Crop APIs](#plant--crop-apis)
  - [Educational Content API](#educational-content-api)
  - [Image Analysis & Storage](#image-analysis--storage)
- [Service Implementation](#service-implementation)
- [Integration Points](#integration-points)
- [Error Handling & Fallbacks](#error-handling--fallbacks)
- [Performance Considerations](#performance-considerations)
- [Future Enhancements](#future-enhancements)

## Overview

The AI Advisory Platform integrates multiple external APIs to provide data-driven agricultural recommendations and advice. These integrations enhance the platform's capabilities with real-time weather data, plant identification, educational content, and image analysis.

## Architecture

The platform follows a service-oriented architecture with the following key components:

1. **Base Services**: Individual service modules for each external API integration
   - `weatherService.ts` - Weather and location data
   - `plantService.ts` - Plant database and identification
   - `imageService.ts` - Image storage and analysis
   - `educationService.ts` - Educational content from YouTube

2. **AI Integration Layer**: Core advisory service that orchestrates all API integrations
   - `aimlService.ts` - Combines data from multiple sources to generate comprehensive recommendations

3. **UI Components**: React components that consume the services
   - `SoilPage.tsx` - Soil analysis with weather data integration
   - `PestControlPage.tsx` - Pest control with image analysis integration
   - `CropsPage.tsx` - Crop recommendations with climate and soil data
   - `IrrigationPage.tsx` - Irrigation planning with weather forecasts
   - `EducationPage.tsx` - Educational resources with YouTube content

## API Integrations

### Weather & Location Services

#### OpenWeather API

- Provides real-time weather data and forecasts
- Used for enhancing soil analysis, irrigation planning, and crop recommendations
- Implementation: `weatherService.ts`

#### AgroMonitoring API

- Provides agricultural weather metrics
- Used for advanced soil and crop monitoring
- Implementation: Integrated within `weatherService.ts`

#### LocationIQ API

- Provides geocoding and location search
- Used for location-based recommendations
- Implementation: Integrated within `weatherService.ts`

### Plant & Crop APIs

#### Trefle API

- Plant database with extensive information on 400,000+ plant species
- Used for crop recommendations and plant information
- Implementation: `plantService.ts`

#### Plant.id API

- Plant identification and disease detection from images
- Used for pest and disease control recommendations
- Implementation: `plantService.ts`

### Educational Content API

#### YouTube API

- Educational video content for agricultural topics
- Used for providing instructional content on farming practices
- Implementation: `educationService.ts`

### Image Analysis & Storage

#### Cloudinary API

- Image storage, manipulation, and analysis
- Used for storing field images and analyzing crop health
- Implementation: `imageService.ts`

## Service Implementation

### Weather Service (`weatherService.ts`)

```typescript
// Key methods
getCurrentWeather(lat: number, lon: number): Promise<WeatherData>
getForecast(lat: number, lon: number, days: number): Promise<ForecastData[]>
getAgroWeatherData(lat: number, lon: number): Promise<AgroWeatherData>
searchLocation(query: string): Promise<LocationData[]>
```

### Plant Service (`plantService.ts`)

```typescript
// Key methods
searchPlants(query: string): Promise<Plant[]>
getPlantById(id: number): Promise<Plant>
identifyPlant(imageBase64: string): Promise<PlantIdentificationResult>
getCompanionPlants(cropName: string): Promise<CompanionPlantData>
getPlantsByCriteria(criteria: PlantCriteria): Promise<PlantResponse>
```

### Image Service (`imageService.ts`)

```typescript
// Key methods
uploadImage(file: string | File, options?: UploadOptions): Promise<CloudinaryUploadResponse>
analyzeCropImage(imageUrl: string): Promise<ImageAnalysisResult>
storeFieldImage(imageData: string | File, metadata: FieldMetadata): Promise<CloudinaryUploadResponse>
getFieldImageTimeline(fieldName?: string, cropType?: string): Promise<ImageTimelineEntry[]>
generateBeforeAfterComparison(beforeImageId: string, afterImageId: string): Promise<string>
```

### Education Service (`educationService.ts`)

```typescript
// Key methods
searchVideos(query: string, maxResults?: number): Promise<YouTubeSearchResponse>
getTopicVideos(topic: string, skillLevel?: SkillLevel): Promise<YouTubeSearchResponse>
getCropVideos(cropType: string): Promise<YouTubeSearchResponse>
createLearningPath(topic: string, skillLevel?: SkillLevel): Promise<LearningPath>
getSeasonalVideos(season: string, region?: string): Promise<YouTubeSearchResponse>
```

### AI Advisory Service (`aimlService.ts`)

```typescript
// Key methods
getSoilAnalysis(location: Location, params?: SoilParams): Promise<SoilAnalysisResult>
getEnhancedSoilAnalysis(location: Location, params?: SoilParams): Promise<EnhancedSoilAnalysisResult>
getPestControl(params: PestParams): Promise<PestControlResult>
getIrrigationRecommendations(params: IrrigationParams): Promise<IrrigationResult>
getCropRecommendations(params: CropParams): Promise<CropRecommendationResult>
getEducationalContent(params: EducationParams): Promise<EducationalContentResult>
```

## Integration Points

### Soil Analysis with Weather Data

The soil analysis service integrates weather data to provide contextually relevant soil recommendations:

```typescript
async getEnhancedSoilAnalysis(location, params) {
  // Get basic soil analysis
  const basicAnalysis = await aimlService.getSoilAnalysis(location, params);
  
  // Get weather data for context
  const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
  
  // Combine data sources
  return {
    ...basicAnalysis,
    weatherContext: {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      rainfall: weatherData.forecast?.[0]?.precipitation || 0
    }
  };
}
```

### Pest Control with Image Analysis

The pest control service integrates plant identification and image analysis:

```typescript
async getPestControl(params) {
  let enhancedData = {};
  
  if (params.imageData) {
    // Use Plant.id to identify the plant and potential diseases
    const plantIdentification = await plantService.identifyPlant(params.imageData);
    
    // Upload to Cloudinary for additional analysis
    const uploadResponse = await imageService.uploadImage(params.imageData);
    const imageAnalysis = await imageService.analyzeCropImage(uploadResponse.secure_url);
    
    enhancedData = {
      plantDisease: extractDisease(plantIdentification),
      cloudinaryAnalysis: imageAnalysis.analysis?.crop_disease
    };
  }
  
  // Call API with enhanced data
  const response = await aimlClient.post('/pest/detect', {
    ...params,
    enhancedData
  });
  
  return response.data;
}
```

### Irrigation Planning with Weather Forecasts

The irrigation service uses weather forecasts for precise watering recommendations:

```typescript
async getIrrigationRecommendations(params) {
  // Get weather forecast
  const forecast = await weatherService.getForecast(
    params.location.lat, 
    params.location.lon, 
    7
  );
  
  // Calculate water needs based on crop type
  const cropWaterNeeds = getCropWaterNeeds(params.cropType);
  
  // Calculate forecasted rainfall
  const forecastedRainfall = forecast.reduce(
    (total, day) => total + (day.precipitation || 0), 
    0
  );
  
  // Enhanced request with weather context
  const enhancedParams = {
    ...params,
    weatherData: { forecast },
    forecastedRainfall,
    cropWaterNeeds
  };
  
  const response = await aimlClient.post('/irrigation/recommend', enhancedParams);
  return response.data;
}
```

### Educational Content with YouTube Videos

The education service integrates YouTube videos for agricultural learning:

```typescript
async getEducationalContent(params) {
  // Get videos based on parameters
  let videos = [];
  
  if (params.topic) {
    const videoResponse = await educationService.getTopicVideos(
      params.topic, 
      params.skillLevel || 'beginner'
    );
    videos = videoResponse.items || [];
  }
  
  // Create a learning path if a topic is specified
  let learningPath = null;
  if (params.topic) {
    learningPath = await educationService.createLearningPath(
      params.topic,
      params.skillLevel || 'beginner'
    );
  }
  
  return {
    multimedia: formatVideos(videos),
    learningPaths: learningPath ? [formatLearningPath(learningPath)] : []
  };
}
```

## Error Handling & Fallbacks

All API integrations include comprehensive error handling and graceful fallbacks:

1. **Network Errors**: Each service catches and logs network errors, then falls back to default data
2. **API Rate Limits**: Services implement exponential backoff for rate-limited APIs
3. **Data Validation**: All API responses are validated to ensure data integrity
4. **Caching**: Frequently accessed data is cached to reduce API calls

Example error handling pattern:

```typescript
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  console.warn('API error:', error);
  // Fall back to default data
  return DEFAULT_DATA;
}
```

## Performance Considerations

1. **API Request Batching**: Where possible, requests are batched to reduce API calls
2. **Parallel Requests**: Independent API calls are made in parallel using Promise.all
3. **Caching Strategy**: Implemented for weather data, plant information, and educational content
4. **Lazy Loading**: Educational videos and images are lazy-loaded for performance

## Future Enhancements

1. **Machine Learning Integration**: Implement on-device ML for offline plant identification
2. **Drone Imagery Analysis**: Add support for drone imagery analysis for large fields
3. **Sensor Integration**: Support for IoT soil sensors to provide real-time soil data
4. **Regional Model Customization**: Tailor recommendations for different agricultural regions
5. **Offline Support**: Add offline capability for core advisory features

---

*This documentation is part of the AI Advisory Platform project.*
