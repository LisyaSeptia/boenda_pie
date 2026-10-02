const mongoose = require('mongoose');

const materialUsageSchema = new mongoose.Schema(
  {
    productionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Production',
      default: null
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Bahan baku wajib dipilih']
    },
    materialName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Jumlah penggunaan wajib diisi'],
      min: [0.01, 'Jumlah penggunaan harus lebih dari 0']
    },
    unit: {
      type: String,
      required: true
    },
    usageDate: {
      type: Date,
      default: Date.now
    },
    purpose: {
      type: String,
      required: [true, 'Keterangan/Tujuan penggunaan wajib diisi']
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

module.exports = mongoose.model('MaterialUsage', materialUsageSchema);
