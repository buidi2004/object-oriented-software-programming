'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, Plus, Shield, RefreshCw, Copy, CheckCircle2, 
  AlertCircle, ArrowLeft, Key, Server, Cpu, HardDrive, AlertTriangle 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { ResourceActionMenu } from '@/src/components/shared/ResourceActionMenu';
import { SensitiveDataField } from '@/src/components/shared/SensitiveDataField';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface DatabaseItem {
  id: string;
  name: string;
  engine: string | number;
  version: string;
  host?: string;
  port?: number;
  adminUser?: string;
  username?: string;
  adminPassword?: string;
  status: string;
  storageGB?: number;
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
  const [engine, setEngine] = useState('1'); // 1=Postgres, 2=MySQL, 3=Redis
  const [adminUser, setAdminUser] = useState('postgres');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const idempotencyKey = `db-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const engineNum = parseInt(engine, 10);
      const version = engineNum === 1 ? '16' : engineNum === 2 ? '8.0' : '7.0';

      const res = await api.post('/managed-databases', {
        name,
        engine: engineNum,
        version,
        adminUser,
        adminPassword,
        idempotencyKey,
      });

      const newId = res.data?.databaseId || idempotencyKey;
      
      // Add optimistic entry in Provisioning state
      const newDb: DatabaseItem = {
        id: newId,
        name,
        engine: engineNum === 1 ? 'PostgreSQL' : engineNum === 2 ? 'MySQL' : 'Redis',
        version,
        adminUser,
        adminPassword,
        status: 'Provisioning',
        createdAt: new Date().toISOString(),
      };

      setDatabases((prev) => [newDb, ...prev]);
      setSuccess(`Yêu cầu khởi tạo cơ sở dữ liệu "${name}" đã được tiếp nhận! Hệ thống đang cấp phát container và cấu hình bảo mật...`);
      setIsCreateOpen(false);
      setName('');
      setAdminPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi khởi tạo cơ sở dữ liệu');
    } finally {
      setCreating(false);
    }
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
              Khởi tạo cụm cơ sở dữ liệu PostgreSQL, MySQL hoặc Redis trên container chuyên biệt, tự động cấu hình bảo mật và cấp phát port.
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

          {loading && databases.length === 0 ? (
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
                Khởi tạo PostgreSQL, MySQL hoặc Redis chỉ với 1 cú nhấp chuột trên hạ tầng container tốc độ cao.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                + Tạo Database Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {databases.map((db) => (
                <DatabaseRowItem key={db.id} db={db} onRefresh={fetchDatabases} />
              ))}
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
              Chọn engine và thiết lập thông tin đăng nhập ban đầu.
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
                  onChange={(e) => {
                    setEngine(e.target.value);
                    if (e.target.value === '1') setAdminUser('postgres');
                    else if (e.target.value === '2') setAdminUser('root');
                    else setAdminUser('default');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 bg-white font-bold"
                >
                  <option value="1">PostgreSQL 16 (Relational DB)</option>
                  <option value="2">MySQL 8.0 (InnoDB)</option>
                  <option value="3">Redis 7 (In-Memory Cache & Key-Value)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Database Instance</label>
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
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật Khẩu Database</label>
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu mạnh bảo vệ database"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
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

function DatabaseRowItem({ db, onRefresh }: { db: DatabaseItem; onRefresh: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds, slowWarningText } = useResourceProvisioningDetails(
    'ManagedDatabaseInstance',
    db.id,
    db.status
  );

  const engineName = typeof db.engine === 'number' 
    ? (db.engine === 1 ? 'PostgreSQL' : db.engine === 2 ? 'MySQL' : 'Redis')
    : db.engine;

  const port = db.port || (engineName?.toLowerCase().includes('post') ? 5432 : 3306);
  const host = db.host || 'localhost';
  const username = db.adminUser || db.username || 'postgres';

  const connectionUri = `${engineName?.toLowerCase()}://${username}:****@${host}:${port}/${db.name}`;

  return (
    <div className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{db.name}</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {engineName} {db.version || '16'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Host: {host}:{port}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
          {status === 'Running' || status === 'Active' ? (
            <button
              onClick={() => {
                navigator.clipboard.writeText(connectionUri);
                alert('Đã sao chép URI kết nối!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-bold text-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy URI
            </button>
          ) : null}
        </div>
      </div>

      {/* Sensitive Credentials (hidden by default) */}
      {(status === 'Running' || status === 'Active') && db.adminPassword && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">Mật khẩu Admin:</span>
          <SensitiveDataField value={db.adminPassword} label="Admin Pass" />
        </div>
      )}

      {/* Slow Warning Banner */}
      {isSlow && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{slowWarningText}</span>
        </div>
      )}

      {/* Failed State Alert */}
      {status === 'Failed' && (
        <ResourceFailureAlert
          resourceName={`Database ${db.name}`}
          onRetry={() => {
            onRefresh();
          }}
          supportHref="/dashboard/tickets"
        />
      )}
    </div>
  );
}
