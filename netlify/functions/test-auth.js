// Test function for auth endpoints
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-api-key',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      status: 'success',
      message: 'Auth function is working',
      timestamp: new Date().toISOString(),
      event: {
        httpMethod: event.httpMethod,
        path: event.path,
        headers: event.headers
      }
    })
  };
};