import jwt from 'jsonwebtoken';

// In-memory storage for new users (in production, this would be a database)
let users = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'test1234',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: true,
    subscriptionTier: 'free'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    subscriptionTier: 'enterprise'
  }
];

// Simple ID generator
let nextId = 3;

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-api-key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Method not allowed'
      })
    };
  }

  try {
    // Parse request body
    const { email, password, firstName, lastName } = JSON.parse(event.body || '{}');

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Email, password, first name, and last name are required'
        })
      };
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'User already exists with this email'
        })
      };
    }

    // Create new user
    const newUser = {
      id: nextId.toString(),
      email: email.toLowerCase(),
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: 'user',
      isVerified: true,
      subscriptionTier: 'free'
    };

    // Add to users array
    users.push(newUser);
    nextId++;

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback_secret_key_for_testing',
      { expiresIn: '30d' }
    );

    // Return success response
    return {
      statusCode: 201,
      headers,
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
            createdAt: new Date().toISOString()
          }
        }
      })
    };

  } catch (error) {
    console.error('Register function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'An error occurred during registration'
      })
    };
  }
};