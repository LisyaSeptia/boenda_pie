const Customer = require('../models/Customer');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all customers or search
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { phone: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .sort({ updatedAt: -1, lastOrderAt: -1 })
      .limit(50);

    return successResponse(res, 200, 'Daftar customer berhasil diambil', customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer or get existing
// @route   POST /api/customers
// @access  Private
const createOrGetCustomer = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 400, 'Nama pelanggan wajib diisi');
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone ? phone.trim() : '';

    // Check if customer with same phone (if provided) exists
    let customer = null;
    if (trimmedPhone) {
      customer = await Customer.findOne({ phone: trimmedPhone });
    }

    // If still not found, check by exact name (case-insensitive)
    if (!customer) {
      customer = await Customer.findOne({
        name: { $regex: `^${trimmedName}$`, $options: 'i' }
      });
    }

    if (customer) {
      // Update phone if not set or provided
      if (trimmedPhone && customer.phone !== trimmedPhone) {
        customer.phone = trimmedPhone;
        await customer.save();
      }
      return successResponse(res, 200, 'Data pelanggan ditemukan', customer);
    }

    // Create new customer
    customer = await Customer.create({
      name: trimmedName,
      phone: trimmedPhone
    });

    return successResponse(res, 201, 'Pelanggan baru berhasil ditambahkan', customer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  createOrGetCustomer
};
