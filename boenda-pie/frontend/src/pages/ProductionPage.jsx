import React, { useEffect, useState, useRef } from 'react';
import { productionService } from '../services/productionService';
import { productService } from '../services/productService';
import { materialService } from '../services/materialService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { formatDate, formatUnit } from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { Plus, Factory, Wheat, Trash2, CheckCircle2, ChevronRight, ChevronDown, Eye, Edit3 } from 'lucide-react';

// [BARU] Satuan disamakan dengan menu Data Bahan & Kemasan
const bahanBakuUnits = ['Kilogram', 'Gram', 'Mililiter', 'Liter'];
const bahanKemasanUnits = ['Pieces', 'Pack', 'Roll'];

// [BARU] Kelompok satuan yang bisa saling dikonversi
const weightUnits = ['Kilogram', 'Gram'];     // 1 Kilogram = 1000 Gram
const volumeUnits = ['Mililiter', 'Liter'];   // 1 Liter = 1000 Mililiter

// [BARU] Samakan penulisan satuan lama (kg, gr, ml, dst.) ke nama satuan standar
const normalizeUnit = (unit = '') => {
  const key = String(unit).trim().toLowerCase();
  const map = {
    kg: 'Kilogram', kilogram: 'Kilogram',
    g: 'Gram', gr: 'Gram', gram: 'Gram',
    ml: 'Mililiter', mililiter: 'Mililiter',
    l: 'Liter', ltr: 'Liter', liter: 'Liter',
  };
  if (map[key]) return map[key];
  const pack = bahanKemasanUnits.find((u) => u.toLowerCase() === key);
  return pack || unit;
};

// [BARU] Dropdown custom: pilihan aktif & hover berwarna pink pastel (senada dengan tema Produksi)
const FilterDropdown = ({ value, onChange, options, buttonClassName, listClassName, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={buttonClassName || 'w-full text-left bg-white border border-[#f8cee8] rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#f0a3d0] font-semibold text-slate-700 flex justify-between items-center gap-2'}
      >
        <span className="truncate">{selected ? selected.label : ''}</span>
        <ChevronDown className={`w-4 h-4 text-[#a0336e] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute z-30 mt-1 bg-white border border-[#f8cee8] rounded-xl shadow-lg max-h-60 overflow-y-auto ${listClassName || 'w-full'}`}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-3 py-2 cursor-pointer text-xs text-slate-700 hover:bg-[#fff0f7] hover:text-[#a0336e] transition-colors ${value === opt.value ? 'bg-[#fff0f7] text-[#a0336e] font-bold border-l-2 border-[#f0a3d0]' : ''}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductionPage = () => {
  const [productions, setProductions] = useState(() => getCachedData('productions') || []);
  const [products, setProducts] = useState(() => getCachedData('prod_products') || []);
  const [materials, setMaterials] = useState(() => getCachedData('prod_materials') || []);
  const [loading, setLoading] = useState(() => !getCachedData('productions'));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailProduction, setDetailProduction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editProductionId, setEditProductionId] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Production Form State
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [materialsUsed, setMaterialsUsed] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      if (productions.length === 0) setLoading(true);
      const [prodRes, pRes, mRes] = await Promise.all([
        productionService.getAll(),
        productService.getAll(),
        materialService.getAll()
      ]);

      if (prodRes.success) {
        setProductions(prodRes.data);
        setCachedData('productions', prodRes.data);
      }
      if (pRes.success) {
        setProducts(pRes.data);
        setCachedData('prod_products', pRes.data);
      }
      if (mRes.success) {
        setMaterials(mRes.data);
        setCachedData('prod_materials', mRes.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat data produksi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenModal = () => {
    setEditProductionId(null);
    setProductId(products.length > 0 ? products[0]._id : '');
    setQuantity('1');
    setNotes('');
    setMaterialsUsed([]); // mulai kosong, user tambah manual
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditProductionId(prod._id);
    setProductId(prod.productId?._id || (products.length > 0 ? products[0]._id : ''));
    setQuantity(String(prod.quantity));
    setNotes(prod.notes || '');
    setMaterialsUsed(prod.materialsUsed.map(m => ({
      materialId: m.materialId,
      quantity: String(m.displayQty || m.quantity),
      usedUnit: normalizeUnit(m.usedUnit || m.unit)
    })));
    setIsModalOpen(true);
  };

  const handleAddMaterialRow = () => {
    if (materials.length === 0) return;
    setMaterialsUsed([
      ...materialsUsed,
      { materialId: materials[0]._id, quantity: '1', usedUnit: normalizeUnit(materials[0].unit) }
    ]);
  };

  const handleRemoveMaterialRow = (index) => {
    setMaterialsUsed(materialsUsed.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materialsUsed];
    updated[index][field] = value;
    // Jika ganti material, reset usedUnit ke satuan dasar bahan baru
    if (field === 'materialId') {
      const newMat = materials.find((m) => m._id === value);
      if (newMat) updated[index].usedUnit = normalizeUnit(newMat.unit);
    }
    setMaterialsUsed(updated);
  };

  // [DIUBAH] Daftar satuan yang bisa dipilih berdasarkan satuan dasar bahan.
  // Mengikuti satuan di Data Bahan & Kemasan:
  //   - Kilogram / Gram       -> boleh pilih Kilogram atau Gram   (1 kg = 1000 gram)
  //   - Mililiter / Liter     -> boleh pilih Mililiter atau Liter (1 liter = 1000 ml)
  //   - Pieces / Pack / Roll  -> hanya satuannya sendiri (tidak ada konversi)
  const getCompatibleUnits = (baseUnit = '') => {
    const normalized = normalizeUnit(baseUnit);
    if (weightUnits.includes(normalized)) return weightUnits;
    if (volumeUnits.includes(normalized)) return volumeUnits;
    return [normalized || baseUnit];
  };

  // Konversi di frontend hanya untuk preview label
  const getUnitLabel = (usedUnit, baseUnit) => {
    if (usedUnit === baseUnit) return baseUnit;
    return `${usedUnit} → ${baseUnit}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || materialsUsed.length === 0) {
      showToast('Pilih produk, jumlah produksi, dan minimal 1 bahan baku', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productId,
        quantity: Number(quantity),
        materialsUsed: materialsUsed.map((m) => ({
          materialId: m.materialId,
          quantity: Number(m.quantity),
          usedUnit: m.usedUnit
        })),
        notes
      };

      if (editProductionId) {
        await productionService.delete(editProductionId);
      }

      const res = await productionService.create(payload);
      if (res.success) {
        showToast('Proses produksi berhasil dicatat! Stok produk bertambah & bahan baku telah dikurangi.');
        setIsModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mencatat produksi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      const res = await productionService.delete(deleteId);
      if (res.success) {
        showToast('Data produksi berhasil dihapus, stok dikembalikan.');
        setDeleteId(null);
        fetchInitialData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // [BARU] Pilihan untuk dropdown
  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.name} (Stok Saat Ini: ${p.stock} ${formatUnit(p.unit)})`,
  }));
  const materialOptions = materials.map((m) => ({
    value: m._id,
    label: `${m.name} (Stok: ${m.stock} ${formatUnit(m.unit)})`,
  }));

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Controls */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fff0f7', border: '1.5px solid #f0a3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Factory style={{ width: 22, height: 22, color: '#a0336e' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Pencatatan Produksi &amp; Penggunaan Bahan</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Catat produksi pie & jus. Stok terupdate otomatis.</p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0] hover:bg-[#f3b5db] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Produksi Baru</span>
        </button>
      </div>

      {/* Productions Table */}
      <div className="bg-white rounded-2xl border border-[#f8cee8] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat produksi..." />
        ) : productions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Factory className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Belum ada riwayat produksi recorded.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
              <thead className="bg-[#fff4f9] text-[#a0336e] font-extrabold border-b-2 border-[#f0a3d0] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">No. Produksi</th>
                  <th className="p-4 whitespace-nowrap">Waktu</th>
                  <th className="p-4 whitespace-nowrap">Produk Dihasilkan</th>
                  <th className="p-4 whitespace-nowrap">Jumlah Hasil</th>
                  <th className="p-4">Bahan Baku Digunakan</th>
                  <th className="p-4 text-center whitespace-nowrap">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productions.map((prod) => (
                  <tr key={prod._id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{prod.productionNumber}</td>
                    <td className="p-4 text-slate-600 font-medium whitespace-nowrap">{formatDate(prod.date)}</td>
                    <td className="p-4 font-extrabold text-slate-900 min-w-[160px]">
                      {prod.productId?.name || 'Produk'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-200 font-black rounded-lg whitespace-nowrap">
                        +{prod.quantity} {formatUnit(prod.productId?.unit || 'Pieces')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {prod.materialsUsed?.map((m, idx) => (
                          <div key={idx} className="text-xs text-slate-600 font-medium">
                            • {m.materialName}: <strong className="text-slate-800">{m.quantity} {formatUnit(m.unit)}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailProduction(prod)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors inline-flex items-center justify-center font-bold"
                          title="Detail Produksi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center justify-center font-bold"
                          title="Edit Produksi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(prod._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Hapus / Batalkan Produksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Production Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editProductionId ? "Edit Produksi" : "Form Input Produksi"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Produk Dihasilkan</label>
              {/* [DIUBAH] <select> diganti dropdown custom biru muda */}
              <FilterDropdown
                value={productId}
                onChange={setProductId}
                options={productOptions}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Produksi (Hasil)</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Misal: 100"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f0a3d0] font-bold"
              />
            </div>
          </div>

          {/* Dynamic Materials Usage */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                Rincian Bahan &amp; Kemasan yang Digunakan
              </span>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Bahan
              </button>
            </div>

            {materialsUsed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-5 text-slate-400 gap-1.5">
                <Wheat className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-semibold">Belum ada bahan ditambahkan</p>
                <p className="text-[11px]">Klik "+ Tambah Bahan" untuk mulai memasukkan bahan baku</p>
              </div>
            )}

            {materialsUsed.map((row, idx) => {
              const selectedMat = materials.find((m) => m._id === row.materialId);
              const compatibleUnits = getCompatibleUnits(selectedMat?.unit || '');
              const canChooseUnit = compatibleUnits.length > 1;
              const unitOptions = compatibleUnits.map((u) => ({ value: u, label: u }));
              return (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  {/* [DIUBAH] Pilih bahan: dropdown custom biru muda */}
                  <FilterDropdown
                    className="flex-1 min-w-0"
                    value={row.materialId}
                    onChange={(val) => handleMaterialChange(idx, 'materialId', val)}
                    options={materialOptions}
                    buttonClassName="w-full text-left bg-transparent text-xs focus:outline-none font-medium text-slate-800 flex justify-between items-center gap-2 py-1"
                  />

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={row.quantity}
                      onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                      className="w-20 border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-bold focus:outline-none focus:border-amber-300"
                    />
                    {canChooseUnit ? (
                      /* [DIUBAH] Pilih satuan: dropdown custom biru muda (Kilogram/Gram atau Mililiter/Liter) */
                      <FilterDropdown
                        value={row.usedUnit || normalizeUnit(selectedMat?.unit || '')}
                        onChange={(val) => handleMaterialChange(idx, 'usedUnit', val)}
                        options={unitOptions}
                        listClassName="min-w-full w-max right-0"
                        buttonClassName="border border-amber-200 bg-amber-50 text-amber-800 rounded-lg py-1 px-2 text-[11px] font-bold focus:outline-none focus:border-amber-400 cursor-pointer flex items-center gap-1"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-500 font-semibold min-w-[32px]">
                        {normalizeUnit(selectedMat?.unit || '')}
                      </span>
                    )}
                  </div>

                  {materialsUsed.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterialRow(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Produksi (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Produksi batch pagi untuk pesanan acara..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#f0a3d0]"
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Memproses...' : 'Proses & Simpan Produksi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Production Detail Modal */}
      <Modal
        isOpen={!!detailProduction}
        onClose={() => setDetailProduction(null)}
        title={`Detail Produksi (${detailProduction?.productionNumber || ''})`}
        maxWidth="max-w-md"
      >
        {detailProduction && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
              <p className="text-slate-500">Waktu Produksi: <strong className="text-slate-800">{formatDate(detailProduction.date)}</strong></p>
              <p className="text-slate-500">Produk: <strong className="text-amber-900 font-bold">{detailProduction.productId?.name}</strong></p>
              <p className="text-slate-500">Jumlah Dihasilkan: <strong className="text-emerald-700 font-extrabold">{detailProduction.quantity} {formatUnit(detailProduction.productId?.unit || 'Pieces')}</strong></p>
              <p className="text-slate-500">Dicatat Oleh: <strong className="text-slate-800">{detailProduction.userId?.name || 'Admin'}</strong></p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Bahan Baku Yang Terpotong:</h4>
              <div className="space-y-1.5">
                {detailProduction.materialsUsed?.map((m, i) => (
                  <div key={i} className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">{m.materialName}</span>
                    <span className="font-extrabold text-rose-700">-{m.quantity} {formatUnit(m.unit)}</span>
                  </div>
                ))}
              </div>
            </div>

            {detailProduction.notes && (
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                <span className="font-semibold text-slate-700">Catatan:</span> {detailProduction.notes}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailProduction(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => !isSubmitting && setDeleteId(null)}
        title="Konfirmasi Batal Produksi"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-slate-600 mb-4">
          Apakah Anda yakin ingin membatalkan/menghapus riwayat produksi ini? <br />
          <strong className="text-rose-600 font-black mt-2 inline-block">Stok bahan baku akan dikembalikan dan stok produk akan dikurangi.</strong>
        </p>
        <div className="flex justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Ya, Hapus'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductionPage;