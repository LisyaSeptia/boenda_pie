import React, { useEffect, useState } from 'react';
import { materialService } from '../services/materialService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { Plus, Search, Edit3, Trash2, Wheat, AlertTriangle, BellRing, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MaterialsPage = () => {
  const { isAdmin } = useAuth();
  const [materials, setMaterials] = useState(() => getCachedData('materials') || []);
  const [loading, setLoading] = useState(() => !getCachedData('materials'));
  const [search, setSearch] = useState('');

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    stock: '',
    unit: 'kg',
    minStock: '1',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  const lowStockItems = materials.filter((m) => m.stock <= m.minStock);

  useEffect(() => {
    fetchMaterials();
  }, [search]);

  const fetchMaterials = async () => {
    try {
      if (materials.length === 0) setLoading(true);
      const res = await materialService.getAll({ search });
      if (res.success) {
        setMaterials(res.data);
        if (!search) setCachedData('materials', res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat bahan baku', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditMaterial(null);
    setFormData({
      code: `MAT-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      stock: '0',
      unit: 'kg',
      minStock: '2',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material) => {
    setEditMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      stock: material.stock,
      unit: material.unit,
      minStock: material.minStock,
      description: material.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.unit) {
      showToast('Kode, Nama bahan baku, dan Satuan wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editMaterial) {
        await materialService.update(editMaterial._id, formData);
        showToast('Bahan baku berhasil diperbarui');
      } else {
        await materialService.create(formData);
        showToast('Bahan baku baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan bahan baku', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await materialService.delete(deleteId);
      showToast('Bahan baku berhasil dihapus');
      setDeleteId(null);
      fetchMaterials();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus bahan baku', 'error');
    }
  };

  const units = ['kg', 'gram', 'liter', 'butir', 'pack', 'botol', 'dus'];

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Low Stock Warning Banner */}
      {!loading && lowStockItems.length > 0 && !dismissedAlert && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)',
            border: '2px solid #f5c842',
            borderRadius: 20,
            padding: '14px 20px',
            boxShadow: '0 4px 18px rgba(245,200,0,0.18)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef08a', border: '1.5px solid #f5c842', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellRing style={{ width: 20, height: 20, color: '#92400e' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 6px' }}>
              ⚠️ Peringatan Stok Rendah! {lowStockItems.length} bahan baku hampir habis.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {lowStockItems.map((item) => (
                <span
                  key={item._id}
                  style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {item.name}: <span style={{ color: '#b91c1c', fontWeight: 900 }}>{item.stock} {item.unit}</span> (min. {item.minStock})
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDismissedAlert(true)}
            style={{ padding: 4, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400e', flexShrink: 0, marginTop: 2 }}
            title="Tutup peringatan"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#e8f7ff', border: '1.5px solid #7dcef5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wheat style={{ width: 22, height: 22, color: '#1a6fa0' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Manajemen Bahan Baku</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Kelola persediaan tepung, margarin, perisa, dan topping Boenda Pie.</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#beeaff] text-[#1a6fa0] border border-[#7dcef5] hover:bg-[#7dcef5] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Baku</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-[#1a6fa0] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau kode bahan baku..."
          className="w-full bg-white border border-[#beeaff] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#7dcef5] shadow-xs"
        />
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-[#beeaff] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar bahan baku..." />
        ) : materials.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Wheat className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Tidak ada bahan baku ditemukan.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
              <thead className="bg-[#e8f7ff] text-[#1a6fa0] font-extrabold border-b-2 border-[#7dcef5] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">Kode</th>
                  <th className="p-4">Nama Bahan Baku</th>
                  <th className="p-4 whitespace-nowrap">Stok Persediaan</th>
                  <th className="p-4 whitespace-nowrap">Stok Minimum</th>
                  <th className="p-4 whitespace-nowrap">Status Indikator</th>
                  {isAdmin && <th className="p-4 text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((mat) => {
                  const isLow = mat.stock <= mat.minStock;
                  return (
                    <tr key={mat._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{mat.code}</td>
                      <td className="p-4 min-w-[200px]">
                        <div className="font-extrabold text-slate-900">{mat.name}</div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{mat.description || '-'}</div>
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm whitespace-nowrap">
                        {mat.stock} {mat.unit}
                      </td>
                      <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                        {mat.minStock} {mat.unit}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-extrabold rounded-full border border-amber-200 whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Stok Rendah
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold rounded-full border border-emerald-200 whitespace-nowrap">
                            Stok Aman
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(mat)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Edit Bahan Baku"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(mat._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Bahan Baku"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMaterial ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Bahan</label>
              <input
                type="text"
                disabled={!!editMaterial}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5] uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Bahan Baku</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Terigu Kunci Biru"
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Saat Ini</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Minimum Alert</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan / Merk</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Catatan spesifikasi bahan..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
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
              className="px-4 py-2 bg-[#beeaff] text-[#1a6fa0] border border-[#7dcef5] hover:bg-[#7dcef5] font-extrabold rounded-2xl shadow-xs"
            >
              {isSubmitting ? 'Memproses...' : 'Simpan Bahan Baku'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Konfirmasi Hapus Bahan Baku"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-slate-600 mb-4">
          Apakah Anda yakin ingin menghapus bahan baku ini?
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

export default MaterialsPage;
