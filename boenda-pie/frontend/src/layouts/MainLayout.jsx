import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard System';
      case '/pos':
        return 'Kasir & Point of Sale (POS)';
      case '/products':
        return 'Manajemen Data Produk';
      case '/materials':
        return 'Manajemen Bahan Baku';
      case '/production':
        return 'Manajemen Produksi & Bahan';
      case '/stock':
        return 'Riwayat Pergerakan Stok';
      case '/transactions':
        return 'Data & Riwayat Transaksi';
      case '/reports':
        return 'Laporan Penjualan & Analytics';
      default:
        return 'Boenda Pie Purwokerto';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all">
        <Navbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
