require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const characterRoutes = require('./routes/characterRoutes');

const startServer = async () => {
  await connectDB();

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Marvel Character API is running.' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/characters', characterRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    console.error(error);
    const statusCode = error.statusCode || error.status || 500;
    return res.status(statusCode).json({
      message: statusCode === 500 ? 'Internal server error.' : error.message,
    });
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
