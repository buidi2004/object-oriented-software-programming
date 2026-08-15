'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { Header } from '@/src/components/Header';
import { LifeBuoy, ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function NewTicketPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    priority: '1', // 1 = Normal
    message: ''
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let ticketId: string;
      try {
        const ticketRes = await api.post('/support-tickets', {
          subject: formData.subject,
          description: formData.message,
          priority: parseInt(formData.priority)
        });
        ticketId = ticketRes.data?.id || ticketRes.data?.ticketId || ticketRes.data;
      } catch {
        const ticketRes = await api.post('/tickets', {
          subject: formData.subject,
          priority: parseInt(formData.priority)
        });
        ticketId = ticketRes.data.id;
      }

      // Add message
      try {
        await api.post(`/support-tickets/${ticketId}/messages`, {
          message: formData.message
        });
      } catch {
        await api.post(`/tickets/${ticketId}/messages`, {
          message: formData.message
        });
      }

      router.push(`/support/tickets/${ticketId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.title || 'Đã có lỗi xảy ra khi tạo Ticket.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/support/tickets" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tạo Yêu cầu hỗ trợ mới</h1>
                <p className="text-sm text-slate-500">Mô tả chi tiết vấn đề của bạn để kỹ thuật viên hỗ trợ tốt nhất.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Vd: Không thể truy cập vào VPS IP 103..."
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mức độ ưu tiên</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="0">Thấp (Low)</option>
                  <option value="1">Bình thường (Normal)</option>
                  <option value="2">Cao (High)</option>
                  <option value="3">Khẩn cấp (Urgent)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1.5">Vui lòng chỉ chọn Khẩn cấp khi dịch vụ bị gián đoạn hoàn toàn.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Chi tiết vấn đề *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Mô tả chi tiết các bước bạn đã thực hiện, thông báo lỗi nếu có..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
