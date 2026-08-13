'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, Plus, Edit2, Lock, Unlock, 
  Shield, Trash2, Eye, UserCheck, UserX, AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
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
  const [showLockModal, setShowLockModal] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin' && userData.role !== 'Editor') {
          router.push('/dashboard');
          return;
        }
        fetchUsers(token);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockUser = async (userId: string, isLock: boolean) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/users/${userId}/lock`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: isLock ? 'locked' : 'active' } : u
        ));
        setShowLockModal(null);
      }
    } catch (error) {
      console.error('Failed to lock/unlock user:', error);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ roleName: newRole }),
      });
      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole as User['role'] } : u
        ));
      }
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Người dùng</h1>
              <p className="text-sm text-slate-500">{users.length} users tổng cộng</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm user
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Customer">Customer</option>
              <option value="Staff">Staff</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Vai trò</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngày tạo</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Đăng nhập cuối</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {user.fullName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Staff">Staff</option>
                        <option value="Editor">Editor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleString('vi-VN')
                        : 'Chưa đăng nhập'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setShowLockModal(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active' 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/users/${user.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Không tìm thấy user nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Lock/Unlock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Xác nhận thao tác
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc chắn muốn khóa/mở khóa tài khoản này?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleLockUser(showLockModal, true)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowLockModal(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
