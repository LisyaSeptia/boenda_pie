import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { formatRupiah } from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { Plus, Search, Edit3, Trash2, Package, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState(() => getCachedData('products') || []);
  const [loading, setLoading] = useState(() => !getCachedData('products'));
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
    category: 'Food',
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
      if (products.length === 0) setLoading(true);
      const res = await productService.getAll({
        search,
        category: selectedCategory,
        status: selectedStatus
      });
      if (res.success) {
        setProducts(res.data);
        if (!search && !selectedCategory && !selectedStatus) {
          setCachedData('products', res.data);
        }
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
      category: 'Food',
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

  const categories = ['Food', 'Drink'];

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Top Header Controls */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fffbea', border: '1.5px solid #f5d96b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package style={{ width: 22, height: 22, color: '#8a6000' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Katalog Data Produk</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Kelola varian pie, harga jual, dan batas minimal stok.</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b] hover:bg-[#f9e88a] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a6000] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode produk..."
            className="w-full bg-white border border-[#fcf0c0] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#f5d96b] shadow-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-[#fcf0c0] rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#f5d96b] shadow-xs text-slate-700"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-[#fcf0c0] rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#f5d96b] shadow-xs text-slate-700"
        >
          <option value="">Semua Status Stok</option>
          <option value="AVAILABLE">Tersedia (Aman)</option>
          <option value="LOW_STOCK">Stok Rendah</option>
          <option value="OUT_OF_STOCK">Stok Habis</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#fcf0c0] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat katalog produk..." />
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Tidak ada produk ditemukan.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
              <thead className="bg-[#fffbea] text-[#8a6000] font-extrabold border-b-2 border-[#f5d96b] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">Kode</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4 whitespace-nowrap">Kategori</th>
                  <th className="p-4 whitespace-nowrap">Harga Jual</th>
                  <th className="p-4 whitespace-nowrap">Stok Saat Ini</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  {isAdmin && <th className="p-4 text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{prod.code}</td>
                    <td className="p-4 min-w-[200px]">
                      <div className="font-extrabold text-slate-900">{prod.name}</div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{prod.description || '-'}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg text-[11px] border whitespace-nowrap ${
                        (prod.category || '').toLowerCase() === 'drink'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-pink-50 text-pink-700 border-pink-200'
                      }`}>
                        {prod.category === 'Drink' ? '🥤 Drink' : '🍕 Food'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900 text-sm whitespace-nowrap">
                      {formatRupiah(prod.price)}
                    </td>
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {prod.stock} {prod.unit}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {prod.status === 'AVAILABLE' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold rounded-full whitespace-nowrap">
                          Tersedia
                        </span>
                      )}
                      {prod.status === 'LOW_STOCK' && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold rounded-full whitespace-nowrap">
                          Stok Rendah
                        </span>
                      )}
                      {prod.status === 'OUT_OF_STOCK' && (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold rounded-full whitespace-nowrap">
                          Habis
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-center whitespace-nowrap">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b] uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b]"
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
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b]"
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
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b]"
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
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b]"
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
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b]"
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
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f5d96b]"
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
              className="px-4 py-2 bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b] hover:bg-[#f9e88a] font-extrabold rounded-2xl shadow-xs"
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
