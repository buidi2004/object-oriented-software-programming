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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-teal-600" />
                Quản lý Managed Databases (Admin)
              </h1>
              <p className="text-xs text-slate-600">{databases.length} instances trên hệ thống</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDatabases}
              className="p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
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
        <div className="bg-white rounded-md p-4 border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm theo tên, email khách, Instance ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running / Active</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Database Info</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Engine &amp; Port</th>
                  <th className="px-6 py-4">Thông Tin Admin</th>
                  <th className="px-6 py-4">Trạng Thái &amp; Log</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDatabases.map((db) => (
                  <tr key={db.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{db.name}</div>
                      <div className="text-[10px] font-mono text-slate-600 mt-0.5">ID: {db.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{db.ownerEmail || 'customer@cloudhost.vn'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{db.engine} {db.version}</span>
                      <div className="font-mono text-[11px] text-teal-600 mt-0.5">Port: {db.port || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-mono text-[11px] text-slate-600">User: {db.adminUser || 'postgres'}</div>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleForceRetry(db.id)}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-bold transition-colors text-[11px]"
                      >
                        Force Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDatabases.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-medium">Không tìm thấy database nào</p>
            </div>
          )}
        </div>
      </main>
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
