// Simple register function for immediate deployment
const jwt = require('jsonwebtoken');

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
    const { email, password, firstName, lastName } = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Email, password, first name, and last name are required'
        })
      };
    }
    
    // Check if user already exists (in production, query your database)
    // For this simple version, we'll just create a new user
    const newUser = {
      id: '2', // In production, generate a unique ID
      email: email.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      role: 'user',
      isVerified: true,
      subscriptionTier: 'free',
      createdAt: new Date().toISOString()
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      'jiuytg2uhihopkmiuy78t6r5dfcgyjhiopklmjnyu7trfdcgjiopklmwdjnqit6rf5dcfgdvyubgiwhojnlkd3iu7yjiok',
      { expiresIn: '30d' }
    );
    
    // Return success response
    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'success',
        message: 'User registered successfully',
        token: token,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            name: `${newUser.firstName} ${newUser.lastName}`,
            role: newUser.role,
            isVerified: newUser.isVerified,
            subscriptionTier: newUser.subscriptionTier,
            createdAt: newUser.createdAt
          }
        }
      })
    };
  } catch (error) {
    console.error('Register function error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'An error occurred during registration'
      })
    };
  }
};