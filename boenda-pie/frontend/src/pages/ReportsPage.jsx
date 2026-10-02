import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Package,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReport();
  }, [period, startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportService.getSalesReport({
        period,
        startDate,
        endDate
      });
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report || !report.transactions) return;
    const headers = ['No Invoice', 'Tanggal', 'Kasir', 'Metode Pembayaran', 'Total Belanja'];
    const rows = report.transactions.map((tx) => [
      tx.invoiceNumber,
      formatDate(tx.date),
      tx.cashierName,
      tx.paymentMethod,
      tx.totalAmount
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_Boenda_Pie_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laporan Penjualan & Performa Bisnis</h2>
          <p className="text-xs text-slate-500">Analisa omset harian, mingguan, bulanan, dan varian pie paling terlaris.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Data (CSV)</span>
        </button>
      </div>

      {/* Period Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'today'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'week'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'month'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rentang Tanggal
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none"
            />
            <span className="text-slate-400 font-bold">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none"
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Kalkulasi data laporan penjualan..." />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Omset Penjualan</p>
                <h3 className="text-2xl font-black text-emerald-700">{formatRupiah(report?.totalRevenue || 0)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Jumlah Transaksi Sukses</p>
                <h3 className="text-2xl font-black text-slate-800">{report?.totalTransactions || 0} Transaksi</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Produk Terjual</p>
                <h3 className="text-2xl font-black text-slate-800">{report?.totalItemsSold || 0} Pcs Pie</h3>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Peringkat Produk Terlaris (Top Selling Products)</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3">Peringkat</th>
                    <th className="p-3">Nama Produk Pie</th>
                    <th className="p-3">Jumlah Terjual</th>
                    <th className="p-3">Total Kontribusi Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.topProducts && report.topProducts.length > 0 ? (
                    report.topProducts.map((prod, index) => (
                      <tr key={prod.productId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                            index === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{prod.productName}</td>
                        <td className="p-3 font-extrabold text-slate-800">
                          {prod.quantitySold} pcs
                        </td>
                        <td className="p-3 font-extrabold text-amber-700">
                          {formatRupiah(prod.totalRevenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-slate-400">Belum ada data penjualan pada periode ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
