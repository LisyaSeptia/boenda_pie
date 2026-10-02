const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Helper to generate Invoice Number
const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${dateStr}-${randomStr}`;
};

// @desc    Create new transaction (POS Checkout)
// @route   POST /api/transactions
// @access  Private (Admin & Kasir)
const createTransaction = async (req, res, next) => {
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
    const { items, payAmount, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(res, 400, 'Keranjang belanja tidak boleh kosong');
    }

    const numPayAmount = Number(payAmount);
    if (isNaN(numPayAmount) || numPayAmount <= 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(res, 400, 'Nominal pembayaran tidak valid');
    }

    let calculatedTotal = 0;
    const transactionItems = [];
    const productsToUpdate = [];

    // Validasi produk dan kecukupan stok
    for (const item of items) {
      const { productId, quantity } = item;
      const numQty = Number(quantity);

      if (!productId || isNaN(numQty) || numQty <= 0) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(res, 400, 'Data produk keranjang tidak valid');
      }

      const product = useTransaction
        ? await Product.findById(productId).session(session)
        : await Product.findById(productId);

      if (!product) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(res, 404, `Produk dengan ID ${productId} tidak ditemukan`);
      }

      if (product.stock < numQty) {
        if (useTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return errorResponse(
          res,
          400,
          `Stok produk '${product.name}' tidak mencukupi. Stok tersedia: ${product.stock}, diminta: ${numQty}`
        );
      }

      const subtotal = product.price * numQty;
      calculatedTotal += subtotal;

      transactionItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: numQty,
        subtotal
      });

      productsToUpdate.push({
        product,
        quantity: numQty
      });
    }

    if (numPayAmount < calculatedTotal) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return errorResponse(
        res,
        400,
        `Pembayaran (${numPayAmount.toLocaleString('id-ID')}) kurang dari total belanja (${calculatedTotal.toLocaleString('id-ID')})`
      );
    }

    const changeAmount = numPayAmount - calculatedTotal;
    const invoiceNumber = generateInvoiceNumber();

    // 1. Simpan Transaksi
    const transaction = new Transaction({
      invoiceNumber,
      date: new Date(),
      items: transactionItems,
      totalAmount: calculatedTotal,
      payAmount: numPayAmount,
      changeAmount,
      paymentMethod: paymentMethod || 'CASH',
      status: 'COMPLETED',
      cashierId: req.user._id,
      cashierName: req.user.name || req.user.username
    });

    await transaction.save(sessionOptions);

    // 2. Kurangi stok produk & buat Stock Movement
    for (const item of productsToUpdate) {
      const { product, quantity: soldQty } = item;
      const stockBefore = product.stock;
      const stockAfter = stockBefore - soldQty;

      product.stock = stockAfter;
      await product.save(sessionOptions);

      await StockMovement.create(
        [
          {
            itemType: 'PRODUCT',
            itemId: product._id,
            itemModel: 'Product',
            itemName: product.name,
            type: 'SALE',
            quantity: -soldQty,
            stockBefore,
            stockAfter,
            unit: product.unit,
            referenceNo: invoiceNumber,
            notes: `Penjualan kasir (${transaction.invoiceNumber})`,
            userId: req.user._id
          }
        ],
        sessionOptions
      );
    }

    if (useTransaction) {
      await session.commitTransaction();
      session.endSession();
    }

    return successResponse(res, 201, 'Transaksi berhasil disimpan', transaction);
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

// @desc    Get transactions list
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, search, cashierId } = req.query;
    let query = {};

    // Jika Kasir, secara opsional bisa dibatasi atau melihat histori
    if (cashierId) {
      query.cashierId = cashierId;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { cashierName: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query)
      .populate('cashierId', 'name username role')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Daftar transaksi berhasil diambil', transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction details
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      'cashierId',
      'name username role'
    );

    if (!transaction) {
      return errorResponse(res, 404, 'Transaksi tidak ditemukan');
    }

    return successResponse(res, 200, 'Detail transaksi berhasil diambil', transaction);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById
};
