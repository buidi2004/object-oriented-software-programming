'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Check, Save, ShieldCheck, Shield, Users, 
  Wallet, Server, Wrench, FileText, Lock, Unlock, RefreshCw, AlertCircle, 
  CheckCircle2, Info, CheckSquare, Square, Tag, Headphones, User as UserIcon,
  Trash2, Edit2, Eye, History, Mail, Phone, Clock, Key, X, Copy
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
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

interface PermissionGroup {
  name: string;
  icon: any;
  color: string;
  permCodes: string[];
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'audit'>('permissions');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modals
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    isActive: true
  });

  const [showUserAuditModal, setShowUserAuditModal] = useState(false);
  const [selectedAuditUser, setSelectedAuditUser] = useState<User | null>(null);

  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Human-readable Role Descriptions & Badges
  const getRoleMetadata = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'admin') {
      return {
        title: 'Quản Trị Viên (Admin)',
        desc: 'Toàn quyền tối cao quản trị và cấu hình toàn bộ hệ thống CloudHost',
        icon: ShieldCheck,
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        preset: 'FULL'
      };
    }
    if (n === 'accountant' || n.includes('kế toán') || n.includes('ketoan')) {
      return {
        title: 'Kế Toán Viên (Accountant)',
        desc: 'Quản lý hóa đơn VAT, ví tiền, doanh thu, đối soát nạp/rút tiền & hoàn tiền',
        icon: Wallet,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        preset: 'ACCOUNTANT'
      };
    }
    if (n === 'technician' || n.includes('kỹ thuật') || n.includes('kythuat') || n.includes('devops')) {
      return {
        title: 'Kỹ Thuật Viên (Technician)',
        desc: 'Quản lý vận hành máy chủ Cloud VPS, hạ tầng mạng, backup và xử lý tickets kỹ thuật',
        icon: Wrench,
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        preset: 'TECHNICIAN'
      };
    }
    if (n === 'editor' || n.includes('biên tập') || n.includes('bientap') || n.includes('content')) {
      return {
        title: 'Biên Tập Viên (Editor)',
        desc: 'Quản lý bài viết tin tức, hướng dẫn kỹ thuật, voucher khuyến mãi và banner',
        icon: FileText,
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        preset: 'EDITOR'
      };
    }
    if (n === 'support' || n.includes('chăm sóc') || n.includes('cskh')) {
      return {
        title: 'Chăm Sóc Khách Hàng (Support)',
        desc: 'Hỗ trợ khách hàng qua Tickets, LiveChat và kiểm tra trạng thái đơn hàng',
        icon: Headphones,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        preset: 'SUPPORT'
      };
    }
    return {
      title: name,
      desc: 'Nhóm quyền người dùng tùy chỉnh trong hệ thống',
      icon: Users,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      preset: 'CUSTOM'
    };
  };

  // Grouped Permissions
  const permissionGroups: PermissionGroup[] = [
    {
      name: 'Tài Chính & Kế Toán',
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      permCodes: ['manage_billing', 'manage_wallet', 'manage_orders']
    },
    {
      name: 'Kỹ Thuật & Vận Hành Máy Chủ',
      icon: Server,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      permCodes: ['manage_vps', 'manage_services', 'manage_tickets']
    },
    {
      name: 'Bảo Mật & Quản Trị Hệ Thống',
      icon: Shield,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      permCodes: ['manage_users', 'manage_roles', 'manage_security']
    },
    {
      name: 'Nội Dung & Khuyến Mãi',
      icon: Tag,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      permCodes: ['manage_content', 'manage_promotions']
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes, usersRes, logsRes] = await Promise.all([
        api.get('/roles').catch(() => ({ data: [] })),
        api.get('/permissions').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/audit-logs').catch(() => ({ data: [] }))
      ]);

      const rolesList: Role[] = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      const permsList: Permission[] = Array.isArray(permsRes.data) ? permsRes.data : [];
      const usersList: User[] = Array.isArray(usersRes.data) ? usersRes.data.map((u: any) => ({
        id: u.id,
        fullName: u.fullName || 'Chưa đặt tên',
        email: u.email,
        phoneNumber: u.phoneNumber || '',
        role: u.role || 'Customer',
        isActive: u.isActive ?? true,
        createdAt: u.createdAt || new Date().toISOString()
      })) : [];

      setRoles(rolesList);
      setPermissions(permsList);
      setUsers(usersList);
      setAuditLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

      if (rolesList.length > 0) {
        const defaultRole = selectedRole 
          ? (rolesList.find(r => r.id === selectedRole.id) || rolesList[0])
          : (rolesList.find(r => r.name.toLowerCase() === 'admin') || rolesList[0]);
        handleSelectRole(defaultRole);
      }
    } catch (error) {
      console.error('Failed to load roles data:', error);
      showToast('Lỗi khi tải dữ liệu phân quyền', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role);
    try {
      const res = await api.get(`/roles/${role.id}/permissions`).catch(() => ({ data: [] }));
      if (Array.isArray(res.data)) {
        setRolePermissions(res.data.map((p: any) => p.id));
      }
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      showToast('Không thể tải quyền của vai trò này', 'error');
    }
  };

  // Users belonging to selected role
  const roleUsers = useMemo(() => {
    if (!selectedRole) return [];
    return users.filter(u => u.role?.toLowerCase() === selectedRole.name.toLowerCase());
  }, [users, selectedRole]);

  // Audit logs associated with selected role members
  const roleAuditLogs = useMemo(() => {
    if (!selectedRole) return [];
    const roleUserEmails = new Set(roleUsers.map(u => u.email.toLowerCase()));
    return auditLogs.filter(log => {
      if (log.userEmail && roleUserEmails.has(log.userEmail.toLowerCase())) return true;
      if (selectedRole.name.toLowerCase() === 'admin') return true;
      return false;
    });
  }, [auditLogs, roleUsers, selectedRole]);

  // Permissions handlers
  const handleTogglePermission = (permissionId: string) => {
    setRolePermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleGroup = (groupPermCodes: string[]) => {
    const groupPermIds = permissions
      .filter(p => groupPermCodes.includes(p.code))
      .map(p => p.id);

    const allSelected = groupPermIds.every(id => rolePermissions.includes(id));
    if (allSelected) {
      setRolePermissions(prev => prev.filter(id => !groupPermIds.includes(id)));
    } else {
      setRolePermissions(prev => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  const handleSelectAll = () => {
    setRolePermissions(permissions.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setRolePermissions([]);
  };

  const handleApplyPreset = (presetType: string) => {
    let targetCodes: string[] = [];
    if (presetType === 'ACCOUNTANT') {
      targetCodes = ['manage_billing', 'manage_wallet', 'manage_orders'];
    } else if (presetType === 'TECHNICIAN') {
      targetCodes = ['manage_vps', 'manage_tickets', 'manage_services', 'manage_security'];
    } else if (presetType === 'EDITOR') {
      targetCodes = ['manage_content', 'manage_promotions'];
    } else if (presetType === 'SUPPORT') {
      targetCodes = ['manage_tickets', 'manage_orders'];
    } else if (presetType === 'FULL') {
      targetCodes = permissions.map(p => p.code);
    }

    const matchedIds = permissions
      .filter(p => targetCodes.includes(p.code))
      .map(p => p.id);

    setRolePermissions(matchedIds);
    showToast(`Đã áp dụng mẫu phân quyền phù hợp!`);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      await api.put(`/roles/${selectedRole.id}/permissions`, {
        roleId: selectedRole.id,
        permissionIds: rolePermissions
      });
      showToast(`Đã lưu thiết lập phân quyền cho nhóm "${selectedRole.name}" thành công!`);
    } catch (error) {
      console.error('Failed to save permissions:', error);
      showToast('Lỗi khi lưu phân quyền', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Create User directly in this Role
  const handleCreateUserInRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!addUserForm.fullName.trim() || !addUserForm.email.trim() || !addUserForm.password.trim()) {
      showToast('Vui lòng nhập họ tên, email và mật khẩu.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/users', {
        fullName: addUserForm.fullName.trim(),
        email: addUserForm.email.trim(),
        password: addUserForm.password.trim(),
        role: selectedRole.name,
        phoneNumber: addUserForm.phoneNumber.trim() || null,
        isActive: addUserForm.isActive
      });

      showToast(`Đã tạo tài khoản "${addUserForm.fullName}" với vai trò ${selectedRole.name}!`);
      setShowAddUserModal(false);
      setAddUserForm({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        isActive: true
      });
      fetchData();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể tạo tài khoản.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user lock/unlock
  const handleToggleUserLock = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, {
        isActive: !user.isActive
      });
      showToast(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.fullName}!`);
      fetchData();
    } catch (err) {
      showToast('Lỗi khi thay đổi trạng thái tài khoản', 'error');
    }
  };

  // Delete user from role
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsSubmitting(true);
      const res = await api.delete(`/users/${userToDelete.id}`);
      showToast(res.data?.message || 'Đã xóa tài khoản thành công!');
      setShowDeleteUserModal(false);
      setUserToDelete(null);
      fetchData();
    } catch (err) {
      showToast('Lỗi khi xóa tài khoản', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await api.post('/roles', { name: newRoleName.trim() });
      showToast(`Đã tạo nhóm quyền "${newRoleName.trim()}" thành công!`);
      setNewRoleName('');
      setShowAddRoleModal(false);
      fetchData();
    } catch (error) {
      showToast('Không thể tạo vai trò mới', 'error');
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
              <ShieldCheck className="w-7 h-7 text-[#1F1F1F]" />
              Quản Lý Phân Quyền &amp; Quyền Hạn
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kiểm soát vai trò Kế toán, Kỹ thuật viên, Quản trị viên, tạo tài khoản nhân sự và tra cứu Audit Logs
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="px-4 py-2.5 rounded bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhóm Quyền Mới</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Master Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Roles List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    Danh Sách Vai Trò ({roles.length})
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Chọn vai trò để quản lý nhân sự và quyền hạn</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {roles.map((role) => {
                  const meta = getRoleMetadata(role.name);
                  const RoleIcon = meta.icon;
                  const isSelected = selectedRole?.id === role.id;
                  const memberCount = users.filter(u => u.role?.toLowerCase() === role.name.toLowerCase()).length;

                  return (
                    <div
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]' 
                          : 'bg-slate-50/70 hover:bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-white/15 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}>
                        <RoleIcon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {meta.title}
                          </h3>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : meta.badgeClass
                          }`}>
                            {memberCount} nhân sự
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {meta.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Box */}
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-lg p-4 text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <Info className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Gợi ý vai trò phòng ban:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-blue-800 list-disc list-inside">
                <li><strong>Kế toán:</strong> Quản lý hóa đơn, nạp ví, đối soát.</li>
                <li><strong>Kỹ thuật:</strong> Vận hành Cloud VPS, xử lý ticket.</li>
                <li><strong>Biên tập:</strong> Viết bài hướng dẫn, khuyến mãi.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Multi-tab Role Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedRole ? (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
                
                {/* Active Role Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vai trò:</span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-black bg-slate-900 text-white">
                        {selectedRole.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {roleUsers.length} tài khoản thành viên • {rolePermissions.length}/{permissions.length} quyền API được cấp
                    </p>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('permissions')}
                      className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                        activeTab === 'permissions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Ma Trận Quyền</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                        activeTab === 'users' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Nhân Sự ({roleUsers.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                        activeTab === 'audit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit Logs ({roleAuditLogs.length})</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: PERMISSIONS MATRIX */}
                {activeTab === 'permissions' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                      {/* Presets */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-slate-500" /> Mẫu nhanh:
                        </span>
                        <button
                          onClick={() => handleApplyPreset('ACCOUNTANT')}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-emerald-50 text-emerald-700 border border-slate-200 text-[11px] font-bold transition-colors shadow-2xs"
                        >
                          + Kế Toán
                        </button>
                        <button
                          onClick={() => handleApplyPreset('TECHNICIAN')}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 text-[11px] font-bold transition-colors shadow-2xs"
                        >
                          + Kỹ Thuật
                        </button>
                        <button
                          onClick={() => handleApplyPreset('EDITOR')}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-purple-50 text-purple-700 border border-slate-200 text-[11px] font-bold transition-colors shadow-2xs"
                        >
                          + Biên Tập
                        </button>
                        <button
                          onClick={() => handleApplyPreset('FULL')}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 text-[11px] font-bold transition-colors shadow-2xs"
                        >
                          + Toàn Quyền
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSelectAll}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Chọn hết
                        </button>
                        <button
                          onClick={handleDeselectAll}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Bỏ hết
                        </button>
                        <button
                          onClick={handleSavePermissions}
                          disabled={isSaving}
                          className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Đang lưu...' : 'Lưu Quyền'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Grouped Permissions */}
                    <div className="space-y-4">
                      {permissionGroups.map((group) => {
                        const GroupIcon = group.icon;
                        const groupPerms = permissions.filter(p => group.permCodes.includes(p.code));
                        if (groupPerms.length === 0) return null;

                        const allSelectedInGroup = groupPerms.every(p => rolePermissions.includes(p.id));

                        return (
                          <div key={group.name} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${group.color}`}>
                                  <GroupIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-xs text-slate-800">{group.name}</span>
                              </div>

                              <button
                                onClick={() => handleToggleGroup(group.permCodes)}
                                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                              >
                                {allSelectedInGroup ? (
                                  <>
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Bỏ chọn nhóm</span>
                                  </>
                                ) : (
                                  <>
                                    <Square className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Chọn nhóm</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                              {groupPerms.map((perm) => {
                                const isChecked = rolePermissions.includes(perm.id);

                                return (
                                  <label
                                    key={perm.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleTogglePermission(perm.id);
                                    }}
                                    className={`p-3 rounded-md border flex items-start gap-3 cursor-pointer transition-all ${
                                      isChecked 
                                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' 
                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                      isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                                    }`}>
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>

                                    <div>
                                      <span className={`text-xs font-bold block ${isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>
                                        {perm.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                        {perm.code}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: ASSIGNED USERS */}
                {activeTab === 'users' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Thành viên thuộc vai trò {selectedRole.name}
                        </h3>
                        <p className="text-xs text-slate-400">Các tài khoản được cấp quyền hạn của vai trò này</p>
                      </div>

                      <button
                        onClick={() => setShowAddUserModal(true)}
                        className="px-3.5 py-2 rounded bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo Tài Khoản Cho Vai Trò Này</span>
                      </button>
                    </div>

                    {roleUsers.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg p-6 bg-slate-50">
                        <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-700">Chưa có nhân sự nào trong vai trò này</p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">Bấm nút bên dưới để tạo tài khoản nhân sự mới</p>
                        <button
                          onClick={() => setShowAddUserModal(true)}
                          className="px-4 py-2 bg-[#1F1F1F] text-white text-xs font-bold rounded shadow-2xs"
                        >
                          + Tạo tài khoản {selectedRole.name}
                        </button>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-3.5">Họ Tên / Email</th>
                              <th className="p-3.5">Số Điện Thoại</th>
                              <th className="p-3.5">Trạng Thái</th>
                              <th className="p-3.5">Ngày Tạo</th>
                              <th className="p-3.5 text-right">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {roleUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      {(u.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{u.fullName}</p>
                                      <p className="text-[11px] text-slate-400">{u.email}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3.5 text-slate-700 font-mono">
                                  {u.phoneNumber || <span className="text-slate-400 italic">Chưa có</span>}
                                </td>

                                <td className="p-3.5">
                                  {u.isActive ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <CheckCircle2 className="w-3 h-3" /> Hoạt động
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                      <Lock className="w-3 h-3" /> Đã khóa
                                    </span>
                                  )}
                                </td>

                                <td className="p-3.5 text-slate-500 whitespace-nowrap">
                                  {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                </td>

                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => {
                                        setSelectedAuditUser(u);
                                        setShowUserAuditModal(true);
                                      }}
                                      className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                      title="Xem Audit Logs của nhân sự này"
                                    >
                                      <History className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => handleToggleUserLock(u)}
                                      className={`p-1.5 rounded transition-colors ${
                                        u.isActive ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                                      }`}
                                      title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    >
                                      {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setUserToDelete(u);
                                        setShowDeleteUserModal(true);
                                      }}
                                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="Xóa tài khoản"
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
                    )}
                  </div>
                )}

                {/* TAB 3: ROLE AUDIT LOGS */}
                {activeTab === 'audit' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Nhật Ký Thao Tác Của Vai Trò {selectedRole.name}
                        </h3>
                        <p className="text-xs text-slate-400">Ghi lại toàn bộ hành động của các thành viên trong nhóm này</p>
                      </div>

                      <Link
                        href="/admin/audit-logs"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Mở toàn bộ Audit Logs →</span>
                      </Link>
                    </div>

                    {roleAuditLogs.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg p-6 bg-slate-50">
                        <History className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-700">Chưa có bản ghi nhật ký nào từ vai trò này</p>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-3.5">Người Thực Hiện</th>
                              <th className="p-3.5">Hành Động</th>
                              <th className="p-3.5">Thực Thể &amp; ID</th>
                              <th className="p-3.5">Địa Chỉ IP</th>
                              <th className="p-3.5">Thời Gian</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {roleAuditLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-3.5">
                                  <p className="font-bold text-slate-900">{log.userEmail || 'Hệ thống'}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{log.userId || 'system'}</p>
                                </td>

                                <td className="p-3.5">
                                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                                    {log.action}
                                  </span>
                                </td>

                                <td className="p-3.5">
                                  <span className="font-semibold text-slate-900">{log.entityName}</span>
                                  <span className="block text-[10px] text-slate-400 font-mono">{log.entityId}</span>
                                </td>

                                <td className="p-3.5 font-mono text-[11px] text-slate-600">
                                  {log.ipAddress}
                                </td>

                                <td className="p-3.5 text-slate-500 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="font-bold text-slate-700 text-sm">Vui lòng chọn một vai trò bên trái</p>
              </div>
            )}
          </div>

        </div>

        {/* MODAL 1: TẠO VAI TRÒ MỚI */}
        {showAddRoleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1F1F1F]" />
                Tạo Nhóm Quyền Mới
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Nhập tên vai trò chức danh cho nhân viên hoặc bộ phận
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tên vai trò (Role Name):</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="VD: Accountant, Technician, CSKH..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                    autoFocus
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-600">
                  <span className="font-bold block mb-1 text-slate-800">Gợi ý chức danh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Accountant', 'Technician', 'Support', 'Editor', 'Marketing', 'Auditor'].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNewRoleName(name)}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 font-mono text-[10px]"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim()}
                  className="px-4 py-2 rounded bg-[#1F1F1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold"
                >
                  Tạo Vai Trò
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: TẠO TÀI KHOẢN CHO VAI TRÒ NÀY */}
        {showAddUserModal && selectedRole && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#1F1F1F]" />
                    Tạo Tài Khoản {selectedRole.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tài khoản sẽ được tự động gán vai trò {selectedRole.name}</p>
                </div>
                <button onClick={() => setShowAddUserModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUserInRole} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên nhân sự *</label>
                  <input
                    type="text"
                    required
                    value={addUserForm.fullName}
                    onChange={(e) => setAddUserForm({ ...addUserForm, fullName: e.target.value })}
                    placeholder="VD: Trần Văn Kế Toán"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    placeholder={`VD: ${selectedRole.name.toLowerCase()}@cloudhost.vn`}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    required
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu an toàn..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={addUserForm.phoneNumber}
                    onChange={(e) => setAddUserForm({ ...addUserForm, phoneNumber: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-[#1F1F1F] outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded bg-[#1F1F1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold"
                  >
                    {isSubmitting ? 'Đang tạo...' : `Tạo Tài Khoản ${selectedRole.name}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: XÓA TÀI KHOẢN NHÂN SỰ */}
        {showDeleteUserModal && userToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2.5 text-rose-600 mb-3">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black text-slate-900">Xác Nhận Xóa Tài Khoản</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete.fullName}</strong> ({userToDelete.email}) khỏi vai trò {selectedRole?.name}?
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteUserModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold"
                >
                  {isSubmitting ? 'Đang xóa...' : 'Xóa Tài Khoản'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: XEM AUDIT LOGS RIÊNG CỦA MỘT NHÂN SỰ */}
        {showUserAuditModal && selectedAuditUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-600" />
                    Lịch Sử Audit Logs: {selectedAuditUser.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Email: {selectedAuditUser.email} • Vai trò: {selectedAuditUser.role}</p>
                </div>
                <button onClick={() => setShowUserAuditModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2.5 py-2">
                {auditLogs.filter(l => l.userEmail?.toLowerCase() === selectedAuditUser.email.toLowerCase()).length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                    <p className="text-xs font-bold text-slate-600">Chưa có hành động nào được ghi nhận từ nhân sự này</p>
                  </div>
                ) : (
                  auditLogs.filter(l => l.userEmail?.toLowerCase() === selectedAuditUser.email.toLowerCase()).map(log => (
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
                  onClick={() => setShowUserAuditModal(false)}
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
