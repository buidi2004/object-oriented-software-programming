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

  const [isCreating, setIsCreating] = useState(false);
  const [editingBucket, setEditingBucket] = useState<AdminBucketDto | null>(null);
  const [createForm, setCreateForm] = useState({
    bucketName: '',
    region: 'ap-southeast-1',
    capacityGb: 100
  });
  const [editForm, setEditForm] = useState({
    capacityGb: 100,
    region: 'ap-southeast-1'
  });

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

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.bucketName.trim()) return alert('Vui lòng nhập tên bucket');
    try {
      await api.post('/admin/storage/buckets', {
        bucketName: createForm.bucketName.trim().toLowerCase(),
        region: createForm.region,
        capacityGb: Number(createForm.capacityGb) || 100
      });
      setIsCreating(false);
      alert('Tạo bucket thành công!');
      fetchBuckets();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi tạo bucket');
    }
  };

  const handleUpdateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBucket) return;
    try {
      await api.put(`/admin/storage/buckets/${editingBucket.id}`, {
        capacityGb: Number(editForm.capacityGb),
        region: editForm.region
      });
      setEditingBucket(null);
      alert('Cập nhật cấu hình bucket thành công!');
      fetchBuckets();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật bucket');
    }
  };

  const handleDeleteBucket = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bucket ${name}?`)) return;
    try {
      await api.delete(`/admin/storage/buckets/${id}`);
      alert('Đã xóa bucket thành công!');
      fetchBuckets();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa bucket');
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
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Cloud className="w-6 h-6 text-[#1F1F1F]" />
                Quản lý MinIO S3 Storage Buckets (Admin)
              </h1>
              <p className="text-xs text-slate-500">{buckets.length} buckets trên hệ thống MinIO</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              + Tạo Bucket Mới
            </button>
            <button
              onClick={fetchBuckets}
              className="p-2 rounded border border-white/10 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-[#0F172A] text-slate-500 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-4 border border-white/10 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên bucket, email khách, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1E293B] bg-opacity-70 backdrop-blur-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Active">Active / Running</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-[#0F172A] text-white border-b border-white/10 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Tên Bucket</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Quyền Hạn</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBuckets.map((b) => (
                  <tr key={b.id} className="hover:bg-[#0F172A]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-white">{b.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {b.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{b.ownerEmail || 'customer@cloudhost.vn'}</td>
                    <td className="px-6 py-4 font-bold text-slate-200 uppercase">{b.region || 'us-east-1'}</td>
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
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingBucket(b);
                          setEditForm({
                            capacityGb: 100,
                            region: b.region
                          });
                        }}
                        className="px-2.5 py-1.5 rounded bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 font-bold transition-colors text-[11px]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteBucket(b.id, b.name)}
                        className="px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px]"
                      >
                        Xóa
                      </button>
                      <a
                        href={`http://localhost:9001/browser/${b.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 hover:bg-blue-900/30 text-slate-200 hover:text-[#1F1F1F] font-bold transition-colors text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        MinIO
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBuckets.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy S3 bucket nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tạo Bucket */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" />
              Tạo S3 Object Storage Bucket Mới
            </h3>
            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Bucket</label>
                <input
                  type="text"
                  required
                  placeholder="my-storage-bucket"
                  value={createForm.bucketName}
                  onChange={(e) => setCreateForm({ ...createForm, bucketName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Region</label>
                  <select
                    value={createForm.region}
                    onChange={(e) => setCreateForm({ ...createForm, region: e.target.value })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ap-southeast-1">Hà Nội (ap-southeast-1)</option>
                    <option value="ap-southeast-2">TP.HCM (ap-southeast-2)</option>
                    <option value="us-east-1">Global S3 (us-east-1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Dung lượng Quota (GB)</label>
                  <input
                    type="number"
                    min="10"
                    value={createForm.capacityGb}
                    onChange={(e) => setCreateForm({ ...createForm, capacityGb: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Tạo Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Cấu Hình Quota Bucket */}
      {editingBucket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Cấu Hình Quota Bucket: {editingBucket.name}</h3>
            <form onSubmit={handleUpdateBucket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Dung lượng Quota (GB)</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={editForm.capacityGb}
                  onChange={(e) => setEditForm({ ...editForm, capacityGb: Number(e.target.value) })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Vùng lưu trữ (Region)</label>
                <input
                  type="text"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBucket(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
