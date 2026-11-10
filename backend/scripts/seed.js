const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { seedData } = require('./seeder');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB connected for seeding.');
    } catch (err) {
      console.warn(`Could not connect to ${mongoUri}. Starting in-memory instance for seeding test...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mem = await MongoMemoryServer.create();
      await mongoose.connect(mem.getUri());
      console.log('Connected to In-Memory MongoDB for seeding.');
    }

    await seedData();

    console.log('=============================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!   ');
    console.log('=============================================');
    console.log('Demo Credentials:');
    console.log(' Admin:    admin@propertymanager.com / admin123');
    console.log(' Owner 1:  owner1@test.com / owner123');
    console.log(' Owner 2:  owner2@test.com / owner123');
    console.log(' Manager 1:manager1@test.com / manager123');
    console.log(' Manager 2:manager2@test.com / manager123');
    console.log(' Tenant 1: tenant1@test.com / tenant123');
    console.log(' Tenant 2: tenant2@test.com / tenant123');
    console.log(' Tenant 3: tenant3@test.com / tenant123');
    console.log('=============================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
