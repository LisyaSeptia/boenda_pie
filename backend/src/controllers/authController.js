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
      return errorResponse(res, 401, 'Username/Email tidak ditemukan');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Password salah');
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

// @desc    Update user profile name (email & username terkunci permanen untuk login)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    const updatedUser = await user.save();

    return successResponse(res, 200, 'Nama profil berhasil diperbarui', {
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Password lama dan password baru wajib diisi');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'Password baru minimal 6 karakter');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'Pengguna tidak ditemukan');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'Password lama yang dimasukkan tidak cocok');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword
};
