/* eslint-disable @typescript-eslint/no-misused-promises */
import mongoose from 'mongoose';

// MongoDB connection URI (replace with your own)
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/everno';

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      // Options to improve connection stability
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Handle connection cleanup on process exit
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});