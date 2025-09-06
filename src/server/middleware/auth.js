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
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    // Verify token - use the same JWT_SECRET as in auth routes
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password -refreshToken -__v');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'User account is deactivated'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
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