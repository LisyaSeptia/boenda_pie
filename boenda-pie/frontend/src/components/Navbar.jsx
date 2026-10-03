import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, User as UserIcon } from 'lucide-react';

const Navbar = ({ toggleSidebar, title = 'Boenda Pie Purwokerto' }) => {
  const { user } = useAuth();

  return (
    <header style={{ background: '#fff4f9', borderBottom: '2px solid #f8cee8', boxShadow: '0 2px 16px rgba(248,206,232,0.3)' }}
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          style={{ color: '#a0336e', background: '#f8cee8' }}
          className="p-2 rounded-xl md:hidden hover:opacity-80 transition-opacity"
        >
          <Menu className="w-5 h-5" />
        </button>

      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          style={{ background: '#fff4e7', border: '1.5px solid #ffdbb5', color: '#9a4a00', textDecoration: 'none' }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold hover:border-[#f0a3d0] hover:bg-[#fff0f7] transition-all cursor-pointer shadow-sm"
          title="Buka Profil Saya"
        >
          <UserIcon className="w-3.5 h-3.5" style={{ color: '#f0a3d0' }} />
          <span>{user?.name}</span>
          <span style={{ color: '#ffdbb5' }}>|</span>
          <span style={{ color: '#a0336e' }} className="font-extrabold uppercase">{user?.role}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
