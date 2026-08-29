'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Database, AlertCircle, RefreshCw, ShieldAlert, Key, Terminal } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { SensitiveDataField } from '@/src/components/shared/SensitiveDataField';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface AdminDatabaseDto {
  id: string;
  userId: string;
  ownerEmail?: string;
  name: string;
  engine: string | number;
  version: string;
  port: number;
  adminUser?: string;
  adminPassword?: string;
  status: string;
  failureReason?: string;
  createdAt: string;
}

export default function AdminDatabasesPage() {
  const router = useRouter();
  const [databases, setDatabases] = useState<AdminDatabaseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isCreating, setIsCreating] = useState(false);
  const [editingDb, setEditingDb] = useState<AdminDatabaseDto | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    engine: 1, // 1 for PostgreSQL, 0 for MySQL
    version: '16',
    adminUser: 'dbadmin',
    adminPassword: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    adminUser: '',
    adminPassword: ''
  });

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/databases');
      setDatabases(res.data || []);
    } catch (error) {
      console.warn('Failed to fetch databases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return alert('Vui lòng nhập tên database');
    try {
      await api.post('/admin/databases', {
        name: createForm.name.trim(),
        engine: Number(createForm.engine),
        version: createForm.version,
        adminUser: createForm.adminUser,
        adminPassword: createForm.adminPassword || 'Pass123!@#'
      });
      setIsCreating(false);
      alert('Tạo database thành công!');
      fetchDatabases();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi tạo database');
    }
  };

  const handleUpdateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDb) return;
    try {
      await api.put(`/admin/databases/${editingDb.id}`, {
        name: editForm.name,
        adminUser: editForm.adminUser,
        adminPassword: editForm.adminPassword
      });
      setEditingDb(null);
      alert('Cập nhật database thành công!');
      fetchDatabases();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật database');
    }
  };

  const handleDeleteDatabase = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa database ${name}?`)) return;
    try {
      await api.delete(`/admin/databases/${id}`);
      alert('Đã xóa database thành công!');
      fetchDatabases();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa database');
    }
  };

  const handleForceRetry = async (dbId: string) => {
    try {
      await api.post(`/admin/databases/${dbId}/retry`);
      alert('Đã gửi yêu cầu Force Retry cấp phát database.');
      fetchDatabases();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Đã gửi tín hiệu retry!');
      fetchDatabases();
    }
  };

  const handleMarkFailed = async (dbId: string) => {
    try {
      await api.post(`/admin/databases/${dbId}/mark-failed`, {
        reason: 'Quản trị viên đánh dấu Failed thủ công.',
      });
      alert('Đã cập nhật trạng thái Failed.');
      fetchDatabases();
    } catch (err: any) {
      fetchDatabases();
    }
  };

  const filteredDatabases = databases.filter((db) => {
    const matchesSearch =
      db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (db.ownerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || db.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const runningCount = databases.filter((i) => i.status === 'Running' || i.status === 'Active').length;
  const failedCount = databases.filter((i) => i.status === 'Failed').length;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-teal-600" />
                Quản lý Managed Databases (Admin)
              </h1>
              <p className="text-xs text-slate-500">{databases.length} instances trên hệ thống</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              + Tạo Database Mới
            </button>
            <button
              onClick={fetchDatabases}
              className="p-2 rounded border border-white/10 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-[#0F172A] text-slate-500 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="px-3 py-1.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">
              {runningCount} Running
            </span>
            <span className="px-3 py-1.5 rounded bg-rose-100 text-rose-700 text-xs font-bold">
              {failedCount} Failed
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-4 border border-white/10 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên, email khách, Instance ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#1E293B] bg-opacity-70 backdrop-blur-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running / Active</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-[#0F172A] text-white border-b border-white/10 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Database Info</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Engine &amp; Port</th>
                  <th className="px-6 py-4">Thông Tin Admin</th>
                  <th className="px-6 py-4">Trạng Thái &amp; Log</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredDatabases.map((db) => (
                  <tr key={db.id} className="hover:bg-[#0F172A]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{db.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {db.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{db.ownerEmail || 'customer@cloudhost.vn'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-100">{db.engine} {db.version}</span>
                      <div className="font-mono text-[11px] text-teal-600 mt-0.5">Port: {db.port || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-mono text-[11px] text-slate-500">User: {db.adminUser || 'postgres'}</div>
                        {db.adminPassword && (
                          <SensitiveDataField
                            value={db.adminPassword}
                            label="Pass"
                            onViewAudit={() => {
                              console.log(`[AUDIT] Admin viewed credentials for DB ${db.id}`);
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminDatabaseStatusCell db={db} onRetry={() => handleForceRetry(db.id)} onMarkFailed={() => handleMarkFailed(db.id)} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingDb(db);
                          setEditForm({
                            name: db.name,
                            adminUser: db.adminUser || 'dbadmin',
                            adminPassword: db.adminPassword || ''
                          });
                        }}
                        className="px-2.5 py-1.5 rounded bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 font-bold transition-colors text-[11px]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleForceRetry(db.id)}
                        className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-teal-50 text-slate-200 hover:text-teal-700 font-bold transition-colors text-[11px]"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => handleDeleteDatabase(db.id, db.name)}
                        className="px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px]"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDatabases.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy database nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tạo Database */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              Tạo Managed Database Mới
            </h3>
            <form onSubmit={handleCreateDatabase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Database</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. prod-db-customer"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Engine</label>
                  <select
                    value={createForm.engine}
                    onChange={(e) => setCreateForm({ ...createForm, engine: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value={1}>PostgreSQL</option>
                    <option value={0}>MySQL</option>
                    <option value={2}>MongoDB</option>
                    <option value={3}>Redis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Phiên bản</label>
                  <input
                    type="text"
                    value={createForm.version}
                    onChange={(e) => setCreateForm({ ...createForm, version: e.target.value })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">User Quản Trị</label>
                <input
                  type="text"
                  value={createForm.adminUser}
                  onChange={(e) => setCreateForm({ ...createForm, adminUser: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Mật khẩu Quản Trị</label>
                <input
                  type="password"
                  placeholder="Pass123!@#"
                  value={createForm.adminPassword}
                  onChange={(e) => setCreateForm({ ...createForm, adminPassword: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded"
                >
                  Khởi Tạo Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Database */}
      {editingDb && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Sửa Cấu Hình Database</h3>
            <form onSubmit={handleUpdateDatabase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Database</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">User Quản Trị</label>
                <input
                  type="text"
                  value={editForm.adminUser}
                  onChange={(e) => setEditForm({ ...editForm, adminUser: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Mật khẩu Mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới..."
                  value={editForm.adminPassword}
                  onChange={(e) => setEditForm({ ...editForm, adminPassword: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDb(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDatabaseStatusCell({ db, onRetry, onMarkFailed }: { db: AdminDatabaseDto; onRetry: () => void; onMarkFailed: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds } = useResourceProvisioningDetails(
    'ManagedDatabaseInstance',
    db.id,
    db.status
  );

  return (
    <div className="space-y-1.5">
      <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
      {db.failureReason && (
        <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded-sm max-w-[220px] truncate" title={db.failureReason}>
          {db.failureReason}
        </div>
      )}
    </div>
  );
}
