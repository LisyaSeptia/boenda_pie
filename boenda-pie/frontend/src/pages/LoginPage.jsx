import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username/Email dan Password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({ username, password });
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/pos');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login gagal, periksa kembali akun Anda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 mb-4 shadow-lg shadow-amber-500/25">
          <PieChart className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">BOENDA PIE</h2>
        <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase mt-1">Sistem Kasir & Manajemen Stok</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Username / Email</label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username/email..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk ke Sistem</span>
          )}
        </button>
      </form>

      {/* Demo Credentials Box */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">Akun Demo Standar:</p>
        <div className="flex justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span>Admin: <strong className="text-amber-400">admin</strong> / admin123</span>
          <button
            type="button"
            onClick={() => { setUsername('admin'); setPassword('admin123'); }}
            className="text-amber-400 underline hover:text-amber-300"
          >
            Gunakan
          </button>
        </div>
        <div className="flex justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span>Kasir: <strong className="text-amber-400">kasir</strong> / kasir123</span>
          <button
            type="button"
            onClick={() => { setUsername('kasir'); setPassword('kasir123'); }}
            className="text-amber-400 underline hover:text-amber-300"
          >
            Gunakan
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
