const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boenda_pie';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Primary Connection Failed]: ${error.message}`);
    console.log('[MongoDB Fallback] Attempting Mongo Memory Server fallback for seamless local execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Memory Server Connected] URI: ${memoryUri}`);
    } catch (memError) {
      console.error(`[MongoDB Connection Error]: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
