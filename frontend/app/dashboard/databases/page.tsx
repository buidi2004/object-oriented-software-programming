'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, Plus, Shield, RefreshCw, Copy, CheckCircle2, 
  AlertCircle, ArrowLeft, Key, Server, Cpu, HardDrive 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioning } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { ResourceActionMenu } from '@/src/components/shared/ResourceActionMenu';

interface DatabaseItem {
  id: string;
  name: string;
  engine: string;
  version: string;
  host: string;
  port: number;
  username: string;
  status: string;
  storageGB: number;
  createdAt: string;
}

export default function DashboardDatabasesPage() {
  const { user } = useAuthStore();
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [engine, setEngine] = useState('mysql');
  const [username, setUsername] = useState('dbadmin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/databases');
      setDatabases(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load databases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      await api.post('/databases', {
        name,
        engine,
        username,
        password,
      });
      setSuccess(`Đã tạo thành công cơ sở dữ liệu ${name}!`);
      setIsCreateOpen(false);
      setName('');
      setPassword('');
      fetchDatabases();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo database');
    } finally {
      setCreating(false);
    }
  };

  const copyConnectionString = (db: DatabaseItem) => {
    const conn = `${db.engine}://${db.username}:****@${db.host || 'db.cloudhost.vn'}:${db.port || 3306}/${db.name}`;
    navigator.clipboard.writeText(conn);
    setCopiedId(db.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-600">
                <Database className="w-7 h-7" />
              </div>
              Quản Lý Managed Databases
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý cụm cơ sở dữ liệu MySQL, PostgreSQL, Redis tự động sao lưu &amp; phân tán.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDatabases}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Database Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Database List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Database Instances</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {databases.length} instances
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              Đang tải danh sách database...
            </div>
          ) : databases.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-500 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có Database Instance Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Khởi tạo MySQL, PostgreSQL hoặc Redis chỉ với 1 cú nhấp chuột.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                + Tạo Database Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Database</th>
                    <th className="px-6 py-4">Engine</th>
                    <th className="px-6 py-4">Host &amp; Port</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {databases.map((db) => (
                    <tr key={db.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Database className="w-4 h-4 text-teal-500" />
                        {db.name}
                        <DatabaseRealtimeBadge db={db} />
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 uppercase">
                        {db.engine} {db.version || '8.0'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                        {db.host || 'db.cloudhost.vn'}:{db.port || (db.engine === 'postgres' ? 5432 : 3306)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          Đang chạy
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyConnectionString(db)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-600 font-bold transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedId === db.id ? 'Đã sao chép!' : 'Copy URI'}
                        </button>
                        <DatabaseActionMenu db={db} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create DB */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" /> Khởi Tạo Managed Database Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Chọn engine và thiết lập thông tin đăng nhập database.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại Database Engine</label>
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 bg-white font-bold"
                >
                  <option value="mysql">MySQL 8.0 (InnoDB)</option>
                  <option value="postgres">PostgreSQL 16 (Relational)</option>
                  <option value="redis">Redis 7 (In-Memory Cache)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Database</label>
                <input
                  type="text"
                  required
                  placeholder="app_production / ecommerce_db"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tài Khoản Admin</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật Khẩu Database</label>
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu mạnh bảo vệ database"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Khởi Tạo Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DatabaseRealtimeBadge({ db }: { db: DatabaseItem }) {
  const status = useResourceProvisioning('DatabaseInstance', db.id, db.status);
  
  // Chỉ hiển thị badge realtime nếu nó khác trạng thái 'Running' bình thường
  // hoặc luôn hiển thị để thấy nó đang real-time
  if (status === 'Running' || status === 'Active') return null;

  return <ProvisioningStatusBadge status={status} />;
}

function DatabaseActionMenu({ db }: { db: DatabaseItem }) {
  const status = useResourceProvisioning('DatabaseInstance', db.id, db.status);

  const handleSuspend = async () => {
    try {
      // Gọi api thật (ví dụ)
      await api.put(`/databases/${db.id}/suspend`);
      alert('Đã gửi yêu cầu Suspend');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi Suspend');
    }
  };

  const handleResume = async () => {
    try {
      await api.put(`/databases/${db.id}/resume`);
      alert('Đã gửi yêu cầu Resume');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi Resume');
    }
  };

  const handleTerminate = async () => {
    try {
      await api.delete(`/databases/${db.id}`);
      alert('Đã xóa Database');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa');
    }
  };

  return (
    <ResourceActionMenu 
      status={status} 
      onSuspend={handleSuspend}
      onResume={handleResume}
      onTerminate={handleTerminate}
    />
  );
}
