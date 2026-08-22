'use client';

import { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import { ArrowRightLeft, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface MigrationApp {
  id: string;
  orderRequestId: string;
  fromProvider: string;
  note: string | null;
  status: 0 | 1 | 2 | 3; // Pending, Processing, Completed, Failed
  createdAt: string;
}

const statusMap = {
  0: { label: 'Đang chờ xử lý', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700' },
  1: { label: 'Đang chuyển đổi', icon: <ArrowRightLeft className="w-4 h-4" />, color: 'bg-blue-50 text-[#1F1F1F]' },
  2: { label: 'Hoàn tất', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-50 text-green-700' },
  3: { label: 'Thất bại', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-50 text-red-700' },
};

export default function MigrationsPage() {
  const [migrations, setMigrations] = useState<MigrationApp[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [orderId, setOrderId] = useState('');
  const [provider, setProvider] = useState('AWS');
  const [note, setNote] = useState('');
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      const res = await api.get<MigrationApp[]>('/migration-requests/me');
      setMigrations(res.data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử migration:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    if (!orderId.trim()) return;

    try {
      await api.post('/migration-requests', {
        orderId: orderId.trim(),
        fromProvider: provider,
        note: note.trim()
      });
      setSubmitStatus({ type: 'success', message: 'Yêu cầu chuyển đổi đã được gửi thành công!' });
      setOrderId('');
      setNote('');
      fetchMigrations();
    } catch (err: any) {
      setSubmitStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại Order ID.' 
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-[#1F1F1F]" />
          Yêu cầu Chuyển đổi (Migration)
        </h1>
        <p className="text-gray-500 mt-2">Yêu cầu chuyển website, mã nguồn hoặc cơ sở dữ liệu từ nhà cung cấp khác về hệ thống của chúng tôi hoàn toàn miễn phí.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Yêu cầu mới */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Gửi Yêu cầu mới</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Đơn hàng (Order ID) *</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Ví dụ: 123e4567-e89b-..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">ID của VPS hoặc Hosting bạn vừa đăng ký.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp cũ</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="AWS">Amazon Web Services (AWS)</option>
                  <option value="Google Cloud">Google Cloud (GCP)</option>
                  <option value="Azure">Microsoft Azure</option>
                  <option value="DigitalOcean">DigitalOcean</option>
                  <option value="Vultr">Vultr</option>
                  <option value="Linode">Linode / Akamai</option>
                  <option value="Hostinger">Hostinger</option>
                  <option value="Khác">Khác...</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú & Thông tin đăng nhập</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Cung cấp IP, username, password để kỹ thuật viên truy cập máy chủ cũ..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              {submitStatus && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                  submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {submitStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Gửi Yêu Cầu
              </button>
            </form>
          </div>
        </div>

        {/* Lịch sử */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Lịch sử Yêu cầu</h2>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100 text-gray-500 font-medium text-sm">
                  <tr>
                    <th className="px-6 py-4">Mã Đơn hàng</th>
                    <th className="px-6 py-4">Từ dịch vụ</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Ngày gửi</th>
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
                        Bạn chưa gửi yêu cầu chuyển đổi dữ liệu nào.
                      </td>
                    </tr>
                  ) : (
                    migrations.map((mig) => {
                      const statusInfo = statusMap[mig.status as keyof typeof statusMap] || statusMap[0];
                      return (
                        <tr key={mig.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-gray-600 block truncate w-32" title={mig.orderRequestId}>
                              {mig.orderRequestId}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {mig.fromProvider}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-500">
                            {new Date(mig.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
