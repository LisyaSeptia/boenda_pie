import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ReceiptModal from '../components/ReceiptModal';
import Toast from '../components/Toast';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Search, Receipt, Calendar, Eye, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TransactionsPage = () => {
  const { isKasir, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const params = { search, startDate, endDate };
      if (isKasir) {
        params.cashierId = user.id;
      }
      const res = await transactionService.getAll(params);
      if (res.success) {
        setTransactions(res.data);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riwayat Transaksi Penjualan</h2>
          <p className="text-xs text-slate-500">Daftar seluruh transaksi kasir lengkap dengan detail item dan cetak struk.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no invoice atau nama kasir..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-amber-500 text-slate-700 shadow-xs"
          />
        </div>

        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-amber-500 text-slate-700 shadow-xs"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat transaksi..." />
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Belum ada data transaksi ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-4">No. Invoice</th>
                  <th className="p-4">Tanggal & Waktu</th>
                  <th className="p-4">Kasir</th>
                  <th className="p-4">Rincian Item</th>
                  <th className="p-4">Metode Bayar</th>
                  <th className="p-4">Total Belanja</th>
                  <th className="p-4 text-center">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{tx.invoiceNumber}</td>
                    <td className="p-4 text-slate-500">{formatDate(tx.date)}</td>
                    <td className="p-4 font-medium">{tx.cashierName}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        {tx.items?.map((it, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600">
                            • {it.productName} ({it.quantity} x {formatRupiah(it.price)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-lg text-[10px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-black text-amber-700 text-sm">
                      {formatRupiah(tx.totalAmount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewReceipt(tx)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Cetak
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
