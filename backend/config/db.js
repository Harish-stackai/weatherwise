const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to provided MONGO_URI/MONGODB_URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
      return;
    }

    // If no URI or default local connection attempt fails, fallback to MongoMemoryServer
    console.log('No MONGODB_URI provided. Starting in-memory MongoDB Server for zero-friction development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        binary: {
          version: '7.0.14',
          arch: 'x64',
        },
      });
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[MongoDB Memory Server] Connected successfully to in-memory database: ${memUri}`);
    } catch (memErr) {
      console.warn('MongoMemoryServer fallback failed, trying default localhost mongodb://127.0.0.1:27017/weatherwise');
      await mongoose.connect('mongodb://127.0.0.1:27017/weatherwise', {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB] Connected to local MongoDB instance.`);
    }
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    // Fallback again to memory server if local wasn't up
    if (!memoryServer) {
      try {
        console.log('Attempting embedded MongoMemoryServer fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB Memory Server] Fallback connected: ${memUri}`);
        return;
      } catch (err2) {
        console.error('All MongoDB connection options failed:', err2.message);
      }
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
