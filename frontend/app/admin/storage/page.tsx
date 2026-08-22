'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Cloud, AlertCircle, RefreshCw, HardDrive, ExternalLink } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { SensitiveDataField } from '@/src/components/shared/SensitiveDataField';

interface AdminBucketDto {
  id: string;
  name: string;
  region: string;
  ownerEmail?: string;
  sizeBytes?: number;
  objectCount?: number;
  isPublic?: boolean;
  status: string;
  failureReason?: string;
  createdAt: string;
}

export default function AdminStoragePage() {
  const [buckets, setBuckets] = useState<AdminBucketDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBuckets = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/storage/buckets').catch(() => api.get('/storage/buckets'));
      setBuckets(res.data || []);
    } catch (error) {
      console.warn('Failed to fetch storage buckets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const filteredBuckets = buckets.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ownerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                <Cloud className="w-6 h-6 text-[#1F1F1F]" />
                Quản lý MinIO S3 Storage Buckets (Admin)
              </h1>
              <p className="text-xs text-slate-600">{buckets.length} buckets trên hệ thống MinIO</p>
            </div>
          </div>
          <button
            onClick={fetchBuckets}
            className="p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white rounded-md p-4 border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm theo tên bucket, email khách, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Active">Active / Running</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Tên Bucket</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Quyền Hạn</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuckets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] font-mono text-slate-600 mt-0.5">ID: {b.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{b.ownerEmail || 'customer@cloudhost.vn'}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 uppercase">{b.region || 'us-east-1'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        b.isPublic ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {b.isPublic ? 'Public Read' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminStorageStatusCell bucket={b} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`http://localhost:9001/browser/${b.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1F1F1F] font-bold transition-colors text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        MinIO Console
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBuckets.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-medium">Không tìm thấy S3 bucket nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminStorageStatusCell({ bucket }: { bucket: AdminBucketDto }) {
  const { status, isProvisioning, isSlow, elapsedSeconds } = useResourceProvisioningDetails(
    'ObjectStorageBucket',
    bucket.id,
    bucket.status
  );

  return (
    <div className="space-y-1">
      <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
      {bucket.failureReason && (
        <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded-sm max-w-[220px] truncate" title={bucket.failureReason}>
          {bucket.failureReason}
        </div>
      )}
    </div>
  );
}
