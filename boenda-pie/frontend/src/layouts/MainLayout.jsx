import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':    return 'Dashboard System';
      case '/pos':          return 'Kasir & Point of Sale (POS)';
      case '/products':     return 'Manajemen Data Produk';
      case '/materials':    return 'Manajemen Bahan & Kemasan';
      case '/production':   return 'Manajemen Produksi & Bahan';
      case '/stock':        return 'Aktivitas Stok';
      case '/transactions': return 'Data & Riwayat Transaksi';
      case '/reports':      return 'Laporan Penjualan & Analytics';
      default:              return 'Boenda Pie Purwokerto';
    }
  };

  return (
    <>
      {/* Background Blobs — truly fixed to viewport, never scroll */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(248,206,232,0.22) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(190,234,255,0.18) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '55%', right: '8%', width: 220, height: 220, background: 'radial-gradient(circle, rgba(252,240,192,0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(35px)' }} />
      </div>

      <div style={{ height: '100vh', overflow: 'hidden', background: '#fffaf5', color: '#3d2c1e', position: 'relative' }} className="flex font-sans">

        {/* Sidebar */}
        <div style={{ position: 'relative', zIndex: 40, flexShrink: 0 }}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
        </div>

        {/* Backdrop mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(61,44,30,0.3)', backdropFilter: 'blur(4px)' }}
            className="md:hidden"
          />
        )}

        {/* Main Container — only this area scrolls */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all" style={{ position: 'relative', zIndex: 1, height: '100vh', overflow: 'hidden' }}>
          <Navbar
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            title={getPageTitle(location.pathname)}
          />
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
