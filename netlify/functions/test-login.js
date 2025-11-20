// Simple test function for login endpoint
exports.handler = async (event, context) => {
  try {
    console.log('Test login function called with event:', event);
    
    // Return a simple success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-api-key",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Test function working correctly',
        data: {
          timestamp: new Date().toISOString()
        }
      })
    };
  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'Test function failed'
      })
    };
  }
};