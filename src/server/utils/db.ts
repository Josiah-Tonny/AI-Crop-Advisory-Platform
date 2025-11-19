import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Extend globalThis to include mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Use the connection string directly from .env
const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME || 'crops';

if (!MONGODB_URL) {
  throw new Error('MONGODB_URL is not defined in environment variables');
}

// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// Cache the connection to prevent multiple connections
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts = {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL!, opts).then((mongoose) => {
      // ✅ Connected to MongoDB (silent logging)
      // console.log('✅ Connected to MongoDB');
      return mongoose;
    }).catch((error) => {
      // MongoDB connection error (silent logging)
      // console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    if (cached) {
      cached.conn = await cached.promise;
    }
  } catch (e) {
    if (cached) {
      cached.promise = null;
    }
    throw e;
  }

  return cached?.conn;
}

export default dbConnect;