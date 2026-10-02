const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'boenda_pie_purwokerto_super_secret_jwt_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return errorResponse(res, 401, 'User tidak ditemukan atau sesi telah habis');
      }

      if (!req.user.isActive) {
        return errorResponse(res, 403, 'Akun Anda dinonaktifkan');
      }

      return next();
    } catch (error) {
      console.error('[AuthMiddleware Error]:', error.message);
      return errorResponse(res, 401, 'Token tidak valid atau telah expired');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Akses ditolak, token tidak ditemukan');
  }
};

module.exports = { protect };
