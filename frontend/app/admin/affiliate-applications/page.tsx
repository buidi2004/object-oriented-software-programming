'use client';

import { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AffiliateApp {
  id: string;
  userId: string;
  companyName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  commissionRate: number;
}

export default function AdminAffiliateApplicationsPage() {
  const [apps, setApps] = useState<AffiliateApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get<AffiliateApp[]>('/affiliate-applications');
      setApps(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách ứng tuyển:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Bạn có chắc muốn ${action === 'approve' ? 'Duyệt' : 'Từ chối'} đơn này?`)) return;

    try {
      await api.patch(`/affiliate-applications/${id}/${action}`);
      fetchApps(); // refresh
    } catch (err: any) {
      alert(`Lỗi: ${err.response?.data?.message || 'Không thể thực hiện hành động.'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3" /> Đã duyệt
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <XCircle className="w-3 h-3" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" /> Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Xét duyệt Đối tác (Affiliates)
          </h1>
          <p className="text-gray-500 mt-2">Quản lý và xét duyệt các yêu cầu đăng ký tham gia chương trình Affiliate.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-sm">
            <tr>
              <th className="px-6 py-4">Tên Công ty / Tổ chức</th>
              <th className="px-6 py-4">Mức Hoa Hồng Yêu Cầu</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác (Approve/Reject)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : apps.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Chưa có đơn đăng ký nào.
                </td>
              </tr>
            ) : (
              apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {app.companyName}
                    <div className="text-xs text-gray-600 font-normal mt-1">User ID: {app.userId.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-indigo-600">{app.commissionRate}%</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(app.id, 'approve')}
                          className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium text-sm transition-colors"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'reject')}
                          className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
