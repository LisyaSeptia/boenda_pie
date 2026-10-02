import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { formatRupiah } from '../utils/formatters';
import { Plus, Search, Edit3, Trash2, Package, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Pie Susu',
    price: '',
    stock: '',
    minStock: '5',
    unit: 'pcs',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({
        search,
        category: selectedCategory,
        status: selectedStatus
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat daftar produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditProduct(null);
    setFormData({
      code: `PIE-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Pie Susu',
      price: '',
      stock: '0',
      minStock: '5',
      unit: 'pcs',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || formData.price === '') {
      showToast('Kode, Nama produk, dan Harga wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editProduct) {
        await productService.update(editProduct._id, formData);
        showToast('Produk berhasil diperbarui');
      } else {
        await productService.create(formData);
        showToast('Produk baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan produk', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.delete(deleteId);
      showToast('Produk berhasil dihapus');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus produk', 'error');
    }
  };

  const categories = ['Pie Susu', 'Pie Special', 'Pie Flavor', 'Kue Lainnya'];

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Katalog Data Produk</h2>
          <p className="text-xs text-slate-500">Kelola varian pie, harga jual, dan batas minimal stok.</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode produk..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-amber-500 shadow-xs text-slate-700"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-amber-500 shadow-xs text-slate-700"
        >
          <option value="">Semua Status Stok</option>
          <option value="AVAILABLE">Tersedia (Aman)</option>
          <option value="LOW_STOCK">Stok Rendah</option>
          <option value="OUT_OF_STOCK">Stok Habis</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat katalog produk..." />
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Tidak ada produk ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-4">Kode</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Stok Saat Ini</th>
                  <th className="p-4">Status</th>
                  {isAdmin && <th className="p-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{prod.code}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">{prod.description || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 font-medium rounded-lg text-[11px]">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-amber-700 text-sm">
                      {formatRupiah(prod.price)}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {prod.stock} {prod.unit}
                    </td>
                    <td className="p-4">
                      {prod.status === 'AVAILABLE' && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                          Tersedia
                        </span>
                      )}
                      {prod.status === 'LOW_STOCK' && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                          Stok Rendah
                        </span>
                      )}
                      {prod.status === 'OUT_OF_STOCK' && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full">
                          Habis
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(prod._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Produk</label>
              <input
                type="text"
                disabled={!!editProduct}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500 uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Produk</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Pie Susu Original"
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Produk</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Minimum</label>
              <input
                type="number"
                min="0"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Ringkas</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Keterangan varian pie..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Memproses...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Konfirmasi Hapus Produk"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-slate-600 mb-4">
          Apakah Anda yakin ingin menghapus produk ini secara permanen? Data yang sudah dihapus tidak dapat dikembalikan.
        </p>
        <div className="flex justify-end gap-3 text-xs">
          <button
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
          >
            Hapus Permanen
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;
