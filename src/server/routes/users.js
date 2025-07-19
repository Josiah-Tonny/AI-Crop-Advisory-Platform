const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, location, farmSize, cropTypes, preferences } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone?.trim();
    if (location !== undefined) user.location = location?.trim();
    if (farmSize) user.farmSize = farmSize;
    if (cropTypes) user.cropTypes = cropTypes;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        location: user.location,
        farmSize: user.farmSize,
        cropTypes: user.cropTypes,
        isVerified: user.isVerified,
        subscriptionTier: user.subscriptionTier,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate user statistics
    const stats = {
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)), // days
      isTrialExpired: user.isTrialExpired(),
      trialDaysRemaining: user.subscriptionTier === 'free' ? 
        Math.max(0, 14 - Math.floor((Date.now() - user.trialStartDate.getTime()) / (1000 * 60 * 60 * 24))) : 
        null,
      cropTypesCount: user.cropTypes.length,
      lastLoginDaysAgo: user.lastLogin ? 
        Math.floor((Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : 
        null
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

module.exports = router;