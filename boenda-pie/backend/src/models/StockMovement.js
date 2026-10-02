const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ['PRODUCT', 'MATERIAL'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel'
    },
    itemModel: {
      type: String,
      enum: ['Product', 'Material'],
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['STOCK_IN', 'STOCK_OUT', 'PRODUCTION', 'SALE', 'ADJUSTMENT'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    stockBefore: {
      type: Number,
      required: true
    },
    stockAfter: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    referenceNo: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
