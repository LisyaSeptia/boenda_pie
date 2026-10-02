const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 400, 'Username/Email dan password wajib diisi');
    }

    // Cari user berdasarkan username atau email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return errorResponse(res, 401, 'Username atau password salah');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Username atau password salah');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Akun Anda dinonaktifkan. Hubungi admin.');
    }

    const token = generateToken(user);

    return successResponse(res, 200, 'Login berhasil', {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  return successResponse(res, 200, 'Logout berhasil');
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  return successResponse(res, 200, 'Data profil berhasil diambil', {
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
};

module.exports = {
  login,
  logout,
  getMe
};
