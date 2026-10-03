import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { getCachedData, setCachedData } from '../utils/dataCache';
import { Users, Plus, Trash2, Edit, Shield, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState(() => getCachedData('users') || []);
  const [loading, setLoading] = useState(() => !getCachedData('users'));
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', username: '', email: '', password: '', role: 'KASIR', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      if (users.length === 0) setLoading(true);
      const res = await userService.getAll();
      if (res.success) {
        setUsers(res.data);
        setCachedData('users', res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({ id: user._id, name: user.name, username: user.username, email: user.email, password: '', role: user.role, isActive: user.isActive });
    } else {
      setFormData({ id: null, name: '', username: '', email: '', password: '', role: 'KASIR', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (formData.id) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await userService.update(formData.id, payload);
        showToast('Pengguna berhasil diperbarui');
      } else {
        await userService.create(formData);
        showToast('Pengguna berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan pengguna', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus akun ini?')) return;
    try {
      await userService.delete(id);
      showToast('Pengguna berhasil dihapus');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
    }
  };

  return (
    <div className="space-y-6 relative">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#f8cee8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Pengguna</h2>
          <p className="text-xs text-slate-600 font-medium">Kelola akun Admin dan Kasir (Tambah, Edit, Ganti Password, Hapus).</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0] hover:bg-[#f3b5db] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#f8cee8] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat data pengguna..." />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
              <thead className="bg-[#fff4f9] text-[#a0336e] font-extrabold border-b-2 border-[#f0a3d0] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">Nama Lengkap</th>
                  <th className="p-4 whitespace-nowrap">Username &amp; Email</th>
                  <th className="p-4 whitespace-nowrap">Peran (Role)</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{u.name}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{u.username}</div>
                      <div className="text-xs text-slate-600 font-medium">{u.email}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 font-black rounded-lg text-[10px] whitespace-nowrap">
                          <ShieldCheck className="w-3 h-3" /> ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 font-black rounded-lg text-[10px] whitespace-nowrap">
                          <Shield className="w-3 h-3" /> KASIR
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold whitespace-nowrap">
                      {u.isActive ? (
                        <span className="text-emerald-600">Aktif</span>
                      ) : (
                        <span className="text-red-500">Non-aktif</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(u)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">
              {formData.id ? 'Edit Data Pengguna' : 'Tambah Akun Baru'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f0a3d0] focus:bg-white transition-colors" placeholder="Contoh: Budi Susanto" />
              </div>
              
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f0a3d0] focus:bg-white transition-colors" placeholder="Contoh: budi123" />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f0a3d0] focus:bg-white transition-colors" placeholder="Contoh: budi@boendapie.com" />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password {formData.id && <span className="text-slate-400 normal-case font-medium">(Kosongkan jika tidak ingin ganti)</span>}
                </label>
                <input required={!formData.id} minLength={6} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f0a3d0] focus:bg-white transition-colors" placeholder="Min. 6 karakter..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Peran (Role)</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f0a3d0] font-bold">
                    <option value="KASIR">KASIR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Status Akun</label>
                  <select value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f0a3d0] font-bold">
                    <option value="true">Aktif</option>
                    <option value="false">Non-aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-extrabold rounded-2xl hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#fcf0c0] text-[#8a6000] border border-[#f5d96b] font-extrabold rounded-2xl hover:bg-[#f9e88a] transition-colors shadow-xs">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
