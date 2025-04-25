import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker';

let cached = global as any;
cached.mongoose = cached.mongoose || { conn: null, promise: null };

export async function connectToMongoDB() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    throw e;
  }

  return cached.mongoose.conn;
} 