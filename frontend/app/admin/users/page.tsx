'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, Plus, Edit2, Lock, Unlock, 
  Trash2, Eye, AlertCircle, CheckCircle2, X, RefreshCw,
  UserCheck, UserX, Shield, Mail, Phone, Key
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'Customer' | 'Admin' | 'Editor' | 'Staff';
  status: 'active' | 'locked';
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Customer',
    phoneNumber: '',
    isActive: true
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'Customer',
    phoneNumber: '',
    newPassword: '',
    isActive: true
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }

    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    } catch {
      router.push('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');
      if (Array.isArray(res.data)) {
        setUsers(res.data.map((u: any) => ({
          id: u.id,
          fullName: u.fullName || 'Chưa đặt tên',
          email: u.email,
          phoneNumber: u.phoneNumber || '',
          role: u.role || 'Customer',
          status: (u.isActive ?? true) ? 'active' : 'locked',
          createdAt: u.createdAt || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt
        })));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      showToast('Vui lòng nhập họ tên, email và mật khẩu.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/users', {
        fullName: addForm.fullName,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role,
        phoneNumber: addForm.phoneNumber || null,
        isActive: addForm.isActive
      });

      showToast('Tạo người dùng mới thành công!');
      setShowAddModal(false);
      setAddForm({
        fullName: '',
        email: '',
        password: '',
        role: 'Customer',
        phoneNumber: '',
        isActive: true
      });
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể tạo người dùng.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      newPassword: '',
      isActive: user.status === 'active'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      await api.put(`/users/${editingUser.id}`, {
        fullName: editForm.fullName,
        email: editForm.email,
        role: editForm.role,
        phoneNumber: editForm.phoneNumber || null,
        newPassword: editForm.newPassword || null,
        isActive: editForm.isActive
      });

      showToast('Cập nhật người dùng thành công!');
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể cập nhật người dùng.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (user: User) => {
    const isCurrentlyActive = user.status === 'active';
    const actionName = isCurrentlyActive ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản "${user.fullName}"?`)) return;

    try {
      await api.patch(`/users/${user.id}/lock`, {});
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: isCurrentlyActive ? 'locked' : 'active' } : u
      ));
      showToast(`Đã ${actionName} tài khoản thành công!`);
    } catch (error) {
      console.error('Failed to toggle lock user:', error);
      showToast('Lỗi khi thay đổi trạng thái tài khoản', 'error');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${user.fullName}" (${user.email})?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'locked' } : u));
      showToast(`Đã vô hiệu hóa tài khoản "${user.fullName}"!`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast('Không thể xóa tài khoản này', 'error');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { roleName: newRole });
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole as User['role'] } : u
      ));
      showToast(`Đã đổi vai trò thành ${newRole}!`);
    } catch (error) {
      console.error('Failed to change role:', error);
      showToast('Không thể thay đổi vai trò người dùng', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phoneNumber && user.phoneNumber.includes(searchTerm));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Người dùng & Tài khoản</h1>
              <p className="text-xs text-slate-500">{users.length} tài khoản trong hệ thống</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm User Mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Customer">Khách hàng (Customer)</option>
              <option value="Staff">Nhân viên hỗ trợ (Staff)</option>
              <option value="Editor">Biên tập viên (Editor)</option>
              <option value="Admin">Quản trị viên (Admin)</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                  <th className="text-left py-3.5 px-4 font-bold">Người dùng</th>
                  <th className="text-left py-3.5 px-4 font-bold">Vai trò</th>
                  <th className="text-left py-3.5 px-4 font-bold">Trạng thái</th>
                  <th className="text-left py-3.5 px-4 font-bold">Ngày đăng ký</th>
                  <th className="text-right py-3.5 px-4 font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                          {user.fullName[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-600" />
                            {user.email}
                            {user.phoneNumber && (
                              <span className="flex items-center gap-1 ml-2 text-slate-600">
                                <Phone className="w-3 h-3" /> {user.phoneNumber}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.role === 'Staff' ? 'bg-blue-50 text-[#1F1F1F] border-blue-200' :
                          user.role === 'Editor' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Customer">Customer</option>
                        <option value="Staff">Staff</option>
                        <option value="Editor">Editor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Lock / Unlock Toggle Button */}
                        <button 
                          onClick={() => handleToggleLock(user)}
                          className={`p-2 rounded-xl transition-colors ${
                            user.status === 'active' 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        
                        {/* Edit User Button */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-slate-500 hover:text-[#1F1F1F] hover:bg-blue-50 rounded-xl transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Deactivate User Button */}
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Vô hiệu hóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-bold text-slate-700">Không tìm thấy người dùng nào</p>
              <p className="text-xs text-slate-600 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Thêm Người Dùng Mới</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tạo tài khoản quản trị hoặc khách hàng mới</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  placeholder="nguyenvana@gmail.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mật khẩu khởi tạo</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Vai trò hệ thống</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Staff">Staff</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0912345678"
                    value={addForm.phoneNumber}
                    onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Chỉnh Sửa Người Dùng</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingUser.email}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Vai trò hệ thống</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Staff">Staff</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Đổi mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới..."
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Trạng thái tài khoản</label>
                <select
                  value={editForm.isActive ? '1' : '0'}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === '1' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="1">Đang hoạt động (Active)</option>
                  <option value="0">Bị khóa / Vô hiệu hóa (Locked)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
