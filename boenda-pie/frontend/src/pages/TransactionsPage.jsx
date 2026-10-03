import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ReceiptModal from '../components/ReceiptModal';
import Toast from '../components/Toast';
import { formatRupiah, formatDate } from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { Search, Receipt, Calendar, Eye, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TransactionsPage = () => {
  const { isKasir, user } = useAuth();
  const [transactions, setTransactions] = useState(() => getCachedData('transactions') || []);
  const [loading, setLoading] = useState(() => !getCachedData('transactions'));
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Transaction for Struk
  const [selectedTx, setSelectedTx] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchTransactions();
  }, [search, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      if (transactions.length === 0) setLoading(true);
      const params = { search, startDate, endDate };
      if (isKasir) {
        params.cashierId = user.id;
      }
      const res = await transactionService.getAll(params);
      if (res.success) {
        setTransactions(res.data);
        if (!search && !startDate && !endDate) setCachedData('transactions', res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat transaksi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleViewReceipt = (tx) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Controls */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#e8f7ff', border: '1.5px solid #7dcef5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Receipt style={{ width: 22, height: 22, color: '#1a6fa0' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Riwayat Transaksi Penjualan</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Daftar seluruh transaksi kasir lengkap dengan detail item dan cetak struk.</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#1a6fa0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no invoice atau nama kasir..."
            className="w-full bg-white border border-[#beeaff] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#7dcef5] shadow-xs"
          />
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-[#beeaff] rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#7dcef5] text-slate-700 shadow-xs"
          />
        </div>

        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-[#beeaff] rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#7dcef5] text-slate-700 shadow-xs"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#beeaff] shadow-xs overflow-hidden w-full max-w-full">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat transaksi..." />
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Belum ada data transaksi ditemukan.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[750px]">
              <thead className="bg-[#e8f7ff] text-[#1a6fa0] font-extrabold border-b-2 border-[#7dcef5] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3.5 py-3 whitespace-nowrap">No. Invoice</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Tanggal &amp; Waktu</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Kasir</th>
                  <th className="px-3.5 py-3">Rincian Item</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Metode</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Total</th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3.5 py-3 font-bold text-slate-900 break-words text-[11px]">{tx.invoiceNumber}</td>
                    <td className="px-3.5 py-3 text-slate-600 font-medium text-[11px]">{formatDate(tx.date)}</td>
                    <td className="px-3.5 py-3 font-bold text-slate-800 break-words">{tx.cashierName}</td>
                    <td className="px-3.5 py-3">
                      <div className="space-y-0.5">
                        {tx.items?.map((it, idx) => (
                          <div key={idx} className="text-xs text-slate-600 font-medium leading-snug break-words">
                            • {it.productName} ({it.quantity} x {formatRupiah(it.price)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 font-extrabold rounded-lg text-[10px] border ${
                        tx.paymentMethod === 'CASH'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : tx.paymentMethod === 'QRIS'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-black text-slate-900 text-xs">
                      {formatRupiah(tx.totalAmount)}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <button
                        onClick={() => handleViewReceipt(tx)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1 text-[11px]"
                        title="Lihat & Cetak Struk"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};

export default TransactionsPage;
