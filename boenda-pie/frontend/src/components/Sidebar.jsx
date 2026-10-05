import React, { useState } from 'react';
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
  PieChart,
  LogOut,
  Users,
  UserCircle,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const adminNav = [
    { path: '/dashboard', label: 'Beranda', icon: LayoutDashboard, color: 'blue' },
    { path: '/pos', label: 'Kasir', icon: ShoppingBag, color: 'pink' },
    { path: '/products', label: 'Data Produk', icon: Package, color: 'yellow' },
    { path: '/materials', label: 'Data Bahan Baku', icon: Wheat, color: 'blue' },
    { path: '/production', label: 'Produksi', icon: Factory, color: 'pink' },
    { path: '/stock', label: 'Aktivitas Stok', icon: ArrowUpDown, color: 'yellow' },
    { path: '/transactions', label: 'Transaksi', icon: Receipt, color: 'blue' },
    { path: '/reports', label: 'Laporan Penjualan', icon: BarChart3, color: 'pink' },
    { path: '/profile', label: 'Profil Saya', icon: UserCircle, color: 'blue' }
  ];

  const kasirNav = [
    { path: '/dashboard', label: 'Beranda', icon: LayoutDashboard, color: 'blue' },
    { path: '/pos', label: 'Kasir', icon: ShoppingBag, color: 'pink' },
    { path: '/transactions', label: 'Riwayat Transaksi', icon: Receipt, color: 'blue' },
    { path: '/profile', label: 'Profil Saya', icon: UserCircle, color: 'yellow' }
  ];

  const navItems = isAdmin ? adminNav : kasirNav;

  const colorMap = {
    blue:   { bg: '#beeaff', text: '#1a6fa0' },
    pink:   { bg: '#f8cee8', text: '#a0336e' },
    yellow: { bg: '#fcf0c0', text: '#8a6000' },
    salmon: { bg: '#fff4e7', text: '#9a4a00' },
  };

  return (
    <>
      <aside
        style={{ background: '#fffaf5', borderRight: '1.5px solid #f0e8e0' }}
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div style={{ background: '#fff4f9', borderBottom: '2px solid #f8cee8' }}
          className="flex items-center gap-2 h-16 px-4 shrink-0">
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 13,
            background: 'linear-gradient(135deg, #fff0f7 0%, #fffbea 100%)',
            border: '1.5px solid #f8cee8',
            boxShadow: '0 2px 8px rgba(248,206,232,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <img
              src="/cute-pie.jpg"
              alt="Boenda Pie"
              style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 10 }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 style={{ color: '#a0336e' }} className="text-[15px] font-black tracking-tight leading-none mb-1">BOENDA PIE</h1>
            <span style={{ color: '#1a6fa0' }} className="text-[10px] font-extrabold tracking-widest uppercase leading-none">Purwokerto</span>
          </div>
        </div>


        {/* Navigation List */}
        <nav className="px-3 space-y-1 font-semibold text-sm flex-1 overflow-y-auto">
          <p style={{ color: '#9b8b7c' }} className="text-[10px] font-extrabold uppercase tracking-widest px-2 pt-1 pb-2">Menu Utama</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const c = colorMap[item.color];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => toggleSidebar && toggleSidebar(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'shadow-sm' : 'hover:bg-white/70'
                  }`
                }
                style={({ isActive }) => isActive
                  ? { background: c.bg, color: c.text, border: `1.5px solid ${c.bg === '#f8cee8' ? '#f0a3d0' : c.bg === '#beeaff' ? '#7dcef5' : c.bg === '#fcf0c0' ? '#f5d96b' : '#ffdbb5'}` }
                  : { color: '#6b5748' }
                }
              >
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: 6, borderRadius: 8 }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 shrink-0" style={{ borderTop: '1.5px solid #f0e8e0' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{ background: '#fff4e7', color: '#9a4a00', border: '1.5px solid #ffdbb5' }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Modal Logout */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(40, 25, 20, 0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative text-center"
            style={{ border: '1.5px solid #f8cee8', animation: 'fadeIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon Avatar */}
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fff4e7 0%, #ffe8d6 100%)',
                border: '2px solid #ffdbb5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#9a4a00',
                boxShadow: '0 4px 14px rgba(255, 219, 181, 0.5)'
              }}
            >
              <LogOut className="w-6 h-6 text-[#9a4a00]" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', marginBottom: 6 }}>
              Konfirmasi Keluar
            </h3>
            <p style={{ fontSize: 13, color: '#7a6655', marginBottom: 22, lineHeight: 1.5 }}>
              Apakah Anda yakin ingin keluar dari akun <strong style={{ color: '#a0336e' }}>{user?.name || 'Boenda Pie'}</strong>?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 14,
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                  transition: 'all 0.2s'
                }}
                className="hover:opacity-90 active:scale-95"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

