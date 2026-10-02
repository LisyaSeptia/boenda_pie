import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wheat,
  Factory,
  ArrowUpDown,
  Receipt,
  BarChart3,
  PieChart
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isAdmin } = useAuth();

  const adminNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pos', label: 'Kasir / POS', icon: ShoppingBag },
    { path: '/products', label: 'Data Produk', icon: Package },
    { path: '/materials', label: 'Data Bahan Baku', icon: Wheat },
    { path: '/production', label: 'Produksi', icon: Factory },
    { path: '/stock', label: 'Stok Movement', icon: ArrowUpDown },
    { path: '/transactions', label: 'Transaksi', icon: Receipt },
    { path: '/reports', label: 'Laporan Penjualan', icon: BarChart3 }
  ];

  const kasirNav = [
    { path: '/pos', label: 'Kasir / POS', icon: ShoppingBag },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Riwayat Transaksi', icon: Receipt }
  ];

  const navItems = isAdmin ? adminNav : kasirNav;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out border-r border-slate-800 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 h-16 px-6 bg-slate-950/60 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
          <PieChart className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight leading-none">BOENDA PIE</h1>
          <span className="text-[11px] font-medium text-amber-400 tracking-wider uppercase">Purwokerto</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{user?.name || user?.username}</p>
          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
            isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="px-3 space-y-1 font-medium text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => toggleSidebar && toggleSidebar(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
