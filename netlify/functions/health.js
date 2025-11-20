// Netlify Function for health checks
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    },
    body: JSON.stringify({
      status: 'success',
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      service: 'Netlify Functions'
    })
  };
};