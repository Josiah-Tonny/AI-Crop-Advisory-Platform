import express from 'express';
import Discussion from '../models/Discussion.js';
import authenticate from '../middleware/auth.js';
import { validateDiscussion } from '../middleware/validation.js';

const router = express.Router();

// Get all discussions with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category = 'all', 
      search = '',
      sort = 'latest' 
    } = req.query;
    
    // Build query
    const query = {};
    
    // Add category filter if not 'all'
    if (category !== 'all') {
      query.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'mostLiked':
        sortOption = { 'likes.length': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    // Execute query with pagination
    const discussions = await Discussion.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName avatar location role')
      .populate('replies.author', 'firstName lastName avatar role');
    
    // Get total count for pagination
    const total = await Discussion.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        discussions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
});

// Get a single discussion by ID
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'firstName lastName avatar location role')
      .populate('replies.author', 'firstName lastName avatar role');
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
});

// Create a new discussion
router.post('/', authenticate, validateDiscussion, async (req, res) => {
  try {
    const { title, content, category, tags, images } = req.body;
    
    const discussion = new Discussion({
      title,
      content,
      category,
      tags: tags || [],
      images: images || [],
      author: req.user.id
    });
    
    await discussion.save();
    
    // Populate author details
    await discussion.populate('author', 'firstName lastName avatar location role');
    
    res.status(201).json({
      success: true,
      data: discussion,
      message: 'Discussion created successfully'
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: error.message
    });
  }
});

// Add a reply to a discussion
router.post('/:id/replies', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Add reply
    discussion.replies.push({
      content,
      author: req.user.id
    });
    
    await discussion.save();
    
    // Populate author details for the new reply
    await discussion.populate('replies.author', 'firstName lastName avatar role');
    
    // Get the newly added reply
    const newReply = discussion.replies[discussion.replies.length - 1];
    
    res.status(201).json({
      success: true,
      data: newReply,
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
});

// Like/unlike a discussion
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user already liked the discussion
    const likeIndex = discussion.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Add like
      discussion.likes.push(req.user.id);
    } else {
      // Remove like
      discussion.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      liked: likeIndex === -1,
      likesCount: discussion.likes.length,
      message: likeIndex === -1 ? 'Discussion liked' : 'Discussion unliked'
    });
  } catch (error) {
    console.error('Error liking/unliking discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike discussion',
      error: error.message
    });
  }
});

// Like/unlike a reply
router.post('/:id/replies/:replyId/like', authenticate, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Find the reply
    const reply = discussion.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user already liked the reply
    const likeIndex = reply.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Add like
      reply.likes.push(req.user.id);
    } else {
      // Remove like
      reply.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      liked: likeIndex === -1,
      likesCount: reply.likes.length,
      message: likeIndex === -1 ? 'Reply liked' : 'Reply unliked'
    });
  } catch (error) {
    console.error('Error liking/unliking reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike reply',
      error: error.message
    });
  }
});

// Update a discussion
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, category, tags, images } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user is the author
    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this discussion'
      });
    }
    
    // Update fields
    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.category = category || discussion.category;
    discussion.tags = tags || discussion.tags;
    discussion.images = images || discussion.images;
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      data: discussion,
      message: 'Discussion updated successfully'
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion',
      error: error.message
    });
  }
});

// Delete a discussion
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user is the author or an admin
    if (discussion.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this discussion'
      });
    }
    
    await Discussion.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion',
      error: error.message
    });
  }
});

export default router;