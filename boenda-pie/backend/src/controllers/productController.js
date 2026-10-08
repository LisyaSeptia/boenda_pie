const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Daftar produk berhasil diambil', products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }
    return successResponse(res, 200, 'Detail produk berhasil diambil', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
  const createProduct = async (req, res, next) => {
  try {
    const { code, name, category, price, stock, minStock, unit, description, image } = req.body;

    if (!code || !name || !category || price === undefined) {
      return errorResponse(res, 400, 'Kode, nama, kategori, dan harga wajib diisi');
    }

    const existingProduct = await Product.findOne({ code: code.toUpperCase() });
    if (existingProduct) {
      return errorResponse(res, 400, `Produk dengan kode '${code}' sudah ada`);
    }

    const initialStock = Number(stock) || 0;

    const product = new Product({
      code: code.toUpperCase(),
      name,
      category,
      price: Number(price),
      stock: initialStock,
      minStock: minStock !== undefined ? Number(minStock) : 5,
      unit: unit || 'pcs',
      description: description || '',
      image: image || ''
    });

    await product.save();

    // Catat stock movement jika stok awal > 0
    if (initialStock > 0) {
      await StockMovement.create({
        itemType: 'PRODUCT',
        itemId: product._id,
        itemModel: 'Product',
        itemName: product.name,
        type: 'STOCK_IN',
        quantity: initialStock,
        stockBefore: 0,
        stockAfter: initialStock,
        unit: product.unit,
        notes: 'Stok awal pendaftaran produk baru',
        userId: req.user._id
      });
    }

    return successResponse(res, 201, 'Produk berhasil ditambahkan', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, minStock, unit, description, image } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    const oldStock = product.stock;

    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (minStock !== undefined) product.minStock = Number(minStock);
    if (unit) product.unit = unit;
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;

    // Jika stok di-update secara eksplisit via edit produk
    if (stock !== undefined && Number(stock) !== oldStock) {
      const newStock = Number(stock);
      const diff = newStock - oldStock;
      product.stock = newStock;

      await StockMovement.create({
        itemType: 'PRODUCT',
        itemId: product._id,
        itemModel: 'Product',
        itemName: product.name,
        type: 'ADJUSTMENT',
        quantity: diff,
        stockBefore: oldStock,
        stockAfter: newStock,
        unit: product.unit,
        notes: 'Penyesuaian stok manual via edit produk',
        userId: req.user._id
      });
    }

    await product.save();

    return successResponse(res, 200, 'Produk berhasil diperbarui', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    await Product.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Produk berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
