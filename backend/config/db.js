const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let memoryServerInstance = null;

const cleanupStaleMongoMemDirs = () => {
  try {
    const tempDir = process.env.TEMP || '/tmp';
    const entries = fs.readdirSync(tempDir);
    const now = Date.now();
    for (const entry of entries) {
      if (entry.startsWith('mongo-mem-')) {
        try {
          const stat = fs.statSync(path.join(tempDir, entry));
          // Only clean directories older than 5 minutes to never disturb an active instance
          if (now - stat.mtimeMs > 5 * 60 * 1000) {
            fs.rmSync(path.join(tempDir, entry), { recursive: true, force: true });
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
};

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

    // Launch automated In-Memory MongoDB fallback so deployment (Render / Cloud / Local) always functions
    try {
      cleanupStaleMongoMemDirs();
      console.log('🚀 Launching automated In-Memory MongoDB fallback server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();

      const conn = await mongoose.connect(memUri);
      console.log(`✅ Connected to In-Memory MongoDB at: ${memUri}`);
      console.log('💡 Note: To persist data permanently across cloud restarts, configure MONGODB_URI in your Render Environment settings.');
      await autoSeedIfNeeded();
      return conn;
    } catch (fallbackError) {
      console.error('❌ Failed to launch in-memory MongoDB fallback:', fallbackError.message);
    }

    console.error('❌ Could not establish database connection. Please configure MONGODB_URI.');
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  if (memoryServerInstance) {
    try { await memoryServerInstance.stop(); } catch (_) {}
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (memoryServerInstance) {
    try { await memoryServerInstance.stop(); } catch (_) {}
  }
  process.exit(0);
});

module.exports = connectDB;
