const mongoose = require('mongoose');

let memoryServerInstance = null;

const autoSeedIfNeeded = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Empty database detected. Auto-seeding initial platform records...');
      const { seedData } = require('../scripts/seeder');
      await seedData();
    }
  } catch (err) {
    console.warn('Auto-seed check notice:', err.message);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental';

  try {
    // Attempt connecting to the configured MongoDB URI
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Quick check for local service
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfNeeded();
    return conn;
  } catch (primaryError) {
    console.warn(`⚠️ Primary MongoDB connection failed (${primaryError.message}).`);

    // In non-production environments, provide automated In-Memory MongoDB fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🚀 Launching automated In-Memory MongoDB server for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();

        const conn = await mongoose.connect(memUri);
        console.log(`✅ Connected to local In-Memory MongoDB at: ${memUri}`);
        await autoSeedIfNeeded();
        return conn;
      } catch (fallbackError) {
        console.error('❌ Failed to launch in-memory MongoDB fallback:', fallbackError.message);
      }
    }

    console.error('❌ Could not establish database connection. Please ensure MongoDB is running or configure MONGODB_URI.');
    process.exit(1);
  }
};

module.exports = connectDB;
