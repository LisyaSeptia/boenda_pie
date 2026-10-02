const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Material = require('../models/Material');
const Production = require('../models/Production');
const MaterialUsage = require('../models/MaterialUsage');
const StockMovement = require('../models/StockMovement');
const Transaction = require('../models/Transaction');

const seedDataInternal = async () => {
  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany({});
  await Product.deleteMany({});
  await Material.deleteMany({});
  await Production.deleteMany({});
  await MaterialUsage.deleteMany({});
  await StockMovement.deleteMany({});
  await Transaction.deleteMany({});

  console.log('[Seed] Creating Users (Admin & Kasir)...');
  const adminUser = await User.create({
    username: 'admin',
    email: 'admin@boendapie.com',
    password: 'admin123',
    name: 'Admin Boenda Pie',
    role: 'ADMIN',
    isActive: true
  });

  const kasirUser = await User.create({
    username: 'kasir',
    email: 'kasir@boendapie.com',
    password: 'kasir123',
    name: 'Kasir Boenda Pie',
    role: 'KASIR',
    isActive: true
  });

  console.log('[Seed] Creating Materials...');
  const materialsData = [
    { code: 'MAT-001', name: 'Terigu Kunci Biru', stock: 50, unit: 'kg', minStock: 10, description: 'Tepung terigu protein rendah' },
    { code: 'MAT-002', name: 'Terigu Segitiga', stock: 40, unit: 'kg', minStock: 10, description: 'Tepung terigu protein sedang' },
    { code: 'MAT-003', name: 'Margarin', stock: 30, unit: 'kg', minStock: 5, description: 'Margarin kue kualitas premium' },
    { code: 'MAT-004', name: 'Gula Halus', stock: 25, unit: 'kg', minStock: 5, description: 'Gula halus pelembut adonan' },
    { code: 'MAT-005', name: 'Telur', stock: 200, unit: 'butir', minStock: 30, description: 'Telur ayam segar' },
    { code: 'MAT-006', name: 'Susu Bubuk', stock: 15, unit: 'kg', minStock: 3, description: 'Susu bubuk beverage' },
    { code: 'MAT-007', name: 'Perisa Taro', stock: 5, unit: 'botol', minStock: 2, description: 'Perisa rasa taro' },
    { code: 'MAT-008', name: 'Perisa Red Velvet', stock: 5, unit: 'botol', minStock: 2, description: 'Perisa rasa red velvet' },
    { code: 'MAT-009', name: 'Perisa Matcha', stock: 5, unit: 'botol', minStock: 2, description: 'Perisa rasa matcha' },
    { code: 'MAT-010', name: 'Cokelat Bubuk', stock: 10, unit: 'kg', minStock: 2, description: 'Cokelat murni bubuk' },
    { code: 'MAT-011', name: 'Cokelat Blok', stock: 15, unit: 'kg', minStock: 3, description: 'Cokelat batangan compound' },
    { code: 'MAT-012', name: 'Sprinkle', stock: 10, unit: 'pack', minStock: 2, description: 'Hiasan meises sprinkle warna-warni' },
    { code: 'MAT-013', name: 'Chocochips', stock: 8, unit: 'kg', minStock: 2, description: 'Cokelat chip mini' },
    { code: 'MAT-014', name: 'Sokade', stock: 6, unit: 'kg', minStock: 2, description: 'Manisan buah sokade' },
    { code: 'MAT-015', name: 'Selai Nanas', stock: 12, unit: 'kg', minStock: 3, description: 'Selai olahan nanas' },
    { code: 'MAT-016', name: 'Selai Strawberry', stock: 10, unit: 'kg', minStock: 3, description: 'Selai olahan strawberry' }
  ];

  const insertedMaterials = await Material.insertMany(materialsData);

  for (const mat of insertedMaterials) {
    await StockMovement.create({
      itemType: 'MATERIAL',
      itemId: mat._id,
      itemModel: 'Material',
      itemName: mat.name,
      type: 'STOCK_IN',
      quantity: mat.stock,
      stockBefore: 0,
      stockAfter: mat.stock,
      unit: mat.unit,
      notes: 'Stok awal data seed',
      userId: adminUser._id
    });
  }

  console.log('[Seed] Creating Products...');
  const productsData = [
    { code: 'PIE-001', name: 'Pie Nanas', category: 'Food', price: 2000, stock: 100, minStock: 20, unit: 'pcs', description: 'Kulit pie renyah dipadukan dengan selai nanas manis-asam segar yang lumer di mulut' },
    { code: 'PIE-002', name: 'Pie Strawberry', category: 'Food', price: 2000, stock: 80, minStock: 15, unit: 'pcs', description: 'Sentuhan manis dan asam segar dari buah stroberi pilihan di atas kulit pie yang gurih' },
    { code: 'PIE-003', name: 'Pie Choco Brownie', category: 'Food', price: 2000, stock: 75, minStock: 15, unit: 'pcs', description: 'Kombinasi unik renyahnya kulit pie dan lembutnya rasa cokelat pekat khas brownie' },
    { code: 'PIE-004', name: 'Pie Matcha', category: 'Food', price: 2000, stock: 50, minStock: 10, unit: 'pcs', description: 'Kulit pie renyah dipadukan dengan isian beraroma teh hijau (matcha) yang lembut dan menenangkan' },
    { code: 'PIE-005', name: 'Pie Red Velvet', category: 'Food', price: 2000, stock: 40, minStock: 10, unit: 'pcs', description: 'Kelezatan rasa red velvet yang manis, gurih, dan khas dengan warna merah menggoda' },
    { code: 'PIE-006', name: 'Pie Taro', category: 'Food', price: 2000, stock: 60, minStock: 10, unit: 'pcs', description: 'Sensasi rasa talas (taro) yang manis, creamy, dan beraroma harum di setiap gigitan' },
    { code: 'JUS-007', name: 'Jus Tapai Singkong', category: 'Drink', price: 5000, stock: 45, minStock: 10, unit: 'pcs', description: 'Minuman olahan tapai singkong yang lembut, kental, dengan rasa manis-asam unik yang menyegarkan' },
    { code: 'JUS-008', name: 'Jus Jambu Biji', category: 'Drink', price: 5000, stock: 3, minStock: 10, unit: 'pcs', description: 'Kesegaran alami jambu biji merah pilihan yang kental, manis, dan kaya vitamin C' },
    { code: 'JUS-009', name: 'Jus Naga', category: 'Drink', price: 5000, stock: 3, minStock: 10, unit: 'pcs', description: 'Kesegaran warna merah alami buah naga yang kaya nutrisi, manis, dan menyehatkan' },
    { code: 'JUS-010', name: 'Jus Mangga', category: 'Drink', price: 5000, stock: 3, minStock: 10, unit: 'pcs', description: 'Minuman kental dengan kenikmatan rasa manis tropis alami dari buah mangga segar' },
    { code: 'JUS-011', name: 'Jus Jeruk', category: 'Drink', price: 5000, stock: 3, minStock: 10, unit: 'pcs', description: 'Ekstrak jeruk segar yang kaya rasa manis-asam alami, cocok untuk mendinginkan dan menyegarkan hari Anda' },
  ];

  const insertedProducts = await Product.insertMany(productsData);

  for (const prod of insertedProducts) {
    await StockMovement.create({
      itemType: 'PRODUCT',
      itemId: prod._id,
      itemModel: 'Product',
      itemName: prod.name,
      type: 'STOCK_IN',
      quantity: prod.stock,
      stockBefore: 0,
      stockAfter: prod.stock,
      unit: prod.unit,
      notes: 'Stok awal data seed',
      userId: adminUser._id
    });
  }

  console.log('[Seed] Creating Sample Transactions...');
  const sampleProduct1 = insertedProducts[0];
  const sampleProduct2 = insertedProducts[1];

  const item1Qty = 10;
  const item2Qty = 5;
  const sub1 = sampleProduct1.price * item1Qty;
  const sub2 = sampleProduct2.price * item2Qty;
  const totalSample = sub1 + sub2;

  await Transaction.create({
    invoiceNumber: 'TRX-20261002-1001',
    date: new Date(),
    items: [
      {
        productId: sampleProduct1._id,
        productName: sampleProduct1.name,
        price: sampleProduct1.price,
        quantity: item1Qty,
        subtotal: sub1
      },
      {
        productId: sampleProduct2._id,
        productName: sampleProduct2.name,
        price: sampleProduct2.price,
        quantity: item2Qty,
        subtotal: sub2
      }
    ],
    totalAmount: totalSample,
    payAmount: 50000,
    changeAmount: 10000,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    cashierId: kasirUser._id,
    cashierName: kasirUser.name
  });

  console.log('[Seed] Database seeding finished successfully!');
};

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seed] Database is empty. Automatically initializing default seed data (Users, Products, Materials)...');
      await seedDataInternal();
      console.log('[Auto-Seed] Done!');
    } else {
      console.log(`[Auto-Seed] Database already contains ${userCount} users. Skipping auto-seed.`);
    }
  } catch (error) {
    console.error('[Auto-Seed Error]:', error.message);
  }
};

const seedDataScript = async () => {
  try {
    const connectDB = require('../config/db');
    await connectDB();
    await seedDataInternal();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Script Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDataScript();
}

module.exports = {
  seedDataInternal,
  autoSeedIfEmpty
};
