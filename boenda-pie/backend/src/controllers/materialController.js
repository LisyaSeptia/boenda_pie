const Material = require('../models/Material');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const materials = await Material.find(query).sort({ name: 1 });

    return successResponse(res, 200, 'Daftar bahan baku berhasil diambil', materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material by ID
// @route   GET /api/materials/:id
// @access  Private
const getMaterialById = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return errorResponse(res, 404, 'Bahan baku tidak ditemukan');
    }
    return successResponse(res, 200, 'Detail bahan baku berhasil diambil', material);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = async (req, res, next) => {
  try {
    const { code, name, stock, unit, minStock, description } = req.body;

    if (!code || !name || !unit) {
      return errorResponse(res, 400, 'Kode, nama, dan satuan wajib diisi');
    }

    const existingMaterial = await Material.findOne({ code: code.toUpperCase() });
    if (existingMaterial) {
      return errorResponse(res, 400, `Bahan baku dengan kode '${code}' sudah ada`);
    }

    const initialStock = Number(stock) || 0;

    const material = new Material({
      code: code.toUpperCase(),
      name,
      stock: initialStock,
      unit,
      minStock: minStock !== undefined ? Number(minStock) : 1,
      description: description || ''
    });

    await material.save();

    if (initialStock > 0) {
      await StockMovement.create({
        itemType: 'MATERIAL',
        itemId: material._id,
        itemModel: 'Material',
        itemName: material.name,
        type: 'STOCK_IN',
        quantity: initialStock,
        stockBefore: 0,
        stockAfter: initialStock,
        unit: material.unit,
        notes: 'Stok awal registrasi bahan baku baru',
        userId: req.user._id
      });
    }

    return successResponse(res, 201, 'Bahan baku berhasil ditambahkan', material);
  } catch (error) {
    next(error);
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = async (req, res, next) => {
  try {
    const { name, stock, unit, minStock, description } = req.body;

    const material = await Material.findById(req.params.id);
    if (!material) {
      return errorResponse(res, 404, 'Bahan baku tidak ditemukan');
    }

    const oldStock = material.stock;

    if (name) material.name = name;
    if (unit) material.unit = unit;
    if (minStock !== undefined) material.minStock = Number(minStock);
    if (description !== undefined) material.description = description;

    if (stock !== undefined && Number(stock) !== oldStock) {
      const newStock = Number(stock);
      const diff = newStock - oldStock;
      material.stock = newStock;

      await StockMovement.create({
        itemType: 'MATERIAL',
        itemId: material._id,
        itemModel: 'Material',
        itemName: material.name,
        type: 'ADJUSTMENT',
        quantity: diff,
        stockBefore: oldStock,
        stockAfter: newStock,
        unit: material.unit,
        notes: 'Penyesuaian stok manual bahan baku',
        userId: req.user._id
      });
    }

    await material.save();

    return successResponse(res, 200, 'Bahan baku berhasil diperbarui', material);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return errorResponse(res, 404, 'Bahan baku tidak ditemukan');
    }

    await Material.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Bahan baku berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
