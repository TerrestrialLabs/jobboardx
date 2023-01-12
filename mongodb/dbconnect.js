import mongoose from 'mongoose'
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  const MONGODB_URL = process.env.NODE_ENV === 'development' ? process.env.MONGODB_URL_DEVELOPMENT : process.env.MONGODB_URL_PRODUCTION

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      // bufferCommands: false,
      bufferCommands: true,
    }

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect