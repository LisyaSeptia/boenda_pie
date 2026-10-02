import React, { useEffect, useState } from 'react';
import { productionService } from '../services/productionService';
import { productService } from '../services/productService';
import { materialService } from '../services/materialService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { formatDate } from '../utils/formatters';
import { Plus, Factory, Wheat, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';

const ProductionPage = () => {
  const [productions, setProductions] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailProduction, setDetailProduction] = useState(null);

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
      setLoading(true);
      const [prodRes, pRes, mRes] = await Promise.all([
        productionService.getAll(),
        productService.getAll(),
        materialService.getAll()
      ]);

      if (prodRes.success) setProductions(prodRes.data);
      if (pRes.success) setProducts(pRes.data);
      if (mRes.success) setMaterials(mRes.data);
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
    setProductId(products.length > 0 ? products[0]._id : '');
    setQuantity('50');
    setNotes('');
    setMaterialsUsed(
      materials.length > 0
        ? [{ materialId: materials[0]._id, quantity: '1' }]
        : []
    );
    setIsModalOpen(true);
  };

  const handleAddMaterialRow = () => {
    if (materials.length === 0) return;
    setMaterialsUsed([
      ...materialsUsed,
      { materialId: materials[0]._id, quantity: '1' }
    ]);
  };

  const handleRemoveMaterialRow = (index) => {
    setMaterialsUsed(materialsUsed.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materialsUsed];
    updated[index][field] = value;
    setMaterialsUsed(updated);
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
          quantity: Number(m.quantity)
        })),
        notes
      };

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

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pencatatan Produksi & Penggunaan Bahan</h2>
          <p className="text-xs text-slate-500">Catat hasil pembuatan kue pie. Sistem akan memotong stok bahan baku dan menambah stok produk secara otomatis.</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Produksi Baru</span>
        </button>
      </div>

      {/* Productions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat produksi..." />
        ) : productions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Factory className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Belum ada riwayat produksi recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-4">No. Produksi</th>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Produk Dihasilkan</th>
                  <th className="p-4">Jumlah Hasil</th>
                  <th className="p-4">Bahan Baku Digunakan</th>
                  <th className="p-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productions.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{prod.productionNumber}</td>
                    <td className="p-4 text-slate-500">{formatDate(prod.date)}</td>
                    <td className="p-4 font-bold text-amber-800">
                      {prod.productId?.name || 'Produk'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg">
                        +{prod.quantity} {prod.productId?.unit || 'pcs'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {prod.materialsUsed?.map((m, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600">
                            • {m.materialName}: <strong className="text-slate-800">{m.quantity} {m.unit}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setDetailProduction(prod)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        Lihat <ChevronRight className="w-3.5 h-3.5" />
                      </button>
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
        title="Form Input Produksi Pie"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Produk Dihasilkan</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500 font-semibold"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stok Saat Ini: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
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
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          {/* Dynamic Materials Usage */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                Rincian Bahan Baku yang Dikonsumsi
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

            {materialsUsed.map((row, idx) => {
              const selectedMat = materials.find((m) => m._id === row.materialId);
              return (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <select
                    value={row.materialId}
                    onChange={(e) => handleMaterialChange(idx, 'materialId', e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs focus:outline-none font-medium text-slate-800"
                  >
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} (Stok: {m.stock} {m.unit})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 w-32">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={row.quantity}
                      onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-bold"
                    />
                    <span className="text-[11px] text-slate-500 font-semibold">{selectedMat?.unit || ''}</span>
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
              <p className="text-slate-500">Jumlah Dihasilkan: <strong className="text-emerald-700 font-extrabold">{detailProduction.quantity} {detailProduction.productId?.unit || 'pcs'}</strong></p>
              <p className="text-slate-500">Dicatat Oleh: <strong className="text-slate-800">{detailProduction.userId?.name || 'Admin'}</strong></p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Bahan Baku Yang Terpotong:</h4>
              <div className="space-y-1.5">
                {detailProduction.materialsUsed?.map((m, i) => (
                  <div key={i} className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">{m.materialName}</span>
                    <span className="font-extrabold text-rose-700">-{m.quantity} {m.unit}</span>
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
    </div>
  );
};

export default ProductionPage;
