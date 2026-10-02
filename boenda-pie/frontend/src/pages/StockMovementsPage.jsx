import React, { useEffect, useState } from 'react';
import { stockService } from '../services/stockService';
import { productService } from '../services/productService';
import { materialService } from '../services/materialService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { formatDate } from '../utils/formatters';
import { ArrowUpDown, Plus, Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

const StockMovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [itemType, setItemType] = useState('');
  const [type, setType] = useState('');

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjItemType, setAdjItemType] = useState('PRODUCT');
  const [itemsList, setItemsList] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('IN');
  const [quantity, setQuantity] = useState('10');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchMovements();
  }, [search, itemType, type]);

  useEffect(() => {
    if (isModalOpen) {
      loadItemsForAdjustment(adjItemType);
    }
  }, [adjItemType, isModalOpen]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await stockService.getMovements({ search, itemType, type });
      if (res.success) {
        setMovements(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat pergerakan stok', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadItemsForAdjustment = async (targetType) => {
    try {
      if (targetType === 'PRODUCT') {
        const res = await productService.getAll();
        if (res.success) {
          setItemsList(res.data);
          if (res.data.length > 0) setSelectedItemId(res.data[0]._id);
        }
      } else {
        const res = await materialService.getAll();
        if (res.success) {
          setItemsList(res.data);
          if (res.data.length > 0) setSelectedItemId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !quantity) {
      showToast('Pilih item dan jumlah penyesuaian', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await stockService.adjust({
        itemType: adjItemType,
        itemId: selectedItemId,
        adjustmentType,
        quantity: Number(quantity),
        notes
      });
      if (res.success) {
        showToast('Penyesuaian stok berhasil disimpan');
        setIsModalOpen(false);
        fetchMovements();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan penyesuaian stok', 'error');
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
          <h2 className="text-xl font-bold text-slate-900">Riwayat & Audit Pergerakan Stok</h2>
          <p className="text-xs text-slate-500">Jejak audit masuk, keluar, produksi, penjualan, dan penyesuaian stok.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Penyesuaian Manual (Adjustment)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama item atau no referensi..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-amber-500 text-slate-700"
        >
          <option value="">Semua Kategori Item (Produk & Bahan)</option>
          <option value="PRODUCT">Produk Pie (Jadi)</option>
          <option value="MATERIAL">Bahan Baku</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-amber-500 text-slate-700"
        >
          <option value="">Semua Jenis Movement</option>
          <option value="STOCK_IN">Stok Masuk (STOCK_IN)</option>
          <option value="STOCK_OUT">Stok Keluar (STOCK_OUT)</option>
          <option value="PRODUCTION">Produksi (PRODUCTION)</option>
          <option value="SALE">Penjualan Kasir (SALE)</option>
          <option value="ADJUSTMENT">Penyesuaian (ADJUSTMENT)</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat stok movement..." />
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ArrowUpDown className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Belum ada riwayat pergerakan stok recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Tipe Item</th>
                  <th className="p-4">Nama Item</th>
                  <th className="p-4">Jenis Perubahan</th>
                  <th className="p-4">Perubahan Qty</th>
                  <th className="p-4">Stok Sebelum -&gt; Sesudah</th>
                  <th className="p-4">No. Referensi / Ket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((mov) => {
                  const isPositive = mov.quantity > 0;
                  return (
                    <tr key={mov._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-slate-500 font-medium">{formatDate(mov.createdAt)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mov.itemType === 'PRODUCT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {mov.itemType}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{mov.itemName}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">{mov.type}</span>
                      </td>
                      <td className="p-4">
                        <div className={`font-black text-xs flex items-center gap-1 ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPositive ? `+${mov.quantity}` : mov.quantity} {mov.unit}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-mono">
                        {mov.stockBefore} -&gt; <strong className="text-slate-900">{mov.stockAfter}</strong> {mov.unit}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{mov.referenceNo || '-'}</div>
                        <div className="text-[11px] text-slate-400">{mov.notes}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Penyesuaian Stok Manual (Adjustment)"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Kategori Item</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="radio"
                  name="itemType"
                  value="PRODUCT"
                  checked={adjItemType === 'PRODUCT'}
                  onChange={() => setAdjItemType('PRODUCT')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                Produk Pie (Jadi)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="radio"
                  name="itemType"
                  value="MATERIAL"
                  checked={adjItemType === 'MATERIAL'}
                  onChange={() => setAdjItemType('MATERIAL')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                Bahan Baku
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Item</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500 font-semibold"
            >
              {itemsList.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} (Stok Saat Ini: {item.stock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aksi Perubahan</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500 font-bold text-amber-900"
              >
                <option value="IN">Tambah Stok (Stok Masuk)</option>
                <option value="OUT">Kurangi Stok (Stok Keluar)</option>
                <option value="SET">Atur Ulang Total Stok (Opname)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Nilai</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-500 font-extrabold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alasan / Catatan Penyesuaian</label>
            <textarea
              rows="2"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pembelian bahan tambahan / barang rusak saat handling..."
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
              {isSubmitting ? 'Memproses...' : 'Simpan Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockMovementsPage;
