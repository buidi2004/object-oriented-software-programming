'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cloud, Plus, HardDrive, RefreshCw, Key, ExternalLink, 
  Trash2, Lock, CheckCircle2, AlertCircle, ArrowLeft, Upload 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

interface BucketItem {
  id: string;
  name: string;
  region: string;
  sizeBytes: number;
  objectCount: number;
  isPublic: boolean;
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
  const [region, setRegion] = useState('vn-hn-1');
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
      await api.post('/storage/buckets', {
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        region,
        isPublic,
      });
      setSuccess(`Đã tạo thành công S3 Bucket "${name}"!`);
      setIsCreateOpen(false);
      setName('');
      fetchBuckets();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo Bucket');
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
              <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-600">
                <Cloud className="w-7 h-7" />
              </div>
              Quản Lý Cloud Object Storage (S3)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tạo và quản lý các thùng chứa dữ liệu S3 Buckets, phân quyền truy cập và upload tệp tin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBuckets}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
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

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              Đang tải danh sách Bucket...
            </div>
          ) : buckets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Bucket</th>
                    <th className="px-6 py-4">Region</th>
                    <th className="px-6 py-4">Số Lượng Tệp</th>
                    <th className="px-6 py-4">Quyền Truy Cập</th>
                    <th className="px-6 py-4 text-right">S3 Endpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buckets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2 font-mono">
                        <HardDrive className="w-4 h-4 text-blue-500" />
                        {b.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 uppercase font-semibold">
                        {b.region || 'vn-hn-1'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {b.objectCount || 0} objects
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          b.isPublic ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {b.isPublic ? 'Public Read' : 'Private (Auth Only)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono text-[11px]">
                        https://s3.cloudhost.vn/{b.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Bucket */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" /> Tạo S3 Bucket Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tên bucket phải là duy nhất, chỉ chứa chữ thường, số và dấu gạch ngang.
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
                  <option value="vn-hn-1">Hà Nội DC (vn-hn-1)</option>
                  <option value="vn-hcm-1">TP. Hồ Chí Minh DC (vn-hcm-1)</option>
                  <option value="sg-sin-1">Singapore DC (sg-sin-1)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
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
