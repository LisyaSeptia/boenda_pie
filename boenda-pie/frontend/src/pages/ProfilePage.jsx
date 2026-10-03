import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Toast from '../components/Toast';
import {
  User,
  Mail,
  AtSign,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserData, isAdmin } = useAuth();

  // State Nama Profil
  const [name, setName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // State Ganti Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // 1. Simpan Perubahan Nama
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama lengkap tidak boleh kosong', 'error');
      return;
    }

    setIsUpdatingName(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      if (res.success && res.data?.user) {
        updateUserData(res.data.user);
        showToast('Nama profil berhasil diperbarui!', 'success');
      } else {
        showToast(res.message || 'Gagal memperbarui nama profil', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui nama profil', 'error');
    } finally {
      setIsUpdatingName(false);
    }
  };

  // 2. Ganti Password Akun
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Semua kolom password wajib diisi', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password baru tidak cocok', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.updatePassword({
        currentPassword,
        newPassword
      });

      if (res.success) {
        showToast('Password berhasil diganti!', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showToast(res.message || 'Gagal mengubah password', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password saat ini tidak sesuai', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div style={{
        background: 'white',
        borderRadius: 24, padding: '20px 24px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: isAdmin ? '#fff0f7' : '#e8f7ff',
            border: `1.5px solid ${isAdmin ? '#f0a3d0' : '#7dcef5'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <User style={{ width: 22, height: 22, color: isAdmin ? '#a0336e' : '#1a6fa0' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>
                {user?.name || 'Pengguna Boenda Pie'}
              </h2>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                background: isAdmin ? '#f8cee8' : '#beeaff',
                color: isAdmin ? '#a0336e' : '#1a6fa0',
                border: `1px solid ${isAdmin ? '#f0a3d0' : '#7dcef5'}`
              }}>
                {isAdmin ? 'ADMINISTRATOR' : 'KASIR'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#9b8b7c', margin: 0 }}>
              Kelola profil akun Anda. Nama dan kata sandi dapat diperbarui kapan saja.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Akun & Ganti Password */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Card 1: Data Akun Login (Email & Username Terkunci/Read-Only) */}
        <div style={{
          background: 'white', borderRadius: 22, border: '1.5px solid #beeaff',
          boxShadow: '0 4px 20px rgba(190,234,255,0.2)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1.5px solid #f0f9ff' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: '#e8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User style={{ width: 20, height: 20, color: '#1a6fa0' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#3d2c1e', margin: 0 }}>Data Akun Saya</h3>
              <p style={{ fontSize: 12, color: '#9b8b7c', margin: 0 }}>Email &amp; username akun Anda</p>
            </div>
          </div>

          <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Nama Lengkap */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5748', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Nama Lengkap / Tampilan
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ width: 17, height: 17, color: '#7dcef5', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  style={{
                    width: '100%', background: '#fffaf5', border: '1.5px solid #beeaff',
                    borderRadius: 14, padding: '11px 14px 11px 42px',
                    color: '#3d2c1e', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a6fa0'}
                  onBlur={e => e.target.style.borderColor = '#beeaff'}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5748', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <AtSign style={{ width: 17, height: 17, color: '#9b8b7c', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  readOnly
                  style={{
                    width: '100%', background: '#f5f7fa', border: '1.5px solid #e2e8f0',
                    borderRadius: 14, padding: '11px 14px 11px 42px',
                    color: '#64748b', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    cursor: 'not-allowed', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5748', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Alamat Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ width: 17, height: 17, color: '#9b8b7c', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  style={{
                    width: '100%', background: '#f5f7fa', border: '1.5px solid #e2e8f0',
                    borderRadius: 14, padding: '11px 14px 11px 42px',
                    color: '#64748b', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    cursor: 'not-allowed', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Tombol Simpan Nama */}
            <button
              type="submit"
              disabled={isUpdatingName}
              style={{
                marginTop: 6, padding: '12px', background: '#beeaff', border: '1.5px solid #7dcef5',
                borderRadius: 14, color: '#1a6fa0', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s', opacity: isUpdatingName ? 0.7 : 1
              }}
            >
              {isUpdatingName ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: 16, height: 16 }} />
                  <span>Simpan Perubahan Nama</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Card 2: Ganti Password */}
        <div style={{
          background: 'white', borderRadius: 22, border: '1.5px solid #f8cee8',
          boxShadow: '0 4px 20px rgba(248,206,232,0.2)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1.5px solid #fff0f7' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fff0f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound style={{ width: 20, height: 20, color: '#a0336e' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#3d2c1e', margin: 0 }}>Ganti Password</h3>
              <p style={{ fontSize: 12, color: '#9b8b7c', margin: 0 }}>Klik ikon mata untuk melihat password</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Password Saat Ini */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5748', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Password Saat Ini
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound style={{ width: 17, height: 17, color: '#f0a3d0', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Masukkan password saat ini..."
                  style={{
                    width: '100%', background: '#fffaf5', border: '1.5px solid #e0e8f0',
                    borderRadius: 14, padding: '11px 44px 11px 42px',
                    color: '#3d2c1e', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f0a3d0'}
                  onBlur={e => e.target.style.borderColor = '#e0e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                    color: showCurrent ? '#a0336e' : '#9b8b7c', display: 'flex', alignItems: 'center'
                  }}
                  tabIndex={-1}
                  title={showCurrent ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showCurrent ? <Eye style={{ width: 17, height: 17 }} /> : <EyeOff style={{ width: 17, height: 17 }} />}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5748', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Password Baru
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound style={{ width: 17, height: 17, color: '#f0a3d0', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimal 6 karakter..."
                  style={{
                    width: '100%', background: '#fffaf5', border: '1.5px solid #e0e8f0',
                    borderRadius: 14, padding: '11px 44px 11px 42px',
                    color: '#3d2c1e', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f0a3d0'}
                  onBlur={e => e.target.style.borderColor = '#e0e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                    color: showNew ? '#a0336e' : '#9b8b7c', display: 'flex', alignItems: 'center'
                  }}
                  tabIndex={-1}
                  title={showNew ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showNew ? <Eye style={{ width: 17, height: 17 }} /> : <EyeOff style={{ width: 17, height: 17 }} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5748', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Konfirmasi Password Baru
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound style={{ width: 17, height: 17, color: '#f0a3d0', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Ulangi password baru..."
                  style={{
                    width: '100%', background: '#fffaf5', border: '1.5px solid #e0e8f0',
                    borderRadius: 14, padding: '11px 44px 11px 42px',
                    color: '#3d2c1e', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f0a3d0'}
                  onBlur={e => e.target.style.borderColor = '#e0e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                    color: showConfirm ? '#a0336e' : '#9b8b7c', display: 'flex', alignItems: 'center'
                  }}
                  tabIndex={-1}
                  title={showConfirm ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showConfirm ? <Eye style={{ width: 17, height: 17 }} /> : <EyeOff style={{ width: 17, height: 17 }} />}
                </button>
              </div>
            </div>

            {/* Tombol Simpan Password */}
            <button
              type="submit"
              disabled={isUpdatingPassword}
              style={{
                marginTop: 6, padding: '12px', background: '#f8cee8', border: '1.5px solid #f0a3d0',
                borderRadius: 14, color: '#a0336e', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s', opacity: isUpdatingPassword ? 0.7 : 1
              }}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: 16, height: 16 }} />
                  <span>Perbarui Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::-ms-reveal, input::-ms-clear { display: none; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
