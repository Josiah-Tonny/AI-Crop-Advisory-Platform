const { connectToDatabase } = require('./helpers/db');
const mongoose = require('mongoose');

/**
 * Test endpoint to verify MongoDB connection
 */
exports.handler = async (event, context) => {
  // Set to false to allow the function to complete before the event loop is empty
  context.callbackWaitsForEmptyEventLoop = false;

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to the database
    const connection = await connectToDatabase();
    
    // Get database stats to verify connection
    const stats = await connection.db.stats();
    
    // Get list of collections
    const collections = await connection.db.listCollections().toArray();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: 'Successfully connected to MongoDB',
        database: {
          name: connection.name,
          host: connection.host,
          port: connection.port,
          collections: collections.map(c => c.name),
          stats: {
            collections: stats.collections,
            objects: stats.objects,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize
          }
        },
        environment: process.env.NODE_ENV || 'development'
      }, null, 2)
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to connect to MongoDB',
        error: {
          name: error.name,
          message: error.message,
          // Only include stack trace in development
          ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
        },
        environment: process.env.NODE_ENV || 'development',
        envVars: {
          hasMongoUri: !!(process.env.MONGODB_URI || process.env.MONGODB_URL),
          nodeEnv: process.env.NODE_ENV,
          // Don't expose actual credentials in the response
        }
      }, null, 2)
    };
  } finally {
    // Don't close the connection to allow for connection pooling
    // The connection will be reused for subsequent function calls
  }
};
