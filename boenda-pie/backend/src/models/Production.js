const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema(
  {
    productionNumber: {
      type: String,
      required: true,
      unique: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Produk wajib dipilih']
    },
    quantity: {
      type: Number,
      required: [true, 'Jumlah produksi wajib diisi'],
      min: [1, 'Jumlah produksi minimal 1']
    },
    materialsUsed: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
          required: true
        },
        materialName: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [0.01, 'Jumlah pemakaian bahan harus lebih dari 0']
        },
        unit: {
          type: String,
          required: true
        }
      }
    ],
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

module.exports = mongoose.model('Production', productionSchema);
