import express from 'express';

const router = express.Router();

// Simple logger
const logger = {
  info: (msg) => console.log(`[EDUCATION] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[EDUCATION ERROR] ${new Date().toISOString()} - ${msg}`)
};

/**
 * GET /content
 * Get educational content based on interests and location
 */
router.get('/content', async (req, res) => {
  try {
    const { interests, location } = req.query;
    
    logger.info(`Fetching educational content for interests: ${interests} and location: ${location}`);
    
    // For now, return placeholder content
    // In a real implementation, this would fetch content from a database or external API
    const content = [
      {
        id: '1',
        title: 'Understanding Soil Health',
        type: 'article',
        summary: 'Learn about the importance of soil health in crop production',
        url: '/education/soil-health',
        thumbnail: 'https://example.com/soil-health.jpg',
        duration: '5 min read'
      },
      {
        id: '2',
        title: 'Irrigation Best Practices',
        type: 'video',
        summary: 'Discover efficient irrigation techniques for your crops',
        url: '/education/irrigation-practices',
        thumbnail: 'https://example.com/irrigation.jpg',
        duration: '12 min video'
      },
      {
        id: '3',
        title: 'Pest Management Guide',
        type: 'guide',
        summary: 'Comprehensive guide to managing common agricultural pests',
        url: '/education/pest-management',
        thumbnail: 'https://example.com/pest-management.jpg',
        duration: '8 min read'
      }
    ];
    
    return res.status(200).json({
      success: true,
      content: content,
      message: 'Educational content fetched successfully'
    });
  } catch (error) {
    logger.error(`Failed to fetch educational content: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch educational content',
      error: error.message
    });
  }
});

/**
 * GET /videos
 * Get educational videos based on a topic
 */
router.get('/videos', async (req, res) => {
  try {
    const { topic, level } = req.query;
    
    logger.info(`Fetching educational videos for topic: ${topic} and level: ${level}`);
    
    // For now, return placeholder videos
    // In a real implementation, this would fetch videos from a database or external API
    const videos = [
      {
        id: 'vid1',
        title: 'Introduction to Soil Testing',
        description: 'Learn how to test your soil for optimal crop growth',
        thumbnail: 'https://example.com/soil-testing.jpg',
        duration: '8:45',
        url: '/videos/soil-testing',
        views: 1250,
        rating: 4.8
      },
      {
        id: 'vid2',
        title: 'Crop Rotation Techniques',
        description: 'Maximize your yield with effective crop rotation',
        thumbnail: 'https://example.com/crop-rotation.jpg',
        duration: '12:30',
        url: '/videos/crop-rotation',
        views: 980,
        rating: 4.6
      }
    ];
    
    return res.status(200).json({
      success: true,
      videos: videos,
      message: 'Educational videos fetched successfully'
    });
  } catch (error) {
    logger.error(`Failed to fetch educational videos: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch educational videos',
      error: error.message
    });
  }
});

export default router;