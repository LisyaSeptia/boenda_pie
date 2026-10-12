const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const connectDB = require('../config/db');

const Product = require('../models/Product');
const Material = require('../models/Material');
const Production = require('../models/Production');
const MaterialUsage = require('../models/MaterialUsage');
const StockMovement = require('../models/StockMovement');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const clearData = async () => {
  try {
    await connectDB();
    console.log('Menghapus data...');
    
    await Product.deleteMany({});
    await Material.deleteMany({});
    await Production.deleteMany({});
    await MaterialUsage.deleteMany({});
    await StockMovement.deleteMany({});
    await Transaction.deleteMany({});
    
    // Hapus user selain admin dan kasir
    await User.deleteMany({ username: { $nin: ['admin', 'kasir'] } });

    console.log('Data berhasil dihapus! (Admin dan Kasir tetap aman).');
    process.exit(0);
  } catch (error) {
    console.error('Gagal menghapus data:', error);
    process.exit(1);
  }
}

clearData();
