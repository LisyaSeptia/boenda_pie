const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource dengan ID tidak ditemukan: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Data '${field}' dengan nilai '${err.keyValue[field]}' sudah ada (duplikat)`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  console.error('[Centralized Error Handler]:', err);

  return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
