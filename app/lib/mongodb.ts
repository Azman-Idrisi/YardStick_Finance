import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Only throw error during runtime, not during build
if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global as any;
cached.mongoose = cached.mongoose || { conn: null, promise: null };

export async function connectToMongoDB() {
  // Return early if no MONGODB_URI is set during build
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.mongoose.conn;
} 