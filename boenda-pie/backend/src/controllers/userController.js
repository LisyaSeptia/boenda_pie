const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    return successResponse(res, 200, 'Berhasil mendapatkan data pengguna', users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role, isActive } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return errorResponse(res, 400, 'Username atau Email sudah terdaftar');
    }
    const user = await User.create({ name, username, email, password, role, isActive });
    if (user) {
      return successResponse(res, 201, 'Pengguna berhasil ditambahkan', {
        _id: user._id, name: user.name, username: user.username, email: user.email, role: user.role
      });
    } else {
      return errorResponse(res, 400, 'Data pengguna tidak valid');
    }
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    
    user.name = req.body.name || user.name;
    // Email & Username tetap paten (tidak bisa diubah karena sudah terdaftar)
    user.role = req.body.role || user.role;
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }
    if (req.body.password && req.body.password.trim()) {
      user.password = req.body.password.trim();
    }
    
    const updatedUser = await user.save();
    return successResponse(res, 200, 'Pengguna berhasil diperbarui', {
      _id: updatedUser._id, name: updatedUser.name, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    if (user.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) return errorResponse(res, 400, 'Tidak dapat menghapus admin terakhir');
    }
    await User.deleteOne({ _id: user._id });
    return successResponse(res, 200, 'Pengguna berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
