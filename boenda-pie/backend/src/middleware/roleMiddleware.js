const { errorResponse } = require('../utils/responseHandler');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Autentikasi diperlukan');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Akses ditolak. Peran '${req.user.role}' tidak memiliki izin untuk akses modul ini`
      );
    }

    next();
  };
};

module.exports = { authorize };
