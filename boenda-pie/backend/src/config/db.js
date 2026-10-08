const mongoose = require('mongoose');
const dns = require('dns');

// Gunakan Google DNS & Cloudflare untuk resolve MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[DNS Config Warning]:', dnsErr.message);
}

let lastDbError = null;
let retryCount = 0;
const MAX_RETRIES = 5;

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,  // naikkan dari 5s → 15s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 2,
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boenda_pie';

  // Coba koneksi dengan retry otomatis
  while (retryCount < MAX_RETRIES) {
    try {
      const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
      if (retryCount > 0) {
        console.log(`[MongoDB] Retry ke-${retryCount}/${MAX_RETRIES}...`);
      } else {
        console.log(`[MongoDB] Menghubungkan ke: ${maskedUri}`);
      }

      const conn = await mongoose.connect(mongoUri, MONGO_OPTIONS);
      console.log(`[MongoDB Connected] Berhasil: ${conn.connection.host}`);
      lastDbError = null;
      retryCount = 0;

      // Auto-reconnect jika koneksi putus
      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Koneksi terputus. Mencoba reconnect...');
        setTimeout(() => {
          retryCount = 0;
          connectDB();
        }, 3000);
      });

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB Error]:', err.message);
      });

      return conn;
    } catch (error) {
      lastDbError = error.message;
      retryCount++;
      console.warn(`[MongoDB] Gagal (${retryCount}/${MAX_RETRIES}): ${error.message}`);

      if (retryCount < MAX_RETRIES) {
        const delay = retryCount * 2000; // tunggu 2s, 4s, 6s, 8s...
        console.log(`[MongoDB] Coba lagi dalam ${delay / 1000} detik...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  // Fallback: Coba MongoDB Lokal
  if (!mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    try {
      console.log('[MongoDB Fallback] Mencoba MongoDB Lokal (127.0.0.1:27017)...');
      const connLocal = await mongoose.connect('mongodb://127.0.0.1:27017/boenda_pie', {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('[MongoDB Connected Local] Berhasil terhubung ke MongoDB Lokal!');
      lastDbError = null;
      return connLocal;
    } catch (localErr) {
      console.warn(`[MongoDB Local Failed]: ${localErr.message}`);
    }
  }

  console.error('================================================================');
  console.error('  [PERINGATAN] Gagal terhubung ke database setelah 5x percobaan!');
  console.error(`  Detail: ${lastDbError}`);
  console.error('  Periksa koneksi internet atau konfigurasi Atlas.');
  console.error('================================================================');
};

const getDbError = () => lastDbError;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getDbError = getDbError;
