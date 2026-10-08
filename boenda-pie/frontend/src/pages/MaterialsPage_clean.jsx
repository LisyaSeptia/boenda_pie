import React, { useEffect, useState } from 'react';
import { materialService } from '../services/materialService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { Plus, Search, Edit3, Trash2, Wheat, AlertTriangle, BellRing, X, CalendarX2, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper: hitung selisih hari dari sekarang
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
};

// Format tanggal ke "DD MMM YYYY"
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

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
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    stock: '',
    unit: 'kg',
    minStock: '1',
    description: '',
    expiryDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedOutOfStockBB, setDismissedOutOfStockBB] = useState(false);
  const [dismissedOutOfStockBK, setDismissedOutOfStockBK] = useState(false);
  const [dismissedLowStockBB, setDismissedLowStockBB] = useState(false);
  const [dismissedLowStockBK, setDismissedLowStockBK] = useState(false);
  const [dismissedExpiry, setDismissedExpiry] = useState(false);

  const outOfStockItems = materials.filter((m) => m.stock === 0 && m.minStock > 0);
  const lowStockItems   = materials.filter((m) => m.stock > 0 && m.stock <= m.minStock && m.minStock > 0);

  // Pisah per kategori untuk banner
  const outOfStockBB  = outOfStockItems.filter((m) => (m.category || 'Bahan Baku') === 'Bahan Baku');
  const outOfStockBK  = outOfStockItems.filter((m) => m.category === 'Bahan Kemasan');
  const lowStockBB    = lowStockItems.filter((m) => (m.category || 'Bahan Baku') === 'Bahan Baku');
  const lowStockBK    = lowStockItems.filter((m) => m.category === 'Bahan Kemasan');

  // Expiry alerts: critical = H-7 atau sudah expired, warning = H-8 s/d H-14
  const expiryItems = materials
    .map((m) => ({ ...m, daysLeft: getDaysUntilExpiry(m.expiryDate) }))
    .filter((m) => m.daysLeft !== null && m.daysLeft <= 14);

  const criticalExpiry = expiryItems.filter((m) => m.daysLeft <= 7);
  const warningExpiry  = expiryItems.filter((m) => m.daysLeft > 7 && m.daysLeft <= 14);

  useEffect(() => {
    fetchMaterials();
    const interval = setInterval(() => fetchMaterials(), 30000);
    return () => clearInterval(interval);
  }, [search]);

  const fetchMaterials = async () => {
    try {
      if (materials.length === 0) setLoading(true);
      const res = await materialService.getAll({ search });
      if (res.success) {
        // Sort: Sudah expired > Habis > Kritis kadaluarsa > Rendah > Warning kadaluarsa > Aman (ada exp) > No expiry
        const sorted = [...res.data].sort((a, b) => {
          const getStatusScore = (item) => {
            const daysLeft = getDaysUntilExpiry(item.expiryDate);
            if (daysLeft !== null && daysLeft < 0) return 0;   // Sudah expired
            if (item.stock === 0) return 1;                     // Habis
            if (daysLeft !== null && daysLeft <= 7) return 2;  // Kritis kadaluarsa
            if (item.stock <= item.minStock && item.minStock > 0) return 3; // Rendah
            if (daysLeft !== null && daysLeft <= 14) return 4; // Warning kadaluarsa
            if (daysLeft !== null) return 5;                    // Ada expiry, aman
            return 6;                                           // Tidak ada expiry (kemasan)
          };
          return getStatusScore(a) - getStatusScore(b);
        });
        setMaterials(sorted);
        if (!search) setCachedData('materials', sorted);
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

    // Cari angka terbesar dari kode MAT yang sudah ada
    let nextNum = 1;
    const matCodes = materials
      .filter((m) => m.code && m.code.startsWith('MAT-'))
      .map((m) => parseInt(m.code.split('-')[1]) || 0);
      
    if (matCodes.length > 0) {
      nextNum = Math.max(...matCodes) + 1;
    }
    const generatedCode = `MAT-${String(nextNum).padStart(3, '0')}`;

    setFormData({
      code: generatedCode,
      name: '',
      category: 'Bahan Baku',
      stock: '',
      unit: 'Kilogram',
      minStock: '',
      description: '',
      expiryDate: ''
    });
    setIsUnitDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material) => {
    setEditMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      category: material.category || 'Bahan Baku',
      stock: material.stock,
      unit: material.unit,
      minStock: material.minStock,
      description: material.description || '',
      expiryDate: material.expiryDate ? new Date(material.expiryDate).toISOString().split('T')[0] : ''
    });
    setIsUnitDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.unit) {
      showToast('Kode, Nama bahan, dan Satuan wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, expiryDate: formData.expiryDate || null };
      if (editMaterial) {
        await materialService.update(editMaterial._id, payload);
        showToast('Data bahan berhasil diperbarui');
      } else {
        await materialService.create(payload);
        showToast('Data bahan baru berhasil ditambahkan');
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
      showToast('Data bahan berhasil dihapus');
      setDeleteId(null);
      fetchMaterials();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus bahan baku', 'error');
    }
  };

  const bahanBakuUnits = ['Kilogram', 'Gram', 'Liter', 'Mililiter', 'Butir', 'Buah', 'Pieces', 'Pack', 'Botol', 'Bungkus', 'Dus', 'Sachet', 'Roll'];
  const bahanKemasanUnits = ['Pieces', 'Pack', 'Dus', 'Lembar', 'Batang', 'Roll', 'Meter', 'Set', 'Botol', 'Bungkus', 'Sachet'];
  const units = formData.category === 'Bahan Kemasan' ? bahanKemasanUnits : bahanBakuUnits;

  // Render badge kadaluarsa (kotak berwarna)
  const renderExpiryBadge = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return <span className="text-slate-400 text-[11px]">-</span>;
    if (days < 0)   return <span style={{ background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>❌ Sudah kadaluarsa!</span>;
    if (days === 0) return <span style={{ background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>❌ Kadaluarsa hari ini!</span>;
    if (days <= 7)  return <span style={{ background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>🚨 Kadaluarsa dalam {days} hari</span>;
    if (days <= 14) return <span style={{ background:'#fef3c7', color:'#92400e', border:'1px solid #fcd34d', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>⚠️ Kadaluarsa dalam {days} hari</span>;
    return <span style={{ background:'#d1fae5', color:'#065f46', border:'1px solid #6ee7b7', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>Kadaluarsa dalam {days} hari</span>;
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* BANNER: Kritis Kadaluarsa */}
      {!loading && criticalExpiry.length > 0 && !dismissedExpiry && (
        <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '2px solid #fca5a5', borderRadius: 20, padding: '14px 20px', boxShadow: '0 4px 18px rgba(239,68,68,0.15)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fee2e2', border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarX2 style={{ width: 20, height: 20, color: '#b91c1c' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#b91c1c', margin: '0 0 6px' }}>
              🚨 KRITIS! {criticalExpiry.length} bahan hampir/sudah kadaluarsa (≤ 7 hari)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {criticalExpiry.map((item) => (
                <span key={item._id} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {item.name}: <span style={{ fontWeight: 900 }}>{item.daysLeft < 0 ? 'Sudah kadaluarsa!' : item.daysLeft === 0 ? 'Hari ini!' : `H-${item.daysLeft}`}</span>
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissedExpiry(true)} className="btn-dismiss" style={{ color: '#b91c1c' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}

      {/* BANNER: Waspada Kadaluarsa */}
      {!loading && warningExpiry.length > 0 && !dismissedExpiry && (
        <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '2px solid #fcd34d', borderRadius: 20, padding: '14px 20px', boxShadow: '0 4px 18px rgba(251,191,36,0.15)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef9c3', border: '1.5px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock style={{ width: 20, height: 20, color: '#92400e' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 6px' }}>
              ⚠️ Perhatian! {warningExpiry.length} bahan mendekati kadaluarsa (8–14 hari lagi)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {warningExpiry.map((item) => (
                <span key={item._id} style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {item.name}: <span style={{ fontWeight: 900 }}>H-{item.daysLeft}</span> ({formatDate(item.expiryDate)})
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissedExpiry(true)} className="btn-dismiss" style={{ color: '#92400e' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}

      {/* BANNER: Stok Habis - Bahan Baku */}
      {!loading && outOfStockBB.length > 0 && !dismissedOutOfStockBB && (
        <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '2px solid #fca5a5', borderRadius: 20, padding: '14px 20px', boxShadow: '0 4px 18px rgba(239,68,68,0.15)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fee2e2', border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellRing style={{ width: 20, height: 20, color: '#b91c1c' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#b91c1c', margin: '0 0 6px' }}>🚨 Stok Habis! {outOfStockBB.length} <strong>bahan baku</strong> sudah kehabisan stok.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {outOfStockBB.map((item) => (
                <span key={item._id} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {item.name}: <span style={{ fontWeight: 900 }}>HABIS</span>
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissedOutOfStockBB(true)} className="btn-dismiss" style={{ color: '#b91c1c' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}

      {/* BANNER: Stok Habis - Bahan Kemasan */}
      {!loading && outOfStockBK.length > 0 && !dismissedOutOfStockBK && (
        <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '2px solid #fca5a5', borderRadius: 20, padding: '14px 20px', boxShadow: '0 4px 18px rgba(239,68,68,0.15)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fee2e2', border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellRing style={{ width: 20, height: 20, color: '#b91c1c' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#b91c1c', margin: '0 0 6px' }}>🚨 Stok Habis! {outOfStockBK.length} <strong>bahan kemasan</strong> sudah kehabisan stok.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {outOfStockBK.map((item) => (
                <span key={item._id} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {item.name}: <span style={{ fontWeight: 900 }}>HABIS</span>
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissedOutOfStockBK(true)} className="btn-dismiss" style={{ color: '#b91c1c' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}

      {/* BANNER: Stok Rendah - Bahan Baku */}
      {!loading && lowStockBB.length > 0 && !dismissedLowStockBB && (
        <div style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)', border: '2px solid #f5c842', borderRadius: 20, padding: '14px 20px', boxShadow: '0 4px 18px rgba(245,200,0,0.18)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef08a', border: '1.5px solid #f5c842', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellRing style={{ width: 20, height: 20, color: '#92400e' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 6px' }}>⚠️ Stok Rendah! {lowStockBB.length} <strong>bahan baku</strong> hampir habis.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {lowStockBB.map((item) => (
                <span key={item._id} style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {item.name}: <span style={{ color: '#b91c1c', fontWeight: 900 }}>{item.stock} {item.unit}</span> (min. {item.minStock})
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissedLowStockBB(true)} className="btn-dismiss" style={{ color: '#92400e' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}

      {/* BANNER: Stok Rendah - Bahan Kemasan */}
      {!loading && lowStockBK.length > 0 && !dismissedLowStockBK && (
        <div style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)', border: '2px solid #f5c842', borderRadius: 20, padding: '14px 20px', boxShadow: '0 4px 18px rgba(245,200,0,0.18)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef08a', border: '1.5px solid #f5c842', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellRing style={{ width: 20, height: 20, color: '#92400e' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 6px' }}>⚠️ Stok Rendah! {lowStockBK.length} <strong>bahan kemasan</strong> hampir habis.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {lowStockBK.map((item) => (
                <span key={item._id} style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {item.name}: <span style={{ color: '#b91c1c', fontWeight: 900 }}>{item.stock} {item.unit}</span> (min. {item.minStock})
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissedLowStockBK(true)} className="btn-dismiss" style={{ color: '#92400e' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}

      {/* Header Controls */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#e8f7ff', border: '1.5px solid #7dcef5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wheat style={{ width: 22, height: 22, color: '#1a6fa0' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Manajemen Bahan & Kemasan</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Kelola persediaan bahan baku, bahan minuman, dan kemasan Boenda Pie.</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#beeaff] text-[#1a6fa0] border border-[#7dcef5] hover:bg-[#7dcef5] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan</span>
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
          placeholder="Cari nama atau kode bahan..."
          className="w-full bg-white border border-[#beeaff] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#7dcef5] shadow-xs"
        />
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-[#beeaff] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat data bahan & kemasan..." />
        ) : materials.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Wheat className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Tidak ada data bahan ditemukan.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700" style={{ minWidth: 700 }}>
              <thead className="bg-[#e8f7ff] text-[#1a6fa0] font-extrabold border-b-2 border-[#7dcef5] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">Kode</th>
                  <th className="p-4">Nama Bahan</th>
                  <th className="p-4 whitespace-nowrap">Stok</th>
                  <th className="p-4 whitespace-nowrap">Min. Stok</th>
                  <th className="p-4" style={{ minWidth: 220 }}>Kadaluarsa</th>
                  {isAdmin && <th className="p-4 text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((mat) => {
                  const isLow = mat.stock <= mat.minStock && mat.minStock > 0;
                  const isOut = mat.stock === 0;
                  const daysLeft = getDaysUntilExpiry(mat.expiryDate);
                  const rowHighlight = daysLeft !== null && daysLeft <= 7
                    ? 'bg-red-50/40'
                    : daysLeft !== null && daysLeft <= 14
                    ? 'bg-amber-50/30'
                    : '';
                  return (
                    <tr key={mat._id} className={`hover:bg-blue-50/30 transition-colors ${rowHighlight}`}>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{mat.code}</td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{mat.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold mb-1">{mat.category || 'Bahan Baku'}</div>
                        {isOut ? (
                          <span className="text-[10px] font-bold text-red-600">🚨 HABIS</span>
                        ) : isLow ? (
                          <span className="text-[10px] font-bold text-amber-600">⚠️ Stok Rendah</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600">✅ Stok Aman</span>
                        )}
                      </td>
                      <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                        {mat.stock} {mat.unit}
                      </td>
                      <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                        {mat.minStock} {mat.unit}
                      </td>
                      <td className="p-4">
                        {renderExpiryBadge(mat.expiryDate)}
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenEditModal(mat)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Edit Bahan Baku">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(mat._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Bahan Baku">
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
        title={editMaterial ? 'Edit Data Bahan' : 'Tambah Data Bahan Baru'}
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
            <div className="relative">
              <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
              <button
                type="button"
                onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                className="w-full text-left bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5] flex justify-between items-center"
              >
                <span>{formData.unit}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {isUnitDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-36 overflow-y-auto">
                  {units.map((u) => (
                    <div
                      key={u}
                      onClick={() => { setFormData({ ...formData, unit: u }); setIsUnitDropdownOpen(false); }}
                      className={`px-3 py-2 cursor-pointer text-slate-700 hover:bg-[#e8f7ff] ${formData.unit === u ? 'bg-blue-50 font-bold' : ''}`}
                    >
                      {u}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const firstUnit = newCat === 'Bahan Kemasan' ? bahanKemasanUnits[0] : bahanBakuUnits[0];
                  setFormData({ ...formData, category: newCat, unit: firstUnit });
                }}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
              >
                <option value="Bahan Baku">Bahan Baku</option>
                <option value="Bahan Kemasan">Bahan Kemasan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Bahan</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.category === 'Bahan Kemasan' ? "Contoh: Box/Kardus Pie" : "Contoh: Terigu Kunci Biru"}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
              />
            </div>
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
                placeholder="10"
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
                placeholder="2"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#7dcef5]"
              />
            </div>
          </div>

          {/* Tanggal Kadaluarsa - Opsional */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              🗓️ Tanggal Kadaluarsa <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-rose-300 text-slate-700"
            />
            {formData.expiryDate && (() => {
              const d = getDaysUntilExpiry(formData.expiryDate);
              if (d === null) return null;
              if (d < 0)  return <p className="text-[11px] text-red-600 font-bold mt-1">⛔ Tanggal sudah lewat!</p>;
              if (d <= 7) return <p className="text-[11px] text-red-500 font-bold mt-1">🚨 Kritis! Kadaluarsa dalam {d} hari.</p>;
              if (d <= 14) return <p className="text-[11px] text-amber-600 font-bold mt-1">⚠️ Mendekati kadaluarsa dalam {d} hari.</p>;
              return <p className="text-[11px] text-emerald-600 font-semibold mt-1">Kadaluarsa dalam {d} hari (aman)</p>;
            })()}
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
              {isSubmitting ? 'Memproses...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Konfirmasi Hapus Data"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-slate-600 mb-4">
          Apakah Anda yakin ingin menghapus data ini? Stok terkait tidak akan otomatis dikembalikan.
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


