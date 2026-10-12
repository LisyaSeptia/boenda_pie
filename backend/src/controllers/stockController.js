const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Material = require('../models/Material');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get stock movement history
// @route   GET /api/stock/movements
// @access  Private/Admin
const getStockMovements = async (req, res, next) => {
  try {
    const { itemType, type, search, startDate, endDate } = req.query;
    let query = {};

    if (itemType) {
      query.itemType = itemType;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const movements = await StockMovement.find(query)
      .populate('userId', 'name username')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Riwayat pergerakan stok berhasil diambil', movements);
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock items summary (Products & Materials)
// @route   GET /api/stock/summary
// @access  Private/Admin
const getStockSummary = async (req, res, next) => {
  try {
    const products = await Product.find({}).select('code name category stock minStock unit status');
    const materials = await Material.find({}).select('code name stock minStock unit');

    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
    const lowStockMaterials = materials.filter((m) => m.stock <= m.minStock);

    return successResponse(res, 200, 'Ringkasan stok berhasil diambil', {
      totalProducts: products.length,
      totalMaterials: materials.length,
      lowStockProductsCount: lowStockProducts.length,
      lowStockMaterialsCount: lowStockMaterials.length,
      lowStockProducts,
      lowStockMaterials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manual stock adjustment
// @route   POST /api/stock/adjust
// @access  Private/Admin
const adjustStock = async (req, res, next) => {
  try {
    const { itemType, itemId, adjustmentType, quantity, notes } = req.body;

    if (!itemType || !itemId || !adjustmentType || quantity === undefined) {
      return errorResponse(res, 400, 'Data penyesuaian stok tidak lengkap');
    }

    const adjQty = Number(quantity);
    if (isNaN(adjQty) || adjQty <= 0) {
      return errorResponse(res, 400, 'Jumlah penyesuaian harus lebih dari 0');
    }

    let item;
    let itemModelName;
    if (itemType === 'PRODUCT') {
      item = await Product.findById(itemId);
      itemModelName = 'Product';
    } else if (itemType === 'MATERIAL') {
      item = await Material.findById(itemId);
      itemModelName = 'Material';
    } else {
      return errorResponse(res, 400, 'Tipe item tidak valid');
    }

    if (!item) {
      return errorResponse(res, 404, 'Item tidak ditemukan');
    }

    const stockBefore = item.stock;
    let delta = 0;
    let movementType = 'ADJUSTMENT';

    if (adjustmentType === 'IN') {
      delta = adjQty;
      movementType = 'STOCK_IN';
    } else if (adjustmentType === 'OUT') {
      delta = -adjQty;
      movementType = 'STOCK_OUT';
    } else if (adjustmentType === 'SET') {
      delta = adjQty - stockBefore;
      movementType = 'ADJUSTMENT';
    } else {
      return errorResponse(res, 400, 'Tipe adjustment tidak valid (IN, OUT, SET)');
    }

    const stockAfter = stockBefore + delta;
    if (stockAfter < 0) {
      return errorResponse(res, 400, `Stok akhir tidak boleh kurang dari 0. Stok saat ini: ${stockBefore}`);
    }

    item.stock = stockAfter;
    await item.save();

    const movement = await StockMovement.create({
      itemType,
      itemId: item._id,
      itemModel: itemModelName,
      itemName: item.name,
      type: movementType,
      quantity: delta,
      stockBefore,
      stockAfter,
      unit: item.unit,
      notes: notes || 'Penyesuaian stok manual oleh admin',
      userId: req.user._id
    });

    return successResponse(res, 200, 'Penyesuaian stok berhasil disimpan', {
      item,
      movement
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockMovements,
  getStockSummary,
  adjustStock
};
