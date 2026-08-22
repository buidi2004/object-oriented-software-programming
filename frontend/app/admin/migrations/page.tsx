'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { Database, Clock, ArrowRightLeft, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface MigrationApp {
  id: string;
  userId: string;
  orderRequestId: string;
  fromProvider: string;
  note: string | null;
  status: 0 | 1 | 2 | 3;
  createdAt: string;
}

const statusMap = {
  0: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  1: { label: 'Processing', icon: <ArrowRightLeft className="w-4 h-4" />, color: 'bg-blue-50 text-[#1F1F1F] border-blue-200' },
  2: { label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-50 text-green-700 border-green-200' },
  3: { label: 'Failed', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AdminMigrationsPage() {
  const [migrations, setMigrations] = useState<MigrationApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      const res = await api.get<MigrationApp[]>('/migration-requests');
      setMigrations(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách migrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: number) => {
    setUpdating(id);
    try {
      await api.patch(`/migration-requests/${id}/status`, {
        id,
        status: newStatus
      });
      // Update local state
      setMigrations(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
    } catch (err: any) {
      alert(`Lỗi: ${err.response?.data?.message || 'Không thể cập nhật trạng thái.'}`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-[#1F1F1F]" />
            Yêu cầu Migration (Chuyển dữ liệu)
          </h1>
          <p className="text-gray-500 mt-2">Quản lý và tiếp nhận các yêu cầu chuyển đổi dữ liệu từ Khách hàng.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-sm">
            <tr>
              <th className="px-6 py-4">Khách hàng / Order ID</th>
              <th className="px-6 py-4">Nguồn (Provider)</th>
              <th className="px-6 py-4 w-1/3">Ghi chú</th>
              <th className="px-6 py-4">Trạng thái & Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : migrations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Chưa có yêu cầu Migration nào.
                </td>
              </tr>
            ) : (
              migrations.map((mig) => {
                const statusInfo = statusMap[mig.status as keyof typeof statusMap] || statusMap[0];
                return (
                  <tr key={mig.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">User: {mig.userId.substring(0, 8)}...</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">Order: {mig.orderRequestId.substring(0, 8)}...</div>
                      <div className="text-xs text-gray-600 mt-1">{new Date(mig.createdAt).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {mig.fromProvider}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px] whitespace-pre-wrap font-mono">
                        {mig.note || <span className="italic text-gray-600">Không có ghi chú</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        
                        <select
                          disabled={updating === mig.id}
                          value={mig.status}
                          onChange={(e) => handleUpdateStatus(mig.id, Number(e.target.value))}
                          className="mt-2 text-sm border border-gray-300 rounded-md py-1.5 pl-2 pr-8 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        >
                          <option value={0}>Pending</option>
                          <option value={1}>Processing</option>
                          <option value={2}>Completed</option>
                          <option value={3}>Failed</option>
                        </select>
                        <Link href={`/admin/migrations/${mig.id}`} className="inline-flex items-center gap-1 text-sm text-[#1F1F1F] hover:text-[#1F1F1F] font-medium mt-1">
                          <Eye className="w-4 h-4" /> Chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
