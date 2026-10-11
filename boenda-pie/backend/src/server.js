const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB, getDbError } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const materialRoutes = require('./routes/materialRoutes');
const productionRoutes = require('./routes/productionRoutes');
const stockRoutes = require('./routes/stockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const { autoSeedIfEmpty } = require('./utils/seedData');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Boenda Pie Purwokerto REST API Server is Running',
    version: '1.0.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date()
  });
});

// Middleware: Check Database Connectivity for all /api calls
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const errorDetail = getDbError ? getDbError() : null;
    let stateDesc = 'Belum terhubung';
    if (mongoose.connection.readyState === 2) {
      stateDesc = 'Sedang proses menghubungkan (Connecting)... Coba klik Masuk lagi dalam 5 detik.';
    } else if (errorDetail) {
      stateDesc = `Gagal: ${errorDetail}`;
    }

    return res.status(503).json({
      success: false,
      message: stateDesc,
      error: errorDetail
    });
  }
  next();
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/productions', productionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Listen port 5000 immediately so frontend can connect
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  Boenda Pie Server running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================`);
  });

  // 2. Connect to database
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      await autoSeedIfEmpty();
    }
  } catch (err) {
    console.error('[Database Init Error]:', err.message);
  }
};

startServer();

module.exports = app;
