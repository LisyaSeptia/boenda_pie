const mongoose = require('mongoose');
const Product = require('../models/Product');
const Material = require('../models/Material');
const Production = require('../models/Production');
const MaterialUsage = require('../models/MaterialUsage');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Helper to generate Production Number
const generateProductionNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `PRD-${dateStr}-${randomStr}`;
};

// @desc    Get all production records
// @route   GET /api/productions
// @access  Private/Admin
const getProductions = async (req, res, next) => {
  try {
    const productions = await Production.find()
      .populate('productId', 'name code unit')
      .populate('userId', 'name username')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Daftar riwayat produksi berhasil diambil', productions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single production record by ID
// @route   GET /api/productions/:id
// @access  Private/Admin
const getProductionById = async (req, res, next) => {
  try {
    const production = await Production.findById(req.params.id)
      .populate('productId', 'name code unit category')
      .populate('userId', 'name username');

    if (!production) {
      return errorResponse(res, 404, 'Data produksi tidak ditemukan');
    }

    return successResponse(res, 200, 'Detail produksi berhasil diambil', production);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new production
// @route   POST /api/productions
// @access  Private/Admin
const createProduction = async (req, res, next) => {
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (sessErr) {
    session = null;
    useTransaction = false;
  }

  const sessionOptions = useTransaction ? { session } : {};

  try {
    const { productId, quantity, materialsUsed, notes } = req.body;

    if (!productId || !quantity || !materialsUsed || !Array.isArray(materialsUsed) || materialsUsed.length === 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(res, 400, 'Produk, jumlah produksi, dan bahan yang digunakan wajib diisi');
    }

    const prodQty = Number(quantity);
    if (prodQty <= 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(res, 400, 'Jumlah produksi harus lebih dari 0');
    }

    const product = useTransaction
      ? await Product.findById(productId).session(session)
      : await Product.findById(productId);

    if (!product) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    // Validasi ketersediaan stok seluruh bahan baku terlebih dahulu
    const validatedMaterials = [];
    for (const item of materialsUsed) {
      const { materialId, quantity: usedQty } = item;
      const numUsedQty = Number(usedQty);

      if (!materialId || isNaN(numUsedQty) || numUsedQty <= 0) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(res, 400, 'Data bahan yang digunakan tidak valid');
      }

      const material = useTransaction
        ? await Material.findById(materialId).session(session)
        : await Material.findById(materialId);

      if (!material) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(res, 404, `Bahan baku dengan ID ${materialId} tidak ditemukan`);
      }

      if (material.stock < numUsedQty) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(
          res,
          400,
          `Stok bahan baku '${material.name}' tidak mencukupi. Stok tersedia: ${material.stock} ${material.unit}, dibutuhkan: ${numUsedQty} ${material.unit}`
        );
      }

      validatedMaterials.push({
        material,
        quantity: numUsedQty,
        unit: material.unit
      });
    }

    const productionNumber = generateProductionNumber();

    // 1. Simpan record Production
    const production = new Production({
      productionNumber,
      date: new Date(),
      productId: product._id,
      quantity: prodQty,
      materialsUsed: validatedMaterials.map((m) => ({
        materialId: m.material._id,
        materialName: m.material.name,
        quantity: m.quantity,
        unit: m.unit
      })),
      notes: notes || '',
      userId: req.user._id
    });

    await production.save(sessionOptions);

    // 2. Potong stok bahan baku & buat log pemakaian & stock movement bahan baku
    for (const item of validatedMaterials) {
      const { material, quantity: usedQty, unit } = item;
      const stockBefore = material.stock;
      const stockAfter = stockBefore - usedQty;

      material.stock = stockAfter;
      await material.save(sessionOptions);

      // Record Material Usage
      await MaterialUsage.create(
        [
          {
            productionId: production._id,
            materialId: material._id,
            materialName: material.name,
            quantity: usedQty,
            unit,
            usageDate: new Date(),
            purpose: `Produksi ${prodQty} ${product.unit} ${product.name} (${productionNumber})`,
            userId: req.user._id
          }
        ],
        sessionOptions
      );

      // Record Stock Movement Material
      await StockMovement.create(
        [
          {
            itemType: 'MATERIAL',
            itemId: material._id,
            itemModel: 'Material',
            itemName: material.name,
            type: 'PRODUCTION',
            quantity: -usedQty,
            stockBefore,
            stockAfter,
            unit,
            referenceNo: productionNumber,
            notes: `Digunakan untuk produksi ${product.name}`,
            userId: req.user._id
          }
        ],
        sessionOptions
      );
    }

    // 3. Tambah stok produk & buat stock movement produk
    const prodStockBefore = product.stock;
    const prodStockAfter = prodStockBefore + prodQty;

    product.stock = prodStockAfter;
    await product.save(sessionOptions);

    await StockMovement.create(
      [
        {
          itemType: 'PRODUCT',
          itemId: product._id,
          itemModel: 'Product',
          itemName: product.name,
          type: 'PRODUCTION',
          quantity: prodQty,
          stockBefore: prodStockBefore,
          stockAfter: prodStockAfter,
          unit: product.unit,
          referenceNo: productionNumber,
          notes: `Hasil produksi produk ${product.name}`,
          userId: req.user._id
        }
      ],
      sessionOptions
    );

    if (useTransaction) {
      await session.commitTransaction();
      session.endSession();
    }

    return successResponse(res, 201, 'Proses produksi berhasil dicatat dan stok telah diperbarui', production);
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

module.exports = {
  getProductions,
  getProductionById,
  createProduction
};
