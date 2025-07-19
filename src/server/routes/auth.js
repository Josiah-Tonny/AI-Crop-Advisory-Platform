const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin, validateOTP } = require('../middleware/validation');

const router = express.Router();

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, firstName, lastName, phone, location, farmSize, cropTypes } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('Registration failed: User already exists', { email });
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.log('Creating new user with data:', {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.toLowerCase().trim(),
      phone: phone?.trim(),
      location: location?.trim(),
      farmSize,
      cropTypes
    });

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      location: location?.trim(),
      farmSize: farmSize || 'small',
      cropTypes: cropTypes || [],
      isVerified: true  // Automatically verify user on registration
    });

    // Save user without OTP
    await user.save();

    console.log('User created and verified successfully:', { userId: user._id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now log in.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyValue: error.keyValue,
      errors: error.errors,
      stack: error.stack
    });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
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
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Send OTP for verification
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Generate new OTP
    const otpCode = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otpCode, user.firstName);
      console.log(`✅ OTP resent to ${user.email}: ${otpCode}`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      otpSent: true
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// Verify OTP
router.post('/verify-otp', validateOTP, async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Clear expired OTP first
    user.clearExpiredOTP();

    // Verify OTP
    const verificationResult = user.verifyOTP(otp);
    if (!verificationResult.success) {
      await user.save(); // Save failed attempt count
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    // Save verification status
    await user.save();

    // Generate JWT token for verified user
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
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
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.'
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Generate new OTP
    const otpCode = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otpCode, user.firstName);
      console.log(`✅ OTP resent to ${user.email}: ${otpCode}`);
    } catch (emailError) {
      console.error('❌ Failed to resend OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully',
      otpSent: true
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
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
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        preferences: user.preferences,
        isTrialExpired: user.isTrialExpired()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more advanced setup, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router;