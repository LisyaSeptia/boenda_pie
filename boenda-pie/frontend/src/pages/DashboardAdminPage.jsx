import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  Package,
  Wheat,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardAdminPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Menyiapkan indikator dashboard..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <p className="font-semibold">{error}</p>
        <button onClick={fetchDashboard} className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-6 text-slate-950 shadow-lg shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-slate-950/20 text-slate-950 font-extrabold text-xs rounded-full inline-block mb-2">
            Ringkasan Manajemen
          </span>
          <h2 className="text-2xl font-black tracking-tight">Selamat Datang di System Boenda Pie Purwokerto</h2>
          <p className="text-xs font-medium text-slate-900/80 mt-1">
            Pantau stok bahan baku, tingkat produksi pie, dan performa kasir secara terintegrasi.
          </p>
        </div>
        <Link
          to="/pos"
          className="px-5 py-3 bg-slate-950 text-amber-400 font-bold text-sm rounded-2xl shadow-md hover:bg-slate-900 transition-colors flex items-center gap-2 shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buka POS Kasir</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Produk</p>
            <h3 className="text-xl font-extrabold text-slate-800">{data?.totalProducts || 0} Varian</h3>
          </div>
        </div>

        {/* Total Materials */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Bahan Baku</p>
            <h3 className="text-xl font-extrabold text-slate-800">{data?.totalMaterials || 0} Jenis</h3>
          </div>
        </div>

        {/* Penjualan Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Penjualan Hari Ini</p>
            <h3 className="text-xl font-extrabold text-emerald-700">{formatRupiah(data?.totalTodaySales || 0)}</h3>
            <span className="text-[11px] text-slate-500">{data?.totalTodayTransactions || 0} transaksi</span>
          </div>
        </div>

        {/* Total Penjualan Keseluruhan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Akumulasi Omset</p>
            <h3 className="text-xl font-extrabold text-slate-800">{formatRupiah(data?.grandTotalSales || 0)}</h3>
            <span className="text-[11px] text-slate-500">{data?.grandTotalTransactions || 0} total transaksi</span>
          </div>
        </div>
      </div>

      {/* Alerts & Warnings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Produk Stok Rendah ({data?.lowStockProductsCount || 0})</h3>
            </div>
            <Link to="/products" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
            <div className="space-y-2.5">
              {data.lowStockProducts.map((prod) => (
                <div key={prod._id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{prod.name}</span>
                    <span className="text-slate-500 ml-2">({prod.category})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-800 font-extrabold rounded-full">
                      Sisa: {prod.stock} {prod.unit}
                    </span>
                    <span className="text-slate-400">Min: {prod.minStock}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">Semua stok produk dalam kondisi aman.</p>
          )}
        </div>

        {/* Low Stock Materials */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Bahan Baku Stok Rendah ({data?.lowStockMaterialsCount || 0})</h3>
            </div>
            <Link to="/materials" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.lowStockMaterials && data.lowStockMaterials.length > 0 ? (
            <div className="space-y-2.5">
              {data.lowStockMaterials.map((mat) => (
                <div key={mat._id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{mat.name}</span>
                    <span className="text-slate-500 ml-2">({mat.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-800 font-extrabold rounded-full">
                      Sisa: {mat.stock} {mat.unit}
                    </span>
                    <span className="text-slate-400">Min: {mat.minStock}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">Stok bahan baku tersedia mencukupi.</p>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-slate-900 text-base">Transaksi Penjualan Terbaru</h3>
          <Link to="/transactions" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Lihat Semua Transaksi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase">
              <tr>
                <th className="p-3">No. Invoice</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Kasir</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Total Belanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{tx.invoiceNumber}</td>
                    <td className="p-3 text-slate-500">{formatDate(tx.date)}</td>
                    <td className="p-3">{tx.cashierName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 font-bold rounded text-[11px]">{tx.paymentMethod}</span>
                    </td>
                    <td className="p-3 font-extrabold text-amber-700">{formatRupiah(tx.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400">Belum ada transaksi recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdminPage;
