import axios from 'axios';

// API key from environment variable
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyB1D3dpF9ae41RrC1V8Ow7fYBlag87N0nM';

// YouTube API base URL
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Create YouTube API client
const youtubeClient = axios.create({
  baseURL: YOUTUBE_API_BASE_URL,
  timeout: 30000,
  params: {
    key: YOUTUBE_API_KEY
  }
});

// Define interfaces for response types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  videos: YouTubeVideo[];
}

// Handle API errors consistently
const handleApiError = (error: unknown, message: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${message}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      throw new Error(`Network error: Unable to reach YouTube API. Please check your connection.`);
    }
  }
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${message}: ${errorMessage}`);
};

// YouTube education service for agricultural content
export const educationService = {
  /**
   * Search for agricultural educational videos
   * @param query Search query
   * @param maxResults Number of results to return
   * @returns List of YouTube videos
   */
  searchVideos: async (query: string, maxResults: number = 10): Promise<YouTubeSearchResponse> => {
    try {
      // Search for videos
      const searchResponse = await youtubeClient.get('/search', {
        params: {
          part: 'snippet',
          q: `agriculture ${query}`,
          type: 'video',
          maxResults,
          relevanceLanguage: 'en',
          videoCategoryId: '28', // Science & Technology category
          videoEmbeddable: true,
          safeSearch: 'strict'
        }
      });
      
      // Extract video IDs
      const videoIds = searchResponse.data.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
      
      // Get detailed information about the videos
      const videoResponse = await youtubeClient.get('/videos', {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoIds
        }
      });
      
      // Map the response to YouTubeVideo objects
      const videos = videoResponse.data.items.map((item: { id: string; snippet: { title: string; description: string; thumbnails: { [key: string]: { url: string; width: number; height: number } }; channelTitle: string; publishedAt: string }; contentDetails: { duration: string }; statistics: { viewCount: string } }): YouTubeVideo => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: {
          default: item.snippet.thumbnails.default || { url: '', width: 0, height: 0 },
          medium: item.snippet.thumbnails.medium || { url: '', width: 0, height: 0 },
          high: item.snippet.thumbnails.high || { url: '', width: 0, height: 0 }
        },
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: parseInt(item.statistics.viewCount, 10) || 0
      }));
      
      return {
        items: videos,
        nextPageToken: searchResponse.data.nextPageToken,
        prevPageToken: searchResponse.data.prevPageToken,
        totalResults: searchResponse.data.pageInfo.totalResults
      };
    } catch (error) {
      return handleApiError(error, `Failed to search YouTube videos for query: ${query}`);
    }
  },
  
  /**
   * Get videos for a specific agricultural topic
   * @param topic Agricultural topic
   * @param skillLevel Skill level (beginner, intermediate, advanced)
   * @returns List of YouTube videos
   */
  getTopicVideos: async (
    topic: string, 
    skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<YouTubeSearchResponse> => {
    try {
      // Adjust query based on skill level
      let query = topic;
      switch (skillLevel) {
        case 'beginner':
          query = `${topic} basics for beginners farming`;
          break;
        case 'intermediate':
          query = `${topic} techniques farming`;
          break;
        case 'advanced':
          query = `${topic} advanced methods farming`;
          break;
      }
      
      return await educationService.searchVideos(query, 5);
    } catch (error) {
      return handleApiError(error, `Failed to get videos for topic: ${topic}`);
    }
  },
  
  /**
   * Get videos related to a specific crop
   * @param cropType Crop type
   * @returns List of YouTube videos
   */
  getCropVideos: async (cropType: string): Promise<YouTubeSearchResponse> => {
    try {
      return await educationService.searchVideos(`how to grow ${cropType} farming cultivation`, 8);
    } catch (error) {
      return handleApiError(error, `Failed to get videos for crop: ${cropType}`);
    }
  },
  
  /**
   * Get videos related to pest control
   * @param pestName Pest name
   * @returns List of YouTube videos
   */
  getPestControlVideos: async (pestName: string): Promise<YouTubeSearchResponse> => {
    try {
      return await educationService.searchVideos(`how to control ${pestName} organic farming`, 6);
    } catch (error) {
      return handleApiError(error, `Failed to get pest control videos for: ${pestName}`);
    }
  },
  
  /**
   * Create a learning path with sequenced videos
   * @param topic Main topic
   * @param skillLevel Skill level
   * @returns Learning path with sequenced videos
   */
  createLearningPath: async (
    topic: string,
    skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<LearningPath> => {
    try {
      // Determine subtopics based on the main topic and skill level
      let subtopics: string[] = [];
      
      switch (topic.toLowerCase()) {
        case 'organic farming':
          subtopics = skillLevel === 'beginner'
            ? ['soil preparation', 'composting', 'natural pest control', 'crop rotation']
            : skillLevel === 'intermediate'
              ? ['companion planting', 'organic fertilizers', 'integrated pest management', 'water conservation']
              : ['biodynamic farming', 'permaculture design', 'no-till organic systems', 'organic certification'];
          break;
          
        case 'irrigation':
          subtopics = skillLevel === 'beginner'
            ? ['basic irrigation systems', 'watering schedule', 'drip irrigation basics', 'water conservation']
            : skillLevel === 'intermediate'
              ? ['irrigation efficiency', 'water quality', 'irrigation scheduling', 'automated systems']
              : ['precision irrigation', 'sensor-based irrigation', 'water recycling', 'advanced drip systems'];
          break;
          
        case 'soil health':
          subtopics = skillLevel === 'beginner'
            ? ['soil types', 'soil testing', 'basic amendments', 'mulching']
            : skillLevel === 'intermediate'
              ? ['soil microbiology', 'nutrient cycling', 'compost tea', 'cover cropping']
              : ['soil remediation', 'biochar', 'mineral balancing', 'soil ecology management'];
          break;
          
        default:
          subtopics = ['introduction', 'basics', 'techniques', 'applications'];
      }
      
      // Fetch videos for each subtopic
      const videoPromises = subtopics.map(subtopic => 
        educationService.getTopicVideos(`${topic} ${subtopic}`, skillLevel)
      );
      
      const videoResults = await Promise.all(videoPromises);
      
      // Collect one video from each subtopic to create a sequence
      const pathVideos: YouTubeVideo[] = videoResults.map(result => 
        result.items.length > 0 ? result.items[0] : null
      ).filter((video): video is YouTubeVideo => video !== null);
      
      // Create the learning path
      return {
        id: `${topic.toLowerCase().replace(/\s+/g, '-')}-${skillLevel}`,
        title: `${topic} - ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level`,
        description: `A curated learning path for ${skillLevel} farmers interested in ${topic}`,
        skillLevel,
        topics: subtopics,
        videos: pathVideos
      };
    } catch (error) {
      return handleApiError(error, `Failed to create learning path for topic: ${topic}`);
    }
  },
  
  /**
   * Get seasonal farming tips videos
   * @param season Current season
   * @param region Optional region for more specific results
   * @returns List of YouTube videos
   */
  getSeasonalVideos: async (season: string, region?: string): Promise<YouTubeSearchResponse> => {
    try {
      let query = `${season} season farming tips`;
      if (region) {
        query += ` in ${region}`;
      }
      
      return await educationService.searchVideos(query, 6);
    } catch (error) {
      return handleApiError(error, `Failed to get seasonal farming videos for: ${season}`);
    }
  },
  
  /**
   * Get the YouTube embed URL for a video
   * @param videoId YouTube video ID
   * @returns Embed URL
   */
  getEmbedUrl: (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  }
};

export default educationService;