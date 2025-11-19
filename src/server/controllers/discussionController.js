import Discussion from '../models/Discussion.js';
import mongoose from 'mongoose';

// Get all discussions with pagination and filtering
export const getAllDiscussions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get discussions with pagination
    const discussions = await Discussion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName email');
    
    // Get total count for pagination
    const total = await Discussion.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        discussions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
};

// Get a single discussion by ID
export const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id)
      .populate('author', 'firstName lastName email')
      .populate('replies.author', 'firstName lastName email');
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Error getting discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
};

// Create a new discussion
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags, images } = req.body;
    
    // Create new discussion
    const newDiscussion = new Discussion({
      title,
      content,
      author: req.user.id, // From auth middleware
      category,
      tags: tags || [],
      images: images || []
    });
    
    // Save to database
    const savedDiscussion = await newDiscussion.save();
    
    // Populate author details
    await savedDiscussion.populate('author', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: savedDiscussion
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: error.message
    });
  }
};

// Add a reply to a discussion
export const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Create new reply
    const newReply = {
      content,
      author: req.user.id, // From auth middleware
      createdAt: new Date()
    };
    
    // Add reply to discussion
    discussion.replies.push(newReply);
    await discussion.save();
    
    // Populate author details
    await discussion.populate('replies.author', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: discussion.replies[discussion.replies.length - 1]
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

// Like/unlike a discussion
export const toggleLikeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user already liked the discussion
    const likeIndex = discussion.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Add like
      discussion.likes.push(userId);
    } else {
      // Remove like
      discussion.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Discussion liked' : 'Discussion unliked',
      data: {
        likes: discussion.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike discussion',
      error: error.message
    });
  }
};

// Like/unlike a reply
export const toggleLikeReply = async (req, res) => {
  try {
    const { discussionId, replyId } = req.params;
    const userId = req.user.id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion or reply ID'
      });
    }
    
    const discussion = await Discussion.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Find the reply
    const reply = discussion.replies.id(replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user already liked the reply
    const likeIndex = reply.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Add like
      reply.likes.push(userId);
    } else {
      // Remove like
      reply.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Reply liked' : 'Reply unliked',
      data: {
        likes: reply.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Error toggling reply like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike reply',
      error: error.message
    });
  }
};

// Update a discussion
export const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, images } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
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
    discussion.updatedAt = new Date();
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      message: 'Discussion updated successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion',
      error: error.message
    });
  }
};

// Delete a discussion
export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
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
    
    await Discussion.findByIdAndDelete(id);
    
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
};