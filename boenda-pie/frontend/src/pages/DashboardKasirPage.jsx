import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatRupiah, formatDate } from '../utils/formatters';
import { ShoppingBag, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardKasirPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTransactions();
  }, []);

  const fetchMyTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAll({ cashierId: user?.id });
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const todayTxs = transactions.filter((tx) => {
    const txDate = new Date(tx.date).toDateString();
    const today = new Date().toDateString();
    return txDate === today;
  });

  const totalTodaySales = todayTxs.reduce((sum, tx) => sum + tx.totalAmount, 0);

  if (loading) return <LoadingSpinner text="Memuat dashboard kasir..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner POS Kasir */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-xl shadow-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-slate-950 text-amber-400 font-bold text-xs rounded-full inline-block mb-2">
            Mode Kasir Aktif
          </span>
          <h2 className="text-2xl font-black tracking-tight">Halo, {user?.name || user?.username}!</h2>
          <p className="text-xs font-semibold text-slate-900/80 mt-1">
            Siap memproses pesanan pie pelanggan Boenda Pie Purwokerto.
          </p>
        </div>
        <Link
          to="/pos"
          className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Buka Aplikasi POS</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Transaksi Anda Hari Ini</p>
            <h3 className="text-xl font-extrabold text-slate-800">{todayTxs.length} Transaksi</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Omset Kasir Hari Ini</p>
            <h3 className="text-xl font-extrabold text-emerald-700">{formatRupiah(totalTodaySales)}</h3>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-slate-900 text-base">Riwayat Transaksi Terakhir</h3>
          <Link to="/transactions" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-slate-800">{tx.invoiceNumber}</p>
                <p className="text-slate-500">{formatDate(tx.date)} • {tx.items.length} item</p>
              </div>
              <div className="text-right">
                <p className="font-black text-amber-700 text-sm">{formatRupiah(tx.totalAmount)}</p>
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                  {tx.paymentMethod}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardKasirPage;
