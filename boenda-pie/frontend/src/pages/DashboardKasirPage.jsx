import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatRupiah, formatDate } from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { ShoppingBag, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardKasirPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(() => getCachedData('kasirTxs') || []);
  const [loading, setLoading] = useState(() => !getCachedData('kasirTxs'));

  useEffect(() => { fetchMyTransactions(); }, []);

  const fetchMyTransactions = async () => {
    try {
      if (transactions.length === 0) setLoading(true);
      const res = await transactionService.getAll({ cashierId: user?.id });
      if (res.success) {
        setTransactions(res.data);
        setCachedData('kasirTxs', res.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const todayTxs = transactions.filter((tx) => {
    return new Date(tx.date).toDateString() === new Date().toDateString();
  });
  const totalTodaySales = todayTxs.reduce((sum, tx) => sum + tx.totalAmount, 0);

  if (loading && transactions.length === 0) return <LoadingSpinner text="Memuat dashboard kasir..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860, margin: '0 auto' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f8cee8 0%, #beeaff 50%, #fcf0c0 100%)',
        borderRadius: 24, padding: '24px 28px',
        border: '2px solid #f8cee8',
        boxShadow: '0 4px 20px rgba(248,206,232,0.25)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16
      }}>
        <div>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#a0336e', marginBottom: 8 }}>
            ✨ Mode Kasir Aktif
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#3d2c1e', margin: '0 0 4px' }}>Halo, {user?.name || user?.username}!</h2>
          <p style={{ fontSize: 12, color: '#6b5748', margin: 0 }}>Siap memproses pesanan pie pelanggan Boenda Pie Purwokerto.</p>
        </div>
        <Link to="/pos" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
          background: 'white', borderRadius: 14, fontWeight: 800, fontSize: 13,
          color: '#a0336e', border: '1.5px solid #f8cee8', textDecoration: 'none',
          boxShadow: '0 2px 10px rgba(248,206,232,0.3)', whiteSpace: 'nowrap'
        }}>
          <ShoppingBag style={{ width: 16, height: 16 }} />
          <span>Buka Aplikasi POS</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, #fffbea 0%, #fcf0c0 100%)', padding: '18px 20px', borderRadius: 20, border: '1.5px solid #f5d96b', boxShadow: '0 2px 12px rgba(252,240,192,0.35)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(245,217,107,0.3)' }}>
            <Receipt style={{ width: 22, height: 22, color: '#8a6000' }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#7a5500', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Transaksi Anda Hari Ini</p>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>{todayTxs.length} Transaksi</h3>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #e8f7ff 0%, #beeaff 100%)', padding: '18px 20px', borderRadius: 20, border: '1.5px solid #7dcef5', boxShadow: '0 2px 12px rgba(190,234,255,0.35)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(125,206,245,0.3)' }}>
            <CheckCircle2 style={{ width: 22, height: 22, color: '#1a6fa0' }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#1a5a80', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Total Omset Kasir Hari Ini</p>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>{formatRupiah(totalTodaySales)}</h3>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #f8cee8', padding: '18px 20px', boxShadow: '0 2px 12px rgba(248,206,232,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1.5px solid #fff4f7', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, color: '#3d2c1e', fontSize: 14, margin: 0 }}>Riwayat Transaksi Terakhir</h3>
          <Link to="/transactions" style={{ fontSize: 11, fontWeight: 700, color: '#a0336e', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            Lihat Semua <ArrowRight style={{ width: 13, height: 13 }} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx._id} style={{ padding: '12px 14px', borderRadius: 14, background: '#fffaf5', border: '1px solid #f0e8e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
              <div>
                <p style={{ fontWeight: 800, color: '#3d2c1e', margin: '0 0 3px' }}>{tx.invoiceNumber}</p>
                <p style={{ color: '#9b8b7c', margin: 0 }}>{formatDate(tx.date)} • {tx.items.length} item</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 900, color: '#a0336e', fontSize: 14, margin: '0 0 3px' }}>{formatRupiah(tx.totalAmount)}</p>
                <span style={{ display: 'inline-block', padding: '2px 8px', background: '#beeaff', color: '#1a6fa0', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>{tx.paymentMethod}</span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9b8b7c', padding: '16px 0', margin: 0 }}>Belum ada transaksi hari ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardKasirPage;
