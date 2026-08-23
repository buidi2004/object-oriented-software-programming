'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, Plus, Edit2, Lock, Unlock, 
  Trash2, Eye, AlertCircle, CheckCircle2, X, RefreshCw,
  UserCheck, UserX, Shield, Mail, Phone, Key, ShieldCheck,
  Wallet, Wrench, FileText, Headphones, User as UserIcon,
  History as HistoryIcon, Clock
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'locked'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      fetchUsersAndRoles();
    } catch {
      router.push('/login');
    }
  };

  const fetchUsersAndRoles = async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes, logsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/roles').catch(() => ({ data: [] })),
        api.get('/audit-logs').catch(() => ({ data: [] }))
      ]);

      if (Array.isArray(usersRes.data)) {
        setUsers(usersRes.data.map((u: any) => ({
          id: u.id,
          fullName: u.fullName || 'Chưa đặt tên',
          email: u.email,
          phoneNumber: u.phoneNumber || '',
          role: u.role || 'Customer',
          isActive: u.isActive ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt
        })));
      }

      if (Array.isArray(rolesRes.data)) {
        setRoles(rolesRes.data);
      }

      if (Array.isArray(logsRes.data)) {
        setAuditLogs(logsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper metadata for roles
  const getRoleBadge = (roleName: string) => {
    const r = (roleName || 'Customer').toLowerCase();
    if (r === 'admin') {
      return {
        label: 'Quản Trị Viên',
        icon: ShieldCheck,
        className: 'bg-red-50 text-red-700 border-red-200'
      };
    }
    if (r === 'accountant' || r.includes('kế toán')) {
      return {
        label: 'Kế Toán',
        icon: Wallet,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (r === 'technician' || r.includes('kỹ thuật')) {
      return {
        label: 'Kỹ Thuật',
        icon: Wrench,
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }
    if (r === 'editor' || r.includes('biên tập')) {
      return {
        label: 'Biên Tập Viên',
        icon: FileText,
        className: 'bg-purple-50 text-purple-700 border-purple-200'
      };
    }
    if (r === 'support' || r.includes('cskh')) {
      return {
        label: 'CSKH Support',
        icon: Headphones,
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    return {
      label: 'Khách Hàng',
      icon: UserIcon,
      className: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  };

  // Stats calculation
  const stats = useMemo(() => {
    let customerCount = 0;
    let staffCount = 0;
    let lockedCount = 0;
    let accountantCount = 0;
    let technicianCount = 0;

    users.forEach(u => {
      if (!u.isActive) lockedCount++;
      const r = u.role.toLowerCase();
      if (r === 'customer') customerCount++;
      else {
        staffCount++;
        if (r === 'accountant') accountantCount++;
        if (r === 'technician') technicianCount++;
      }
    });

    return { total: users.length, customerCount, staffCount, lockedCount, accountantCount, technicianCount };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (filterRole !== 'all') {
        if (user.role.toLowerCase() !== filterRole.toLowerCase()) return false;
      }

      // Status filter
      if (filterStatus === 'active' && !user.isActive) return false;
      if (filterStatus === 'locked' && user.isActive) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = user.fullName.toLowerCase().includes(q);
        const matchEmail = user.email.toLowerCase().includes(q);
        const matchPhone = user.phoneNumber?.toLowerCase().includes(q);
        const matchRole = user.role.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchRole;
      }

      return true;
    });
  }, [users, filterRole, filterStatus, searchTerm]);

  // Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      showToast('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/users', {
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim(),
        password: addForm.password.trim(),
        role: addForm.role,
        phoneNumber: addForm.phoneNumber.trim() || null,
        isActive: addForm.isActive
      });

      showToast(`Đã tạo tài khoản "${addForm.fullName}" thành công!`);
      setShowAddModal(false);
      setAddForm({
        fullName: '',
        email: '',
        password: '',
        role: 'Customer',
        phoneNumber: '',
        isActive: true
      });
      fetchUsersAndRoles();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể tạo người dùng.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      newPassword: '',
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await api.put(`/users/${selectedUser.id}`, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim() || null,
        role: editForm.role,
        isActive: editForm.isActive,
        newPassword: editForm.newPassword.trim() || null
      });

      showToast('Cập nhật tài khoản thành công!');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsersAndRoles();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật tài khoản.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, {
        isActive: !user.isActive
      });
      showToast(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.fullName}!`);
      fetchUsersAndRoles();
    } catch (err: any) {
      console.error(err);
      showToast('Lỗi khi thay đổi trạng thái tài khoản', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/users/${selectedUser.id}`);
      showToast(res.data?.message || 'Đã xử lý xóa tài khoản thành công!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsersAndRoles();
    } catch (err: any) {
      console.error(err);
      showToast('Lỗi khi xóa tài khoản', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-white font-semibold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-[#1F1F1F]" />
              Quản Lý Tài Khoản &amp; Người Dùng
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tạo mới tài khoản, phân quyền chức vụ (Kế toán, Kỹ thuật, Admin) và quản lý mật khẩu
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Tài Khoản Mới</span>
            </button>
            <button
              onClick={fetchUsersAndRoles}
              className="p-2.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Tài Khoản</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.total}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Toàn bộ người dùng &amp; nhân sự
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khách Hàng</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.customerCount}
            </p>
            <p className="text-[11px] text-blue-600 font-bold mt-1">
              Tài khoản khách thuê VPS/Hosting
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đội Ngũ Nhân Sự</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.staffCount}
            </p>
            <p className="text-[11px] text-purple-700 font-bold mt-1">
              Admin, Kế toán, Kỹ thuật, CSKH
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tài Khoản Bị Khóa</span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.lockedCount}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              Đang tạm ngưng hoạt động
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-md text-xs font-bold">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-3 py-1.5 rounded transition-colors ${filterRole === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tất cả ({users.length})
              </button>
              <button
                onClick={() => setFilterRole('Admin')}
                className={`px-3 py-1.5 rounded transition-colors ${filterRole === 'Admin' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Admin
              </button>
              <button
                onClick={() => setFilterRole('Accountant')}
                className={`px-3 py-1.5 rounded transition-colors ${filterRole === 'Accountant' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Kế toán
              </button>
              <button
                onClick={() => setFilterRole('Technician')}
                className={`px-3 py-1.5 rounded transition-colors ${filterRole === 'Technician' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Kỹ thuật
              </button>
              <button
                onClick={() => setFilterRole('Customer')}
                className={`px-3 py-1.5 rounded transition-colors ${filterRole === 'Customer' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Khách hàng
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-bold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded transition-colors ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Mọi trạng thái
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded transition-colors ${filterStatus === 'active' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Hoạt động
              </button>
              <button
                onClick={() => setFilterStatus('locked')}
                className={`px-3 py-1.5 rounded transition-colors ${filterStatus === 'locked' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Đã khóa
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#1F1F1F] outline-none"
            />
          </div>
        </div>

        {/* Users Master Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Họ &amp; Tên / Email</th>
                  <th className="p-4">Vai Trò Chức Danh</th>
                  <th className="p-4">Số Điện Thoại</th>
                  <th className="p-4">Ngày Đăng Ký</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700">Không tìm thấy tài khoản nào</p>
                      <p className="text-xs text-slate-400 mt-0.5">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleMeta = getRoleBadge(user.role);
                    const RoleIcon = roleMeta.icon;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {(user.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs sm:text-sm">{user.fullName}</p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleMeta.className}`}>
                            <RoleIcon className="w-3 h-3" />
                            {roleMeta.label}
                          </span>
                        </td>

                        <td className="p-4 text-slate-700 font-mono">
                          {user.phoneNumber ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {user.phoneNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cập nhật</span>
                          )}
                        </td>

                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="p-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <Lock className="w-3 h-3" /> Đã khóa
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAuditModal(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Xem Audit Logs của người dùng này"
                            >
                              <HistoryIcon className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Sửa thông tin / Đổi mật khẩu"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleLock(user)}
                              className={`p-1.5 rounded transition-colors ${
                                user.isActive 
                                  ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50' 
                                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Tạo Tài Khoản Mới */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#1F1F1F]" />
                  Tạo Tài Khoản Mới
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="VD: ketoan@cloudhost.vn"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu an toàn..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Vai trò chức danh</label>
                    <select
                      value={addForm.role}
                      onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none bg-white font-semibold"
                    >
                      <option value="Customer">Khách Hàng (Customer)</option>
                      <option value="Accountant">Kế Toán (Accountant)</option>
                      <option value="Technician">Kỹ Thuật Viên (Technician)</option>
                      <option value="Support">CSKH (Support)</option>
                      <option value="Editor">Biên Tập Viên (Editor)</option>
                      <option value="Admin">Quản Trị Viên (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={addForm.phoneNumber}
                      onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                      placeholder="0912345678"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded bg-[#1F1F1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Sửa Tài Khoản / Đổi Mật Khẩu */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#1F1F1F]" />
                  Chỉnh Sửa Tài Khoản
                </h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Vai trò</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none bg-white font-semibold"
                    >
                      <option value="Customer">Khách Hàng (Customer)</option>
                      <option value="Accountant">Kế Toán (Accountant)</option>
                      <option value="Technician">Kỹ Thuật Viên (Technician)</option>
                      <option value="Support">CSKH (Support)</option>
                      <option value="Editor">Biên Tập Viên (Editor)</option>
                      <option value="Admin">Quản Trị Viên (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      placeholder="0912345678"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Đổi mật khẩu mới (Reset Password)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Để trống nếu giữ nguyên</span>
                  </label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <label htmlFor="editIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Kích hoạt hoạt động (Active)
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded bg-[#1F1F1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Xác Nhận Xóa Tài Khoản */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2.5 text-rose-600 mb-3">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black text-slate-900">Xác Nhận Xóa Tài Khoản</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser.fullName}</strong> ({selectedUser.email})?
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold"
                >
                  {isSubmitting ? 'Đang xóa...' : 'Xóa Tài Khoản'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Xem Audit Logs Của Người Dùng Này */}
        {showAuditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-purple-600" />
                    Lịch Sử Audit Logs: {selectedUser.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Email: {selectedUser.email} • Vai trò: {selectedUser.role}</p>
                </div>
                <button onClick={() => setShowAuditModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2.5 py-2">
                {auditLogs.filter(l => l.userEmail?.toLowerCase() === selectedUser.email.toLowerCase()).length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <HistoryIcon className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                    <p className="text-xs font-bold text-slate-600">Chưa có hành động nào được ghi nhận từ người dùng này</p>
                  </div>
                ) : (
                  auditLogs.filter(l => l.userEmail?.toLowerCase() === selectedUser.email.toLowerCase()).map(log => (
                    <div key={log.id} className="p-3 rounded border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Thực thể: <strong>{log.entityName}</strong> ({log.entityId}) • IP: <span className="font-mono">{log.ipAddress}</span>
                      </p>
                      {log.details && (
                        <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[10px] overflow-x-auto mt-1 font-mono">
                          {log.details}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 rounded bg-slate-900 text-white text-xs font-bold hover:bg-black"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
