const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Material = require('../models/Material');
const Production = require('../models/Production');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get Admin Dashboard metrics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardData = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalMaterials = await Material.countDocuments();

    // Alert low stock
    const products = await Product.find();
    const materials = await Material.find();

    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
    const lowStockMaterials = materials.filter((m) => m.stock <= m.minStock);

    // Penjualan hari ini
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTransactions = await Transaction.find({
      date: { $gte: startOfToday, $lte: endOfToday },
      status: 'COMPLETED'
    });

    const totalTodaySales = todayTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTodayTransactions = todayTransactions.length;

    // Transaksi Keseluruhan
    const allCompletedTransactions = await Transaction.find({ status: 'COMPLETED' });
    const grandTotalSales = allCompletedTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const grandTotalTransactions = allCompletedTransactions.length;

    // 5 Transaksi Terbaru
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 200, 'Data dashboard berhasil diambil', {
      totalProducts,
      totalMaterials,
      lowStockProductsCount: lowStockProducts.length,
      lowStockMaterialsCount: lowStockMaterials.length,
      lowStockProducts,
      lowStockMaterials,
      totalTodaySales,
      totalTodayTransactions,
      grandTotalSales,
      grandTotalTransactions,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sales Report by period
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;

    let start = new Date();
    let end = new Date();

    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const day = start.getDay();
      const diffToMonday = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diffToMonday));
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      start = new Date(start.getFullYear(), start.getMonth(), 1, 0, 0, 0);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default 30 hari terakhir
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const transactions = await Transaction.find({
      date: { $gte: start, $lte: end },
      status: 'COMPLETED'
    }).sort({ date: -1 });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSalesMap = {};

    transactions.forEach((tx) => {
      totalRevenue += tx.totalAmount;
      tx.items.forEach((item) => {
        totalItemsSold += item.quantity;
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            quantitySold: 0,
            totalRevenue: 0
          };
        }
        productSalesMap[item.productId].quantitySold += item.quantity;
        productSalesMap[item.productId].totalRevenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSalesMap).sort(
      (a, b) => b.quantitySold - a.quantitySold
    );

    return successResponse(res, 200, 'Laporan penjualan berhasil ditarik', {
      period: period || 'custom',
      startDate: start,
      endDate: end,
      totalTransactions: transactions.length,
      totalRevenue,
      totalItemsSold,
      topProducts,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getSalesReport
};
