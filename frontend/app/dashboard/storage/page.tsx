'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cloud, Plus, HardDrive, RefreshCw, Key, ExternalLink, 
  Trash2, Lock, CheckCircle2, AlertCircle, ArrowLeft, Upload, AlertTriangle 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { SensitiveDataField } from '@/src/components/shared/SensitiveDataField';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface BucketItem {
  id: string;
  name: string;
  region: string;
  sizeBytes?: number;
  objectCount?: number;
  isPublic?: boolean;
  accessKey?: string;
  secretKey?: string;
  status: string;
  createdAt: string;
}

export default function DashboardStoragePage() {
  const { user } = useAuthStore();
  const [buckets, setBuckets] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/storage/buckets');
      setBuckets(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load storage buckets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const res = await api.post('/object-storage/buckets', {
        name: sanitizedName,
        region,
      });

      const newId = res.data?.bucketId || `bucket-${Date.now()}`;
      const newBucket: BucketItem = {
        id: newId,
        name: sanitizedName,
        region,
        isPublic,
        status: 'Provisioning',
        createdAt: new Date().toISOString(),
      };

      setBuckets((prev) => [newBucket, ...prev]);
      setSuccess(`Yêu cầu tạo S3 Bucket "${sanitizedName}" đã được gửi tới cụm MinIO. Hệ thống đang cấp phát phân vùng và thiết lập quyền truy cập...`);
      setIsCreateOpen(false);
      setName('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo S3 Bucket');
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
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-100 text-[#1F1F1F]">
                <Cloud className="w-7 h-7" />
              </div>
              Quản Lý Cloud Object Storage (S3)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lưu trữ không giới hạn hình ảnh, video, dữ liệu ứng dụng với chuẩn tương thích AWS S3 REST API trên MinIO Cluster.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBuckets}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-[#1F1F1F] hover:border-blue-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo S3 Bucket Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Buckets List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách S3 Buckets</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {buckets.length} buckets
            </span>
          </div>

          {loading && buckets.length === 0 ? (
            <div className="p-12 text-center text-slate-600 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#1F1F1F]" />
              Đang tải danh sách Bucket...
            </div>
          ) : buckets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1F1F1F] flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có S3 Bucket Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Tạo Bucket lưu trữ hình ảnh, video, tài liệu hoặc dữ liệu sao lưu ngay hôm nay.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md"
              >
                + Tạo Bucket Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {buckets.map((b) => (
                <BucketRowItem key={b.id} bucket={b} onRefresh={fetchBuckets} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Bucket */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#1F1F1F]" /> Tạo S3 Bucket Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tên bucket phải từ 3-63 ký tự, chỉ gồm chữ thường, số và dấu gạch ngang.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Bucket S3</label>
                <input
                  type="text"
                  required
                  placeholder="my-app-media / backups-2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vùng Dữ Liệu (Region)</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="us-east-1">Global Standard (us-east-1)</option>
                  <option value="ap-southeast-1">Vietnam / Singapore (ap-southeast-1)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded text-[#1F1F1F] focus:ring-blue-500"
                />
                <label htmlFor="public" className="text-xs font-semibold text-slate-700">
                  Cho phép Public Read (thích hợp làm CDN/Ảnh website công khai)
                </label>
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Tạo Thùng Chứa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BucketRowItem({ bucket, onRefresh }: { bucket: BucketItem; onRefresh: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds, slowWarningText } = useResourceProvisioningDetails(
    'ObjectStorageBucket',
    bucket.id,
    bucket.status
  );

  const endpointUrl = `http://localhost:9000/${bucket.name}`;

  return (
    <div className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1F1F1F] flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-slate-900 text-sm">{bucket.name}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {bucket.region || 'us-east-1'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              S3 URI: s3://{bucket.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
          {status === 'Running' || status === 'Active' ? (
            <button
              onClick={() => {
                navigator.clipboard.writeText(endpointUrl);
                alert('Đã sao chép S3 Endpoint!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1F1F1F] font-bold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Copy S3 URL
            </button>
          ) : null}
        </div>
      </div>

      {/* S3 Credentials */}
      {(status === 'Running' || status === 'Active') && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Access Key:</span>
            <SensitiveDataField value={bucket.accessKey || 'minioadmin'} label="Key" />
          </div>
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
          resourceName={`S3 Bucket ${bucket.name}`}
          onRetry={() => {
            onRefresh();
          }}
          supportHref="/dashboard/tickets"
        />
      )}
    </div>
  );
}
