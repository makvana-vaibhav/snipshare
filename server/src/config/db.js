const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = (process.env.MONGO_URI || '').replace(/['"]/g, '').trim();
    const conn = await mongoose.connect(mongoUri, { family: 4 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
