const serverless = require('serverless-http');
const app = require('./server.js');

// Export the handler for Netlify Functions
exports.handler = async (event, context) => {
  console.log('API Handler called with event:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers
  });
  
  try {
    const result = await serverless(app)(event, context);
    console.log('API Handler result:', result.statusCode);
    return result;
  } catch (error) {
    console.error('API Handler error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'Internal server error in API handler'
      })
    };
  }
};