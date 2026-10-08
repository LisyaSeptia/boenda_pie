const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Kode produk wajib diisi'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Kategori produk wajib diisi'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Harga produk wajib diisi'],
      min: [0, 'Harga tidak boleh negatif']
    },
    stock: {
      type: Number,
      required: [true, 'Stok produk wajib diisi'],
      default: 0,
      min: [0, 'Stok tidak boleh negatif']
    },
    minStock: {
      type: Number,
      default: 5,
      min: [0, 'Stok minimum tidak boleh negatif']
    },
    unit: {
      type: String,
      default: 'Pieces'
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'AVAILABLE'
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: '' // Can store base64 string or image URL
    }
  },
  {
    timestamps: true
  }
);

productSchema.pre('save', function (next) {
  if (this.stock <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.stock <= this.minStock) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'AVAILABLE';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
