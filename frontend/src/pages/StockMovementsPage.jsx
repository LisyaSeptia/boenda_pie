import React, { useEffect, useState, useRef } from 'react';
import { stockService } from '../services/stockService';
import { productService } from '../services/productService';
import { materialService } from '../services/materialService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { formatDate, formatUnit } from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { ArrowUpDown, Plus, Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronDown } from 'lucide-react';

const TYPE_LABEL = {
  STOCK_IN:   'Stok Masuk',
  STOCK_OUT:  'Stok Keluar',
  SALE:       'Penjualan',
  PRODUCTION: 'Produksi',
  ADJUSTMENT: 'Penyesuaian',
};

// [BARU] Dropdown custom: pilihan aktif & hover berwarna kuning pastel (senada dengan tema Aktivitas Stok)
const FilterDropdown = ({ value, onChange, options, buttonClassName }) => {
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={buttonClassName || 'w-full text-left bg-white border border-[#fcf0c0] rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#f5d96b] shadow-xs text-slate-700 flex justify-between items-center gap-2'}
      >
        <span className="truncate">{selected ? selected.label : ''}</span>
        <ChevronDown className={`w-4 h-4 text-[#8a6000] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-[#fcf0c0] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-3 py-2 cursor-pointer text-xs text-slate-700 hover:bg-[#fffbea] hover:text-[#8a6000] transition-colors ${value === opt.value ? 'bg-[#fffbea] text-[#8a6000] font-bold border-l-2 border-[#f5d96b]' : ''}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// [BARU] Pilihan untuk dropdown filter & form
const ITEM_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Semua Kategori Item (Produk & Bahan)' },
  { value: 'PRODUCT', label: 'Produk Pie (Jadi)' },
  { value: 'MATERIAL', label: 'Bahan Baku' },
];

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Semua Jenis Aktivitas' },
  { value: 'STOCK_IN', label: 'Stok Masuk' },
  { value: 'STOCK_OUT', label: 'Stok Keluar' },
  { value: 'PRODUCTION', label: 'Produksi' },
  { value: 'SALE', label: 'Penjualan' },
  { value: 'ADJUSTMENT', label: 'Penyesuaian' },
];

const ADJUSTMENT_ACTION_OPTIONS = [
  { value: 'IN', label: 'Tambah Stok (Stok Masuk)' },
  { value: 'OUT', label: 'Kurangi Stok (Stok Keluar)' },
  { value: 'SET', label: 'Atur Ulang Total Stok (Opname)' },
];

// Style tombol dropdown di dalam modal
const MODAL_DROPDOWN_BUTTON = 'w-full text-left bg-white border border-[#fcf0c0] rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#f5d96b] font-semibold text-slate-700 flex justify-between items-center gap-2';

const StockMovementsPage = () => {
  const [movements, setMovements] = useState(() => getCachedData('stockMovements') || []);
  const [loading, setLoading] = useState(() => !getCachedData('stockMovements'));
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
      if (movements.length === 0) setLoading(true);
      const res = await stockService.getMovements({ search, itemType, type });
      if (res.success) {
        setMovements(res.data);
        if (!search && !itemType && !type) setCachedData('stockMovements', res.data);
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

  // [BARU] Daftar item untuk dropdown "Pilih Item" di modal
  const itemOptions = itemsList.map((item) => ({
    value: item._id,
    label: `${item.name} (Stok Saat Ini: ${item.stock} ${formatUnit(item.unit)})`,
  }));

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Controls */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fffbea', border: '1.5px solid #f5d96b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowUpDown style={{ width: 22, height: 22, color: '#8a6000' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Aktivitas Stok</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Audit dan pantau seluruh catatan aktivitas keluar-masuk, produksi, dan penyesuaian stok.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b] hover:bg-[#f9e88a] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Penyesuaian Manual (Adjustment)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a6000] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama item atau no referensi..."
            className="w-full bg-white border border-[#fcf0c0] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#f5d96b] shadow-xs"
          />
        </div>

        <FilterDropdown
          value={itemType}
          onChange={setItemType}
          options={ITEM_TYPE_FILTER_OPTIONS}
        />

        <FilterDropdown
          value={type}
          onChange={setType}
          options={TYPE_FILTER_OPTIONS}
        />
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-[#fcf0c0] shadow-xs overflow-hidden w-full max-w-full">
        {loading ? (
          <LoadingSpinner text="Memuat aktivitas stok..." />
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ArrowUpDown className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Belum ada riwayat aktivitas stok tercatat.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
              <thead className="bg-[#fffbea] text-[#8a6000] font-extrabold border-b-2 border-[#f5d96b] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">Waktu</th>
                  <th className="p-4">Item &amp; Tipe</th>
                  {/* [DIUBAH] Judul kolom Jenis: rata tengah */}
                  <th className="p-4 whitespace-nowrap text-center">Jenis</th>
                  <th className="p-4 whitespace-nowrap">Perubahan</th>
                  <th className="p-4 whitespace-nowrap">Stok (Awal &rarr; Akhir)</th>
                  <th className="p-4">No. Ref &amp; Ket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((mov) => {
                  const isPositive = mov.quantity > 0;
                  return (
                    <tr key={mov._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-4 align-top text-slate-600 font-medium text-[11px]">
                        {formatDate(mov.createdAt)}
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-900 leading-snug break-words">{mov.itemName}</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            mov.itemType === 'PRODUCT' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {mov.itemType === 'PRODUCT' ? 'Produk Pie' : 'Bahan Baku'}
                          </span>
                        </div>
                      </td>
                      {/* [DIUBAH] Isi kolom Jenis: rata tengah, lurus dengan judulnya */}
                      <td className="p-4 align-top text-center">
                        <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] whitespace-nowrap ${
                          mov.type === 'STOCK_IN'   ? 'bg-emerald-50 text-emerald-700' :
                          mov.type === 'STOCK_OUT'  ? 'bg-rose-50 text-rose-700' :
                          mov.type === 'SALE'       ? 'bg-blue-50 text-blue-700' :
                          mov.type === 'PRODUCTION' ? 'bg-purple-50 text-purple-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {TYPE_LABEL[mov.type] || mov.type}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className={`font-black text-xs inline-flex items-center gap-1 ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                          <span>{isPositive ? `+${mov.quantity}` : mov.quantity} {formatUnit(mov.unit)}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top text-slate-600 font-mono text-xs">
                        <span>{mov.stockBefore} &rarr; </span>
                        <strong className="text-slate-900 font-black">{mov.stockAfter}</strong>
                        <span className="text-[11px] ml-1">{formatUnit(mov.unit)}</span>
                      </td>
                      {/* Isi kolom No. Ref & Ket: tetap rata kiri */}
                      <td className="p-4 align-top">
                        <div className="font-semibold text-slate-800 break-words text-xs">{mov.referenceNo || '-'}</div>
                        {mov.notes && (
                          <div className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug break-words">{mov.notes}</div>
                        )}
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
            <FilterDropdown
              value={selectedItemId}
              onChange={setSelectedItemId}
              options={itemOptions}
              buttonClassName={MODAL_DROPDOWN_BUTTON}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aksi Perubahan</label>
              <FilterDropdown
                value={adjustmentType}
                onChange={setAdjustmentType}
                options={ADJUSTMENT_ACTION_OPTIONS}
                buttonClassName={MODAL_DROPDOWN_BUTTON}
              />
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