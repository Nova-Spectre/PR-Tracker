import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

const cached = global.mongooseConn || { conn: null, promise: null }
global.mongooseConn = cached

export async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('[db] Reusing existing Mongo connection')
    return cached.conn
  }
  if (!cached.promise) {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set')
    console.log('[db] Connecting to MongoDB...', {
      db: process.env.MONGODB_DB || '(default)'
    })
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => {
        console.log('[db] MongoDB connected')
        return m
      })
      .catch((err) => {
        console.error('[db] MongoDB connection error:', err)
        throw err
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}


