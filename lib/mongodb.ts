import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI environment variable is not set. Please configure your MongoDB connection string.');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('🔄 Using existing MongoDB connection');
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      'MongoDB connection string is not configured. Please set MONGODB_URI in your .env.local file. ' +
      'For a free MongoDB database, visit https://www.mongodb.com/atlas and create a cluster.'
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 75000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      // Add these options to help with connection issues
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 Connection URI (masked):', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB successfully');
      console.log(`📊 Database: ${mongoose.connection?.db?.databaseName || 'unknown'}`);
      console.log(`🏠 Host: ${mongoose.connection.host}`);
      console.log(`🔌 Connection state: ${mongoose.connection.readyState}`);
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('🔍 Error details:', {
        name: error.name,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        hostname: error.hostname
      });
      
      // Provide specific error guidance
      if (error.code === 'ECONNREFUSED' || error.syscall === 'querySrv') {
        console.error('💡 This appears to be a DNS/network issue. Please check:');
        console.error('   1. Your internet connection');
        console.error('   2. MongoDB Atlas cluster is running');
        console.error('   3. Your IP address is whitelisted in MongoDB Atlas');
        console.error('   4. The connection string is correct');
      }
      
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('💥 Failed to establish MongoDB connection:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

