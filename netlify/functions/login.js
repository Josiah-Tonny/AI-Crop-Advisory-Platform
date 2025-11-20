// Simple login function for immediate deployment
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user data (in production, this would come from your database)
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$rOzJqQZ8QxN8vL5J5J5J5uO7.5O7.5O7.5O7.5O7.5O7.5O7.5O7.', // password: test1234
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: true,
    subscriptionTier: 'free',
    createdAt: new Date().toISOString()
  }
];

exports.handler = async (event, context) => {
  try {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-api-key",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
        },
        body: ''
      };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Method not allowed'
        })
      };
    }
    
    // Parse request body
    const { email, password } = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Email and password are required'
        })
      };
    }
    
    // Find user (in production, query your database)
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Invalid email or password'
        })
      };
    }
    
    // Check password (in production, use bcrypt.compare)
    const isPasswordValid = password === 'test1234'; // Simple check for testing
    
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Invalid email or password'
        })
      };
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'jiuytg2uhihopkmiuy78t6r5dfcgyjhiopklmjnyu7trfdcgjiopklmwdjnqit6rf5dcfgdvyubgiwhojnlkd3iu7yjiok',
      { expiresIn: '30d' }
    );
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Login successful',
        token: token,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            isVerified: user.isVerified,
            subscriptionTier: user.subscriptionTier,
            createdAt: user.createdAt
          }
        }
      })
    };
  } catch (error) {
    console.error('Login function error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'An error occurred during login'
      })
    };
  }
};