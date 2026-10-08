import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatRupiah, formatDate } from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import {
  Package, Wheat, AlertTriangle, ShoppingBag,
  TrendingUp, Receipt, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardAdminPage = () => {
  const [data, setData] = useState(() => getCachedData('dashboardAdmin'));
  const [loading, setLoading] = useState(() => !getCachedData('dashboardAdmin'));
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      if (!data) setLoading(true);
      const res = await reportService.getDashboardData();
      if (res.success) {
        setData(res.data);
        setCachedData('dashboardAdmin', res.data);
      }
    } catch (err) {
      if (!data) setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <LoadingSpinner text="Menyiapkan indikator dashboard..." />;

  if (error) return (
    <div style={{ padding: 24, background: '#fff0f5', border: '1.5px solid #f0a3d0', borderRadius: 16, color: '#a0336e' }}>
      <p className="font-semibold">{error}</p>
      <button onClick={fetchDashboard} style={{ marginTop: 12, padding: '8px 16px', background: '#f8cee8', border: '1.5px solid #f0a3d0', color: '#a0336e', fontWeight: 700, borderRadius: 10, cursor: 'pointer' }}>
        Coba Lagi
      </button>
    </div>
  );

  const metricCards = [
    { label: 'Total Produk', value: `${data?.totalProducts || 0} Varian`, icon: Package, bg: '#beeaff', bgLight: '#e8f7ff', iconColor: '#1a6fa0', border: '#7dcef5', labelColor: '#1a5a80' },
    { label: 'Bahan Baku', value: `${data?.totalMaterials || 0} Jenis`, icon: Wheat, bg: '#f8cee8', bgLight: '#fff0f7', iconColor: '#a0336e', border: '#f0a3d0', labelColor: '#8a2060' },
    { label: 'Penjualan Hari Ini', value: formatRupiah(data?.totalTodaySales || 0), sub: `${data?.totalTodayTransactions || 0} transaksi`, icon: TrendingUp, bg: '#fcf0c0', bgLight: '#fffbea', iconColor: '#8a6000', border: '#f5d96b', labelColor: '#7a5500' },
    { label: 'Total Akumulasi Omset', value: formatRupiah(data?.grandTotalSales || 0), sub: `${data?.grandTotalTransactions || 0} total transaksi`, icon: Receipt, bg: '#fff4e7', bgLight: '#fffaf5', iconColor: '#9a4a00', border: '#ffdbb5', labelColor: '#8a3a00' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f8cee8 0%, #beeaff 50%, #fcf0c0 100%)',
        borderRadius: 24, padding: '24px 28px',
        border: '2px solid #f8cee8',
        boxShadow: '0 4px 20px rgba(248,206,232,0.25)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16
      }}>
        <div>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#a0336e', marginBottom: 8 }}>
            Ringkasan Manajemen
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#3d2c1e', margin: '0 0 4px', lineHeight: 1.2 }}>Selamat Datang di System Boenda Pie Purwokerto</h2>
          <p style={{ fontSize: 12, color: '#6b5748', margin: 0 }}>Pantau stok bahan baku, tingkat produksi pie, dan performa kasir secara terintegrasi.</p>
        </div>
        <Link to="/pos" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: 'white', borderRadius: 14, fontWeight: 700, fontSize: 13,
          color: '#a0336e', border: '1.5px solid #f8cee8', textDecoration: 'none',
          boxShadow: '0 2px 10px rgba(248,206,232,0.3)', whiteSpace: 'nowrap'
        }}>
          <ShoppingBag style={{ width: 16, height: 16 }} />
          <span>Buka POS Kasir</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${card.bgLight} 0%, ${card.bg} 100%)`,
              padding: '18px 20px', borderRadius: 20,
              border: `1.5px solid ${card.border}`,
              boxShadow: `0 2px 14px rgba(0,0,0,0.06)`,
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Icon style={{ width: 22, height: 22, color: card.iconColor }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: card.labelColor, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>{card.label}</p>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>{card.value}</h3>
                {card.sub && <span style={{ fontSize: 11, color: card.labelColor }}>{card.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Low Stock Products */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #f8cee8', padding: '18px 20px', boxShadow: '0 2px 12px rgba(248,206,232,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1.5px solid #fff0f5', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle style={{ width: 18, height: 18, color: '#f0a3d0' }} />
              <h3 style={{ fontWeight: 800, color: '#3d2c1e', fontSize: 14, margin: 0 }}>Produk Stok Rendah ({data?.lowStockProductsCount || 0})</h3>
            </div>
            <Link to="/products" style={{ fontSize: 11, fontWeight: 700, color: '#a0336e', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              Kelola <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {data?.lowStockProducts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.lowStockProducts.map((prod) => (
                <div key={prod._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: '#fff4f7', border: '1px solid #ffd6e5', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontWeight: 700, color: '#3d2c1e' }}>{prod.name}</span>
                    <span style={{ color: '#475569', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>({prod.category})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ padding: '2px 8px', background: '#f8cee8', color: '#a0336e', fontWeight: 800, borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' }}>Sisa: {prod.stock} {prod.unit}</span>
                    <span style={{ color: '#475569', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>Min: {prod.minStock}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#475569', fontWeight: 500, textAlign: 'center', padding: '12px 0', margin: 0 }}>Semua stok produk dalam kondisi aman ✅</p>
          )}
        </div>

        {/* Low Stock Materials */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #fcf0c0', padding: '18px 20px', boxShadow: '0 2px 12px rgba(252,240,192,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1.5px solid #fffbea', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle style={{ width: 18, height: 18, color: '#f5d96b' }} />
              <h3 style={{ fontWeight: 800, color: '#3d2c1e', fontSize: 14, margin: 0 }}>Bahan Baku Stok Rendah ({data?.lowStockMaterialsCount || 0})</h3>
            </div>
            <Link to="/materials" style={{ fontSize: 11, fontWeight: 700, color: '#8a6000', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              Kelola <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {data?.lowStockMaterials?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.lowStockMaterials.map((mat) => (
                <div key={mat._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: '#fffbea', border: '1px solid #f5d96b', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontWeight: 700, color: '#3d2c1e' }}>{mat.name}</span>
                    <span style={{ color: '#475569', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>({mat.code})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ padding: '2px 8px', background: '#fcf0c0', color: '#8a6000', fontWeight: 800, borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' }}>Sisa: {mat.stock} {mat.unit}</span>
                    <span style={{ color: '#475569', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>Min: {mat.minStock}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#9b8b7c', textAlign: 'center', padding: '12px 0', margin: 0 }}>Stok bahan baku tersedia mencukupi ✅</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #beeaff', padding: '18px 20px', boxShadow: '0 2px 12px rgba(190,234,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1.5px solid #e8f7ff', marginBottom: 14 }}>
          <h3 style={{ fontWeight: 800, color: '#3d2c1e', fontSize: 14, margin: 0 }}>Transaksi Penjualan Terbaru</h3>
          <Link to="/transactions" style={{ fontSize: 11, fontWeight: 700, color: '#1a6fa0', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            Lihat Semua <ArrowRight style={{ width: 13, height: 13 }} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: 550, borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f0f9ff' }}>
                {['No. Invoice', 'Waktu', 'Kasir', 'Metode', 'Total Belanja'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontWeight: 700, color: '#1a6fa0', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recentTransactions?.length > 0 ? data.recentTransactions.map((tx) => (
                <tr key={tx._id} style={{ borderTop: '1px solid #e8f7ff' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#3d2c1e' }}>{tx.invoiceNumber}</td>
                  <td style={{ padding: '10px 12px', color: '#9b8b7c' }}>{formatDate(tx.date)}</td>
                  <td style={{ padding: '10px 12px', color: '#3d2c1e' }}>{tx.cashierName}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', background: '#beeaff', color: '#1a6fa0', fontWeight: 700, borderRadius: 20, fontSize: 11 }}>{tx.paymentMethod}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 900, color: '#a0336e' }}>{formatRupiah(tx.totalAmount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: 16, textAlign: 'center', color: '#9b8b7c' }}>Belum ada transaksi recorded.</td>
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
