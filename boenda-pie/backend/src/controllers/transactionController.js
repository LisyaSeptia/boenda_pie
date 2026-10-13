const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Customer = require('../models/Customer');
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
    const { items, payAmount, paymentMethod, packaging, packagingFee, notes, customerName, customerPhone, customerId } = req.body;

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

    const safePackagingFee = Number(packagingFee) || 0;
    calculatedTotal += safePackagingFee;

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

    // Handle Customer Data
    let assignedCustomerId = null;
    let assignedCustomerName = (customerName && customerName.trim()) || 'Umum';
    let assignedCustomerPhone = (customerPhone && customerPhone.trim()) || '';

    if (assignedCustomerName && assignedCustomerName.toLowerCase() !== 'umum') {
      try {
        let existingCust = null;
        if (customerId) {
          existingCust = useTransaction
            ? await Customer.findById(customerId).session(session)
            : await Customer.findById(customerId);
        } else if (assignedCustomerPhone) {
          existingCust = useTransaction
            ? await Customer.findOne({ phone: assignedCustomerPhone }).session(session)
            : await Customer.findOne({ phone: assignedCustomerPhone });
        }

        if (!existingCust) {
          existingCust = useTransaction
            ? await Customer.findOne({ name: { $regex: `^${assignedCustomerName}$`, $options: 'i' } }).session(session)
            : await Customer.findOne({ name: { $regex: `^${assignedCustomerName}$`, $options: 'i' } });
        }

        if (existingCust) {
          assignedCustomerId = existingCust._id;
          assignedCustomerName = existingCust.name;
          if (assignedCustomerPhone && !existingCust.phone) {
            existingCust.phone = assignedCustomerPhone;
          }
          existingCust.totalOrders = (existingCust.totalOrders || 0) + 1;
          existingCust.totalSpent = (existingCust.totalSpent || 0) + calculatedTotal;
          existingCust.lastOrderAt = new Date();
          await existingCust.save(sessionOptions);
          assignedCustomerPhone = existingCust.phone || assignedCustomerPhone;
        } else {
          // Buat Customer Baru
          const newCust = new Customer({
            name: assignedCustomerName,
            phone: assignedCustomerPhone,
            totalOrders: 1,
            totalSpent: calculatedTotal,
            lastOrderAt: new Date()
          });
          await newCust.save(sessionOptions);
          assignedCustomerId = newCust._id;
        }
      } catch (custErr) {
        console.warn('Gagal memproses customer:', custErr);
      }
    }

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
      cashierName: (req.body.cashierName && req.body.cashierName.trim()) || req.user.name || req.user.username,
      customerId: assignedCustomerId,
      customerName: assignedCustomerName,
      customerPhone: assignedCustomerPhone,
      packaging: packaging || 'KERTAS',
      packagingFee: safePackagingFee,
      notes: notes || ''
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
        { cashierName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
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
      .populate('customerId', 'name phone')
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
    const transaction = await Transaction.findById(req.params.id)
      .populate('cashierId', 'name username role')
      .populate('customerId', 'name phone');

    if (!transaction) {
      return errorResponse(res, 404, 'Transaksi tidak ditemukan');
    }

    return successResponse(res, 200, 'Detail transaksi berhasil diambil', transaction);
  } catch (error) {
    next(error);
  }
};

const { sendReceiptViaWhatsApp } = require('../utils/fonnteService');

// @desc    Send receipt to customer WhatsApp via Fonnte API
// @route   POST /api/transactions/send-wa
// @access  Private
const sendWhatsAppReceipt = async (req, res, next) => {
  try {
    const { phone, invoiceNumber, customerName, items, totalAmount, payAmount, changeAmount, cashierName, date, packaging, packagingFee } = req.body;

    if (!phone) {
      return errorResponse(res, 400, 'Nomor HP customer wajib disertakan');
    }

    const formatIdDate = (d) => {
      try {
        const dt = d ? new Date(d) : new Date();
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const day = dt.getDate();
        const month = months[dt.getMonth()];
        const year = dt.getFullYear();
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
      } catch (e) {
        return '-';
      }
    };

    let itemsText = '';
    if (Array.isArray(items)) {
      itemsText = items.map(item => {
        const name = item.productName || item.name || 'Produk';
        const qty = item.quantity || 1;
        const price = (item.price || 0).toLocaleString('id-ID');
        const subtotal = (item.subtotal || (item.price * qty) || 0).toLocaleString('id-ID');
        return `*${name}*\n${qty} x Rp ${price}\nRp ${subtotal}`;
      }).join('\n\n');
    }

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const custDisplay = customerName && customerName !== 'Umum' 
      ? `${customerName} (${cleanPhone})` 
      : (cleanPhone || 'Umum');

    const pkgText = (packaging === 'KARDUS' ? 'Kardus' : 'Kertas') +
      (packagingFee > 0 ? ` (+Rp ${(packagingFee).toLocaleString('id-ID')})` : ' (Gratis)');

    const message = 
`🧾 STRUK PEMBAYARAN
═══════════════════════
BOENDA PIE PURWOKERTO
Sokawera, Berkoh, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah
Telp/WA: 08986659534
═══════════════════════

No Invoice: ${invoiceNumber || '-'}
Waktu: ${formatIdDate(date)}
Kasir: ${cashierName || 'Kasir'}
Pembeli: ${custDisplay}
Metode: ${req.body.paymentMethod || 'CASH'}
Packaging: ${pkgText}
------------------------------------------
${itemsText}
------------------------------------------
TOTAL     : Rp ${(Number(totalAmount) || 0).toLocaleString('id-ID')}
BAYAR     : Rp ${(Number(payAmount) || 0).toLocaleString('id-ID')}
KEMBALIAN : Rp ${(Number(changeAmount) || 0).toLocaleString('id-ID')}
------------------------------------------
Terima kasih telah berbelanja di Boenda Pie!
Pie krispi khas Purwokerto favorit keluarga.`;

    const result = await sendReceiptViaWhatsApp({
      target: phone,
      message
    });

    if (result.success) {
      return successResponse(res, 200, result.message, result.data);
    } else {
      return errorResponse(res, 400, result.message, result.data);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  sendWhatsAppReceipt
};
