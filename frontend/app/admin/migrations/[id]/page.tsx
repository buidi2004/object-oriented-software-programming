'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Database, AlertCircle, Loader } from 'lucide-react';
import { api } from '@/src/lib/api';

interface MigrationDetail {
  id: string;
  userId: string;
  orderRequestId: string;
  fromProvider: string;
  note: string | null;
  status: string;
  createdAt: string;
}

export default function AdminMigrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const migrationId = params.id as string;
  const [migration, setMigration] = useState<MigrationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMigration();
  }, [migrationId]);

  const fetchMigration = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await api.get(`/migration-requests/${migrationId}`);
      setMigration(res.data);
    } catch {
      setError('Không tìm thấy yêu cầu migration.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: number) => {
    if (!migration) return;
    try {
      await api.patch(`/migration-requests/${migrationId}/status`, { id: migrationId, status });
      fetchMigration();
    } catch {
      alert('Không thể cập nhật trạng thái.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  if (error || !migration) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-slate-600">{error}</p>
        <Link href="/admin/migrations" className="mt-4 text-[#1F1F1F] font-semibold">Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin/migrations" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Chi tiết Migration</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-[#1F1F1F]" />
            <div>
              <h2 className="text-lg font-bold">{migration.fromProvider}</h2>
              <p className="text-sm text-slate-500">Order: {migration.orderRequestId}</p>
            </div>
          </div>
          <p className="text-sm"><span className="font-semibold">Trạng thái:</span> {migration.status}</p>
          <p className="text-sm"><span className="font-semibold">Ghi chú:</span> {migration.note || '—'}</p>
          <p className="text-sm text-slate-500">Tạo lúc: {new Date(migration.createdAt).toLocaleString('vi-VN')}</p>

          <div className="flex gap-2 pt-4 border-t border-slate-100">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Status {s}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
