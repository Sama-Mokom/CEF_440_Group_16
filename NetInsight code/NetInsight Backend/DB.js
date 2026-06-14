const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      'MONGODB_URI is not set. The server will keep running, but database-backed routes will fail until this is configured.'
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('The server will keep running, but database-backed routes will fail until this is resolved.');
  }
};

module.exports = connectDB;