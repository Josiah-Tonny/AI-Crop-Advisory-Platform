import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, location, farmSize, cropTypes, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
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
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate user statistics
    const trialDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const isTrialExpired = user.subscriptionTier === 'free' && accountAge > 14;
    
    const stats = {
      accountAge,
      isTrialExpired,
      trialDaysRemaining: user.subscriptionTier === 'free' ? 
        Math.max(0, 14 - accountAge) : 
        null,
      cropTypesCount: user.cropTypes?.length || 0,
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

export default router;