import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = ({ toggleSidebar, title = 'Boenda Pie Purwokerto' }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 rounded-lg md:hidden hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <UserIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>{user?.name}</span>
          <span className="text-slate-400">|</span>
          <span className="text-amber-700 font-bold uppercase">{user?.role}</span>
        </div>

        <button
          onClick={logout}
          title="Logout"
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
