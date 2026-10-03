import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username && !password) {
      setError('Username/Email dan Password wajib diisi');
      return;
    } else if (!username) {
      setError('Username/Email wajib diisi');
      return;
    } else if (!password) {
      setError('Password wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await login({ username, password });
      if (user.role === 'ADMIN') navigate('/dashboard');
      else navigate('/pos');
    } catch (err) {
      if (!err.response) {
        const netMsg = 'Koneksi gagal, silakan periksa sambungan server Anda';
        setError(netMsg);
      } else {
        const msg = err.response?.data?.message || err.message || 'Login gagal, periksa kembali akun Anda';
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%', maxWidth: 420,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: 28, padding: 36,
      border: '1.5px solid rgba(248,206,232,0.6)',
      boxShadow: '0 20px 60px rgba(248,206,232,0.3), 0 4px 20px rgba(190,234,255,0.2)',
      position: 'relative', zIndex: 10
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #f8cee8, #beeaff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(248,206,232,0.5)'
        }}>
          <img src="/cute-pie.jpg" alt="logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 14 }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#a0336e', margin: 0, letterSpacing: '-0.5px' }}>BOENDA PIE</h2>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#1a6fa0', letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 }}>
          Sistem Kasir & Manajemen Stok
        </p>
      </div>

      {/* Inline Error Alert */}
      {error && (
        <div style={{
          background: '#fff0f5',
          border: '1.5px solid #f8cee8',
          borderRadius: 14,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#a0336e',
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(248,206,232,0.3)'
        }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, color: '#e11d48' }} />
          <span style={{ flex: 1, lineHeight: 1.3 }}>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#a0336e',
              fontSize: 14,
              padding: '0 4px',
              fontWeight: 800
            }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Username */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9b8b7c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Username / Email
          </label>
          <div style={{ position: 'relative' }}>
            <User style={{ width: 18, height: 18, color: '#f0a3d0', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username/email..."
              style={{
                width: '100%', background: '#fff4e7', border: '1.5px solid #ffdbb5',
                borderRadius: 14, padding: '12px 14px 12px 42px',
                color: '#3d2c1e', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#f0a3d0'}
              onBlur={e => e.target.style.borderColor = '#ffdbb5'}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9b8b7c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ width: 18, height: 18, color: '#7dcef5', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              style={{
                width: '100%', background: '#fff4e7', border: '1.5px solid #ffdbb5',
                borderRadius: 14, padding: '12px 44px 12px 42px',
                color: '#3d2c1e', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#7dcef5'}
              onBlur={e => e.target.style.borderColor = '#ffdbb5'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: showPassword ? '#1a6fa0' : '#9b8b7c'
              }}
              tabIndex={-1}
            >
              {showPassword ? (
                <Eye style={{ width: 18, height: 18 }} />
              ) : (
                <EyeOff style={{ width: 18, height: 18 }} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '14px', marginTop: 18,
            background: 'linear-gradient(135deg, #f8cee8 0%, #beeaff 100%)',
            border: '1.5px solid #f0a3d0', borderRadius: 16,
            color: '#a0336e', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 15px rgba(248,206,232,0.4)',
            transition: 'opacity 0.2s, transform 0.2s',
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {isSubmitting ? (
            <>
              <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::-ms-reveal, input::-ms-clear { display: none; }
      `}</style>
    </div>
  );
};

export default LoginPage;
