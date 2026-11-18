const mongoose = require('mongoose');

const MAX_CONNECTION_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined. Add it to the .env file.');
  }

  for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt += 1) {
    try {
      const connection = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`MongoDB connected: ${connection.connection.host}`);
      return;
    } catch (error) {
      if (attempt === MAX_CONNECTION_ATTEMPTS) {
        throw error;
      }

      console.error(
        `MongoDB connection attempt ${attempt} failed (${error.name}); retrying in 5 seconds.`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
