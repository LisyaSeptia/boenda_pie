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

    // Helper konversi satuan ke satuan dasar bahan baku
    const convertToBaseUnit = (qty, fromUnitOrig, toUnitOrig) => {
      let fromUnit = fromUnitOrig.toLowerCase();
      let toUnit = toUnitOrig.toLowerCase();
      if (fromUnit === toUnit) return qty;
      
      // Normalize aliases
      if (fromUnit === 'kilogram') fromUnit = 'kg';
      if (toUnit === 'kilogram') toUnit = 'kg';
      if (fromUnit === 'mililiter') fromUnit = 'ml';
      if (toUnit === 'mililiter') toUnit = 'ml';
      if (fromUnit === 'pieces') fromUnit = 'pcs';
      if (toUnit === 'pieces') toUnit = 'pcs';

      // === BERAT ===
      if (fromUnit === 'gram'  && toUnit === 'kg')    return qty / 1000;
      if (fromUnit === 'kg'    && toUnit === 'gram')  return qty * 1000;
      // Sendok
      if (fromUnit === 'sdm'   && toUnit === 'kg')    return (qty * 15) / 1000;
      if (fromUnit === 'sdm'   && toUnit === 'gram')  return qty * 15;
      if (fromUnit === 'sdt'   && toUnit === 'kg')    return (qty * 5) / 1000;
      if (fromUnit === 'sdt'   && toUnit === 'gram')  return qty * 5;
      // === VOLUME ===
      if (fromUnit === 'ml'    && toUnit === 'liter') return qty / 1000;
      if (fromUnit === 'liter' && toUnit === 'ml')    return qty * 1000;
      // === BOTOL: asumsi 1 botol = 600 ml ===
      if (fromUnit === 'ml'    && toUnit === 'botol') return qty / 600;
      if (fromUnit === 'liter' && toUnit === 'botol') return qty / 0.6;
      // === DUS: asumsi 1 dus = 12 pcs ===
      if (fromUnit === 'pcs'   && toUnit === 'dus')   return qty / 12;
      if (fromUnit === 'dus'   && toUnit === 'pcs')   return qty * 12;
      // === PACK: asumsi 1 pack = 100 gram sprinkle ===
      if (fromUnit === 'gram'  && toUnit === 'pack')  return qty / 100;
      // Tidak dikenali → langsung
      return qty;
    };

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

      // Konversi jumlah ke satuan dasar bahan baku
      const usedUnit    = item.usedUnit || material.unit;
      const convertedQty = convertToBaseUnit(numUsedQty, usedUnit, material.unit);

      if (material.stock < convertedQty) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(
          res,
          400,
          `Stok bahan baku '${material.name}' tidak mencukupi. Stok tersedia: ${material.stock} ${material.unit}, dibutuhkan: ${convertedQty.toFixed(4)} ${material.unit} (${numUsedQty} ${usedUnit})`
        );
      }

      validatedMaterials.push({
        material,
        quantity: convertedQty,          // nilai yg akan dipotong (sudah dikonversi)
        displayQty: numUsedQty,          // nilai yang diinput user
        usedUnit,                        // satuan yang diinput user
        unit: material.unit              // satuan dasar bahan baku
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
        quantity: m.quantity,            // jumlah terkonversi (satuan dasar)
        displayQty: m.displayQty,        // jumlah input user
        usedUnit: m.usedUnit,            // satuan input user
        unit: m.unit                     // satuan dasar
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
            purpose: `Produksi ${prodQty} ${product.unit} ${product.name} (${productionNumber}) — input: ${item.displayQty} ${item.usedUnit}`,
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

// @desc    Delete production (Revert stock)
// @route   DELETE /api/productions/:id
// @access  Private/Admin
const deleteProduction = async (req, res, next) => {
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
    const production = useTransaction
      ? await Production.findById(req.params.id).session(session)
      : await Production.findById(req.params.id);

    if (!production) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(res, 404, 'Data produksi tidak ditemukan');
    }

    // 1. Kurangi stok produk yang dihasilkan
    const product = useTransaction
      ? await Product.findById(production.productId).session(session)
      : await Product.findById(production.productId);
    
    if (product) {
      product.stock -= production.quantity;
      await product.save(sessionOptions);
    }

    // 2. Kembalikan stok bahan baku
    for (const item of production.materialsUsed) {
      const material = useTransaction
        ? await Material.findById(item.materialId).session(session)
        : await Material.findById(item.materialId);

      if (material) {
        material.stock += item.quantity;
        await material.save(sessionOptions);
      }
    }

    // 3. Hapus StockMovements dan MaterialUsages terkait produksi ini
    if (useTransaction) {
      await StockMovement.deleteMany({ referenceId: production._id }).session(session);
      await MaterialUsage.deleteMany({ productionId: production._id }).session(session);
      await Production.findByIdAndDelete(production._id).session(session);
      
      await session.commitTransaction();
      session.endSession();
    } else {
      await StockMovement.deleteMany({ referenceId: production._id });
      await MaterialUsage.deleteMany({ productionId: production._id });
      await Production.findByIdAndDelete(production._id);
    }

    return successResponse(res, 200, 'Produksi berhasil dihapus dan stok dikembalikan');
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
  createProduction,
  deleteProduction
};
