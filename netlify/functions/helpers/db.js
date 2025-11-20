const mongoose = require('mongoose');

let cachedDb = null;

/**
 * Establishes a connection to MongoDB and caches the connection
 * @returns {Promise<mongoose.Connection>} The MongoDB connection
 */
async function connectToDatabase() {
  // Return cached connection if available
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL; // Support both common env var names
    const dbName = process.env.DB_NAME || 'crops';
    
    if (!uri) {
      throw new Error('MongoDB connection string not found in environment variables. Please set MONGODB_URI or MONGODB_URL');
    }

    console.log(`Connecting to MongoDB: ${uri.replace(/:[^:]*@/, ':***@')}`); // Hide password in logs
    
    // Connect to MongoDB
    const client = await mongoose.connect(uri, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    cachedDb = client.connection;
    console.log('✅ MongoDB connected successfully');
    
    // Set up event listeners
    cachedDb.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cachedDb = null; // Clear cache on error to force reconnection
    });

    cachedDb.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedDb = null;
    });

    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedDb = null; // Clear cache on error
    throw error;
  }
}

module.exports = { connectToDatabase };
