import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Default export middleware function for ES module compatibility
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no Bearer token, try to get from cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    console.log('Token found:', token.substring(0, 20) + '...'); // Token found, but only log first 20 chars for debugging
    
    // Verify token - use the same JWT_SECRET as in auth routes
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    
    console.log('Token decoded:', decoded);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password -refreshToken -__v');
    if (!user) {
      console.log('User not found for userId:', decoded.userId);
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('User found:', user._id);

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated:', user._id);
      return res.status(403).json({
        status: 'error',
        message: 'User account is deactivated'
      });
    }

    // Attach user to request object
    req.user = user;
    console.log('User attached to request, proceeding to next middleware');
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Authentication error occurred
    throw error;
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is verified
export const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    return next();
  }
  return res.status(403).json({
    status: 'error',
    message: 'Please verify your email address to access this resource.'
  });
};

// Export the authentication middleware as default export for ES module compatibility
export default authenticate;