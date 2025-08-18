import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://173.254.201.134:27017/rensto';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    console.log(
      'Available databases:',
      result.databases.map(db => db.name)
    );

    // Create rensto database if it doesn't exist
    const renstoDb = mongoose.connection.useDb('rensto');
    console.log('✅ Using rensto database');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();
