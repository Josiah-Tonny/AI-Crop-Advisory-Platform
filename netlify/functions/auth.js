// Simple auth function
export const handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-api-key',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    };
  }
  
  // Parse the request body
  const body = JSON.parse(event.body || '{}');
  const { action } = body;
  
  // Handle different actions
  if (action === 'login') {
    // Simple validation
    if (!body.email || !body.password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Email and password are required'
        })
      };
    }
    
    // Return a mock success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Login successful',
        token: 'mock-jwt-token',
        data: {
          user: {
            id: 'mock-user-id',
            email: body.email,
            firstName: 'Mock',
            lastName: 'User',
            name: 'Mock User',
            role: 'user',
            isVerified: true,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString()
          }
        }
      })
    };
  }
  
  if (action === 'register') {
    // Simple validation
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Email, password, first name, and last name are required'
        })
      };
    }
    
    // Return a mock success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Registration successful',
        token: 'mock-jwt-token',
        data: {
          user: {
            id: 'mock-user-id',
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            name: `${body.firstName} ${body.lastName}`,
            role: 'user',
            isVerified: true,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString()
          }
        }
      })
    };
  }
  
  if (action === 'profile') {
    // Return a mock profile response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Profile fetched successfully',
        data: {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com',
            firstName: 'Mock',
            lastName: 'User',
            name: 'Mock User',
            role: 'user',
            isVerified: true,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString()
          }
        }
      })
    };
  }
  
  if (action === 'logout') {
    // Return a mock logout response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Logged out successfully'
      })
    };
  }
  
  // Default response
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Auth function is working',
      path: event.path,
      method: event.httpMethod,
      action: action || 'no action specified'
    })
  };
};