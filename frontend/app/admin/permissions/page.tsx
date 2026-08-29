'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Shield, UserCheck, Key, CreditCard } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  roleId: string;
  roleName: string;
  permissions: string[];
}

export default function AdminPermissionsPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [permName, setPermName] = useState('');
  const [permDescription, setPermDescription] = useState('');
  const [permCategory, setPermCategory] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        fetchData(token);
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchData = async (token: string) => {
    try {
      // Fetch all permissions
      const permRes = await fetch('/api/permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (permRes.ok) {
        const data = await permRes.json();
        setPermissions(data);
      }

      // Fetch role permissions
      const rolesRes = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        // Get permissions for each role
        const rolePerms = await Promise.all(
          rolesData.map(async (role: any) => {
            const rolePermRes = await fetch(`/api/roles/${role.id}/permissions`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const perms = rolePermRes.ok ? await rolePermRes.json() : [];
            return { roleId: role.id, roleName: role.name, permissions: perms };
          })
        );
        setRoles(rolePerms);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPermission = async () => {
    // Disabled: Permissions are seeded statically on backend.
    setShowAddModal(false);
  };

  const handleDeletePermission = async (id: string) => {
    alert("Cannot delete permissions: they are statically seeded in the system.");
  };

  const handleAssignPermission = async (roleId: string, permId: string) => {
    const token = localStorage.getItem('accessToken') ?? '';
    try {
      await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ roleId, permissionIds: [permId] })
      });
      // Refresh data
      fetchData(token);
    } catch (error) {
      console.error('Failed to assign permission:', error);
    }
  };

  const resetForm = () => {
    setPermName('');
    setPermDescription('');
    setPermCategory('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return <UserCheck className="w-4 h-4" />;
      case 'billing': return <CreditCard className="w-4 h-4" />;
      case 'security': return <Key className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quản lý Phân quyền</h1>
              <p className="text-sm text-slate-500">{permissions.length} quyền • {roles.length} vai trò</p>
            </div>
          </div>
          {/* <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-sm bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm quyền
          </button> */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Permissions Table */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded border border-white/10 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Danh sách quyền</h2>
          </div>
          
          <table className="w-full">
            <thead className="bg-[#0F172A] border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên quyền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thể loại</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-[#0F172A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{getCategoryIcon(perm.category)}</span>
                      <span className="font-medium text-white">{perm.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{perm.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-500 capitalize">
                      {perm.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Delete hidden for statically seeded permissions */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {permissions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium text-slate-500">Chưa có quyền nào</p>
            </div>
          )}
        </div>

        {/* Role Assignments */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Phân quyền theo vai trò</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {roles.map((role) => (
              <div key={role.roleId} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">{role.roleName}</h3>
                  <span className="text-sm text-slate-500">{role.permissions.length} quyền</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {permissions.map((perm) => {
                    const isSelected = role.permissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        onClick={() => handleAssignPermission(role.roleId, perm.id)}
                        className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-900/50 text-[#1F1F1F] border border-blue-200'
                            : 'bg-white/10 text-slate-500 hover:bg-white/20 border border-white/10'
                        }`}
                      >
                        {perm.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white mb-4">Thêm quyền mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Tên quyền</label>
                <input 
                  type="text"
                  value={permName}
                  onChange={(e) => setPermName(e.target.value)}
                  placeholder="VD: CanManageUsers"
                  className="w-full px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Mô tả</label>
                <textarea
                  value={permDescription}
                  onChange={(e) => setPermDescription(e.target.value)}
                  placeholder="Mô tả quyền này..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Thể loại</label>
                <select 
                  value={permCategory}
                  onChange={(e) => setPermCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Chọn thể loại</option>
                  <option value="users">Người dùng</option>
                  <option value="billing">Thanh toán</option>
                  <option value="security">Bảo mật</option>
                  <option value="content">Nội dung</option>
                  <option value="reports">Báo cáo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-2 rounded-sm bg-white/10 text-slate-200 font-semibold hover:bg-white/20 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddPermission}
                className="flex-1 py-2 rounded-sm bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
