const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const materialRoutes = require('./routes/materialRoutes');
const productionRoutes = require('./routes/productionRoutes');
const stockRoutes = require('./routes/stockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');

const { autoSeedIfEmpty } = require('./utils/seedData');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Boenda Pie Purwokerto REST API Server is Running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/productions', productionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await autoSeedIfEmpty();
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  Boenda Pie Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
};

startServer();

module.exports = app;
