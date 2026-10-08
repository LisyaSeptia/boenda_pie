import React, { useEffect, useState, useMemo } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { getCachedData, setCachedData } from '../utils/dataCache';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Shield,
  ShieldCheck,
  Search,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  AtSign,
  User,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColors = [
  { bg: '#fffbea', text: '#8a6000', border: '#f5d96b' },
  { bg: '#e8f7ff', text: '#1a6fa0', border: '#7dcef5' },
  { bg: '#fff0f7', text: '#a0336e', border: '#f0a3d0' },
  { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
  { bg: '#f5f3ff', text: '#6d28d9', border: '#c4b5fd' },
];

const getAvatarStyle = (name = '') => {
  const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[code % avatarColors.length];
};

const AvatarBadge = ({ name = '', size = 42 }) => {
  const st = getAvatarStyle(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: st.bg,
        border: `1.5px solid ${st.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 900,
        fontSize: Math.round(size * 0.36),
        color: st.text,
        letterSpacing: 0.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      {getInitials(name)}
    </div>
  );
};

const FieldGroup = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>{children}</div>
    {hint && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#b45309', fontWeight: 600 }}>
        <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
        <span>{hint}</span>
      </div>
    )}
  </div>
);

const LeftIcon = ({ icon: Icon, color = '#94a3b8' }) => (
  <Icon
    style={{
      width: 16,
      height: 16,
      color,
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }}
  />
);

const inputStyle = {
  width: '100%',
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: 14,
  padding: '11px 14px 11px 40px',
  color: '#1e293b',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontWeight: 600,
  transition: 'border-color 0.15s, background-color 0.15s'
};

const UsersPage = () => {
  const { user: currentUser, isAdmin, updateUserData } = useAuth();
  const [users, setUsers] = useState(() => getCachedData('users') || []);
  const [loading, setLoading] = useState(() => !getCachedData('users'));
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Filter & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'password' | null
  const [activeUser, setActiveUser] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'KASIR',
    isActive: true
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (users.length === 0) setLoading(true);
      const res = await userService.getAll();
      if (res.success) {
        setUsers(res.data);
        setCachedData('users', res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat daftar pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: users.length,
      kasir: users.filter((u) => u.role === 'KASIR').length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
      active: users.filter((u) => u.isActive).length,
    };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setFormData({
      id: null,
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'KASIR',
      isActive: true
    });
    setShowPassword(false);
    setModalMode('create');
  };

  const handleOpenEdit = (user) => {
    setActiveUser(user);
    setFormData({
      id: user._id,
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.role || 'KASIR',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setModalMode('edit');
  };

  const handleOpenPassword = (user) => {
    setActiveUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalMode('password');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveUser(null);
    setIsSubmitting(false);
  };

  // Submit Tambah / Edit Pengguna
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const payload = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          isActive: true
        };
        await userService.create(payload);
        showToast('Akun baru berhasil ditambahkan!');
      } else if (modalMode === 'edit') {
        const { id, ...rest } = formData;
        const payload = {
          name: rest.name.trim(),
          role: rest.role,
          isActive: true
        };
        const res = await userService.update(id, payload);

        // Jika mengedit akun diri sendiri, update context auth
        if (currentUser && (currentUser._id === id || currentUser.id === id)) {
          if (res?.data) {
            updateUserData(res.data);
          }
        }

        showToast('Data pengguna berhasil diperbarui!');
      }

      setCachedData('users', null);
      closeModal();
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data pengguna', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Ubah Password
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwordForm;

    if (!newPassword || newPassword.length < 6) {
      return showToast('Password baru minimal 6 karakter', 'error');
    }
    if (newPassword !== confirmPassword) {
      return showToast('Konfirmasi password tidak cocok', 'error');
    }

    setIsSubmitting(true);
    try {
      await userService.update(activeUser._id, { password: newPassword });
      showToast(`Password akun "${activeUser.name}" berhasil diubah!`);
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    if (currentUser && (currentUser._id === deleteTarget._id || currentUser.id === deleteTarget._id)) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      setDeleteTarget(null);
      return;
    }

    try {
      await userService.delete(deleteTarget._id);
      showToast(`Akun "${deleteTarget.name}" berhasil dihapus.`);
      setCachedData('users', null);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Top Header & Tambah Akun (Tema Kuning Elegan Khas Boenda Pie) */}
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '20px 24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: '#fffbea',
              border: '1.5px solid #f5d96b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Users style={{ width: 22, height: 22, color: '#8a6000' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>
              Manajemen Pengguna &amp; Akun
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2, fontWeight: 500 }}>
              Kelola data staf kasir dan admin, ganti nama akun, atur peran serta kata sandi.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b] hover:bg-[#fae792] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Tab Filter Peran (Kasir Pink, Admin Biru) */}
        <div className="flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
          <button
            onClick={() => setRoleFilter('ALL')}
            style={{ minWidth: 155 }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-colors border cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-[#fcf0c0] text-[#8a6000] border-[#f5d96b]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#fffbea] hover:border-[#f5d96b] hover:text-[#8a6000]'
            }`}
          >
            Semua Pengguna ({stats.total})
          </button>
          <button
            onClick={() => setRoleFilter('KASIR')}
            style={{ minWidth: 100 }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-colors border cursor-pointer ${
              roleFilter === 'KASIR'
                ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#fff0f7] hover:border-[#f0a3d0] hover:text-[#a0336e]'
            }`}
          >
            Kasir ({stats.kasir})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            style={{ minWidth: 130 }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-colors border cursor-pointer ${
              roleFilter === 'ADMIN'
                ? 'bg-[#beeaff] text-[#1a6fa0] border-[#7dcef5]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#e8f7ff] hover:border-[#7dcef5] hover:text-[#1a6fa0]'
            }`}
          >
            Administrator ({stats.admin})
          </button>
        </div>

        {/* Input Search Box dengan Garis Pinggir Kuning Soft */}
        <div style={{ position: 'relative', minWidth: 260, maxWidth: 380, flex: 1 }}>
          <Search
            style={{
              width: 15,
              height: 15,
              color: '#c8a84b',
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'white',
              border: '1px solid #f0e6c0',
              borderRadius: 14,
              padding: '8px 34px 8px 36px',
              fontSize: 12,
              color: '#334155',
              outline: 'none',
              boxSizing: 'border-box',
              fontWeight: 400
            }}
            onFocus={(e) => (e.target.style.borderColor = '#f5d96b')}
            onBlur={(e) => (e.target.style.borderColor = '#f0e6c0')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 2,
                display: 'flex'
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Metric Cards (3 Kartu Bersih Persis Laporan) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Pengguna (Kuning Pastel Utama) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fffbea 0%, #fcf0c0 100%)',
            padding: '18px 20px',
            borderRadius: 20,
            border: '1.5px solid #f5d96b',
            boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Users style={{ width: 22, height: 22, color: '#8a6000' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#7a5500',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                margin: '0 0 4px'
              }}
            >
              Total Akun Pengguna
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>
              {stats.total} Akun
            </h3>
          </div>
        </div>

        {/* Card 2: Total Kasir (Pink Pastel Lembut) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fff0f7 0%, #f8cee8 100%)',
            padding: '18px 20px',
            borderRadius: 20,
            border: '1.5px solid #f0a3d0',
            boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Shield style={{ width: 22, height: 22, color: '#a0336e' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#8a2060',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                margin: '0 0 4px'
              }}
            >
              Total Staf Kasir
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>
              {stats.kasir} Kasir
            </h3>
          </div>
        </div>

        {/* Card 3: Administrator (Biru Pastel Lembut) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e8f7ff 0%, #beeaff 100%)',
            padding: '18px 20px',
            borderRadius: 20,
            border: '1.5px solid #7dcef5',
            boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <ShieldCheck style={{ width: 22, height: 22, color: '#1a6fa0' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#1a5a80',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                margin: '0 0 4px'
              }}
            >
              Administrator
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>
              {stats.admin} Admin
            </h3>
          </div>
        </div>
      </div>

      {/* Users Table (Tanpa Kolom Status, Bersih & Rapih) */}
      <div className="bg-white rounded-2xl border border-[#fcf0c0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner text="Memuat data pengguna..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-amber-200" />
            <p className="font-semibold text-sm text-slate-600">Tidak ada pengguna ditemukan.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto" style={{ overflowY: 'scroll', scrollbarWidth: 'none' }}>
            <table className="w-full text-left text-xs text-slate-700" style={{ tableLayout: 'fixed', minWidth: 640 }}>
              <colgroup>
                <col style={{ width: 90 }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 110 }} />
              </colgroup>
              <thead className="bg-[#fffbea] text-[#8a6000] font-extrabold border-b-2 border-[#f5d96b] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">KODE</th>
                  <th className="p-4">NAMA PENGGUNA</th>
                  <th className="p-4 whitespace-nowrap">USERNAME &amp; EMAIL</th>
                  <th className="p-4 whitespace-nowrap">PERAN</th>
                  <th className="p-4 text-center whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u, idx) => {
                  const isCurrent = currentUser && (currentUser._id === u._id || currentUser.id === u._id);
                  const userCode = `USR-${String(idx + 1).padStart(3, '0')}`;

                  return (
                    <tr key={u._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                        {userCode}
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{u.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b] font-black rounded-lg text-[9px] uppercase tracking-wider whitespace-nowrap">
                              Akun Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                          ID: {u._id.slice(-6).toUpperCase()} &bull; Terdaftar di sistem
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">@{u.username}</div>
                        <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg text-[11px] border whitespace-nowrap ${
                          u.role === 'ADMIN'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-pink-50 text-pink-700 border-pink-200'
                        }`}>
                          {u.role === 'ADMIN' ? '👑 Admin' : '💼 Kasir'}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-pink-500 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Nama Pengguna"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPassword(u)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Ganti Password Akun"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={isCurrent ? 'Tidak bisa menghapus akun sendiri' : 'Hapus Pengguna'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Tambah / Edit Pengguna (Compact, No-Scroll & Aesthetic Kuning) */}
      {modalMode && modalMode !== 'password' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(20, 10, 15, 0.45)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 22,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              border: '1.5px solid #f5d96b',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed) */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1.5px solid #fffbea',
                background: '#fffdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: '#fffbea',
                    border: '1.5px solid #f5d96b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {modalMode === 'create' ? (
                    <Plus style={{ width: 18, height: 18, color: '#8a6000' }} />
                  ) : (
                    <Edit3 style={{ width: 18, height: 18, color: '#8a6000' }} />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>
                    {modalMode === 'create' ? 'Tambah Akun Baru' : 'Edit Pengguna'}
                  </h3>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                    {modalMode === 'create'
                      ? 'Daftarkan kasir atau admin baru'
                      : `Ubah data nama untuk "${activeUser?.name}"`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={handleSubmitUser}
              autoComplete="off"
              style={{
                padding: '16px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 13
              }}
            >
              {modalMode === 'edit' && activeUser && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: '#fffbea',
                    borderRadius: 14,
                    border: '1.5px solid #f5d96b'
                  }}
                >
                  <AvatarBadge name={activeUser.name} size={38} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#3d2c1e' }}>{activeUser.name}</div>
                    <div style={{ fontSize: 11, color: '#8a6000', fontWeight: 600 }}>@{activeUser.username} &bull; {activeUser.role}</div>
                  </div>
                </div>
              )}

              {/* Nama Lengkap */}
              <FieldGroup label="Nama Lengkap">
                <LeftIcon icon={User} color="#8a6000" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Contoh: Siti Rahayu"
                  onFocus={(e) => (e.target.style.borderColor = '#f5d96b')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </FieldGroup>

              {/* Username & Peran */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FieldGroup label="Username">
                  <LeftIcon icon={modalMode === 'edit' ? Lock : AtSign} color={modalMode === 'edit' ? '#94a3b8' : '#8a6000'} />
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) => modalMode === 'create' && setFormData({ ...formData, username: e.target.value })}
                    readOnly={modalMode === 'edit'}
                    disabled={modalMode === 'edit'}
                    style={{
                      ...inputStyle,
                      background: modalMode === 'edit' ? '#f1f5f9' : '#f8fafc',
                      color: modalMode === 'edit' ? '#64748b' : '#1e293b',
                      cursor: modalMode === 'edit' ? 'not-allowed' : 'text',
                      fontWeight: 700
                    }}
                    placeholder="Contoh: sitir12"
                    onFocus={(e) => modalMode === 'create' && (e.target.style.borderColor = '#f5d96b')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </FieldGroup>

                <FieldGroup label="Peran (Role)">
                  <LeftIcon icon={Shield} color="#8a6000" />
                  <div style={{ position: 'relative' }}>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        ...inputStyle,
                        background: '#fffdf5',
                        border: '1.5px solid #f5d96b',
                        paddingRight: 34,
                        cursor: 'pointer',
                        fontWeight: 700,
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="KASIR">Kasir</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <ChevronDown style={{ width: 15, height: 15, color: '#8a6000', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </FieldGroup>
              </div>

              {/* Email */}
              <FieldGroup label="Alamat Email">
                <LeftIcon icon={modalMode === 'edit' ? Lock : Mail} color={modalMode === 'edit' ? '#94a3b8' : '#94a3b8'} />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => modalMode === 'create' && setFormData({ ...formData, email: e.target.value })}
                  readOnly={modalMode === 'edit'}
                  disabled={modalMode === 'edit'}
                  style={{
                    ...inputStyle,
                    background: modalMode === 'edit' ? '#f1f5f9' : '#f8fafc',
                    color: modalMode === 'edit' ? '#64748b' : '#1e293b',
                    cursor: modalMode === 'edit' ? 'not-allowed' : 'text',
                    fontWeight: 700
                  }}
                  placeholder="Contoh: siti@boendapie.com"
                  onFocus={(e) => modalMode === 'create' && (e.target.style.borderColor = '#f5d96b')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </FieldGroup>

              {/* Password saat create akun */}
              {modalMode === 'create' ? (
                <FieldGroup label="Password Awal Akun (Minimal 6 Karakter)">
                  <LeftIcon icon={KeyRound} color="#8a6000" />
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: 40 }}
                    placeholder="Masukkan password awal..."
                    onFocus={(e) => (e.target.style.borderColor = '#f5d96b')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 4,
                      display: 'flex'
                    }}
                  >
                    {showPassword ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
                  </button>
                </FieldGroup>
              ) : (
                /* Card ganti password saat edit */
                <div
                  style={{
                    background: '#fffbea',
                    border: '1.5px solid #f5d96b',
                    borderRadius: 14,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#fcf0c0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#8a6000',
                        flexShrink: 0
                      }}
                    >
                      <KeyRound style={{ width: 16, height: 16 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>
                        Kata Sandi Akun
                      </div>
                      <div style={{ fontSize: 11, color: '#8a6000' }}>
                        Ingin mengubah kata sandi akun ini?
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeUser) {
                        handleOpenPassword(activeUser);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: '#fcf0c0',
                      border: '1px solid #f5d96b',
                      color: '#8a6000',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Ganti Sandi
                  </button>
                </div>
              )}

              {/* Tombol Aksi */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #fffbea 0%, #fcf0c0 100%)',
                    border: '1.5px solid #f5d96b',
                    color: '#8a6000',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(245, 217, 107, 0.25)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save style={{ width: 15, height: 15 }} />
                      <span>{modalMode === 'create' ? 'Buat Akun Baru' : 'Simpan Perubahan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ganti Password */}
      {modalMode === 'password' && activeUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(20, 10, 15, 0.45)',
            overflowY: 'auto'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 22,
              width: '100%',
              maxWidth: 400,
              maxHeight: 'min(90vh, 560px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              border: '1.5px solid #f5d96b',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1.5px solid #fffbea',
                background: '#fffdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    background: '#fffbea',
                    border: '1.5px solid #f5d96b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <KeyRound style={{ width: 20, height: 20, color: '#8a6000' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>
                    Ganti Password Akun
                  </h3>
                  <p style={{ fontSize: 11, color: '#8a6000', margin: '2px 0 0', fontWeight: 600 }}>
                    Akun: <strong>{activeUser.name}</strong> (@{activeUser.username})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitPassword} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FieldGroup label="Password Baru (Minimal 6 Karakter)">
                <LeftIcon icon={KeyRound} color="#8a6000" />
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  placeholder="Masukkan password baru..."
                  onFocus={(e) => (e.target.style.borderColor = '#f5d96b')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 4,
                    display: 'flex'
                  }}
                >
                  {showPassword ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
                </button>
              </FieldGroup>

              <FieldGroup label="Konfirmasi Password Baru">
                <LeftIcon icon={KeyRound} color="#8a6000" />
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  placeholder="Ketik ulang password baru..."
                  onFocus={(e) => (e.target.style.borderColor = '#f5d96b')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 4,
                    display: 'flex'
                  }}
                >
                  {showConfirmPassword ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
                </button>
              </FieldGroup>

              {passwordForm.newPassword && passwordForm.confirmPassword && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: passwordForm.newPassword === passwordForm.confirmPassword ? '#059669' : '#dc2626',
                    padding: '8px 12px',
                    background: passwordForm.newPassword === passwordForm.confirmPassword ? '#d1fae5' : '#fee2e2',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {passwordForm.newPassword === passwordForm.confirmPassword ? (
                    <>
                      <CheckCircle2 style={{ width: 14, height: 14 }} />
                      <span>Password cocok dan siap disimpan</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle style={{ width: 14, height: 14 }} />
                      <span>Konfirmasi password belum cocok</span>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #fffbea 0%, #fcf0c0 100%)',
                    border: '1.5px solid #f5d96b',
                    color: '#8a6000',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(245, 217, 107, 0.25)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <>
                      <Save style={{ width: 16, height: 16 }} />
                      <span>Simpan Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Akun */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(20, 10, 15, 0.45)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 24,
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              border: '1.5px solid #fecaca',
              padding: 26,
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: '#fee2e2',
                border: '2px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#dc2626'
              }}
            >
              <Trash2 style={{ width: 26, height: 26 }} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 6 }}>
              Hapus Akun Pengguna?
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
              <AvatarBadge name={deleteTarget.name} size={48} />
            </div>

            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 22, lineHeight: 1.5 }}>
              Akun <strong style={{ color: '#1e293b' }}>{deleteTarget.name}</strong> (
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>
                @{deleteTarget.username}
              </code>
              ) akan dihapus secara permanen dari sistem.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  color: '#64748b',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.35)'
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::-ms-reveal, input::-ms-clear { display: none; }
      `}</style>
    </div>
  );
};

export default UsersPage;
