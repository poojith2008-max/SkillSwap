const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

const connectDB = async () => {
  try {
    let mongoUri = env.MONGODB_URI;

    if (mongoUri === 'memory' || env.NODE_ENV === 'test') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log('⚡ Initialized MongoMemoryServer for development/testing');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB connected successfully to: ${mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost') ? 'Local/In-Memory MongoDB' : 'Remote MongoDB'}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev fallback to memory server if local MongoDB is unreachable
    try {
      console.log('⚠️ Attempting fallback to MongoMemoryServer in development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const fallbackUri = memoryServer.getUri();
      await mongoose.connect(fallbackUri);
      console.log('✅ Fallback MongoMemoryServer connected successfully');
      return mongoose.connection;
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (error) {
    console.error('Error during MongoDB disconnect:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
