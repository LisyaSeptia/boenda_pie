const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Kode bahan baku wajib diisi'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Nama bahan baku wajib diisi'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Stok bahan baku wajib diisi'],
      default: 0,
      min: [0, 'Stok bahan baku tidak boleh negatif']
    },
    unit: {
      type: String,
      required: [true, 'Satuan bahan baku wajib diisi'],
      trim: true
    },
    minStock: {
      type: Number,
      required: [true, 'Stok minimum wajib diisi'],
      default: 1,
      min: [0, 'Stok minimum tidak boleh negatif']
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Material', materialSchema);
