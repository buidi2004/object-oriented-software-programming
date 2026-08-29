'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Mail, Plus, Trash2, AlertCircle, Eye, EyeOff, 
  Search, RefreshCw, Send, CheckCircle2, X, Download, UserCheck, Sparkles 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export default function AdminNewslettersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [campaignData, setCampaignData] = useState({
    subject: '',
    previewText: '',
    content: ''
  });

  const [newEmail, setNewEmail] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialSubscribers: NewsletterSubscriber[] = [
    {
      id: 'sub-1',
      email: 'techlead@viettel.vn',
      subscribedAt: '2026-06-15T10:00:00Z',
      isActive: true
    },
    {
      id: 'sub-2',
      email: 'admin@devops.org.vn',
      subscribedAt: '2026-07-20T14:30:00Z',
      isActive: true
    },
    {
      id: 'sub-3',
      email: 'founder@fintechnext.vn',
      subscribedAt: '2026-08-01T09:15:00Z',
      isActive: true
    },
    {
      id: 'sub-4',
      email: 'customer.old@gmail.com',
      subscribedAt: '2025-12-10T16:00:00Z',
      isActive: false
    }
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      const isAllowed = ['Admin', 'Editor', 'Staff'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) { 
        router.push('/dashboard'); 
        return; 
      }
      fetchSubscribers();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchSubscribers = () => {
    const saved = localStorage.getItem('admin_newsletter_subscribers');
    if (saved) {
      try {
        setSubscribers(JSON.parse(saved));
      } catch {
        setSubscribers(initialSubscribers);
      }
    } else {
      setSubscribers(initialSubscribers);
    }
    setIsLoading(false);
  };

  const saveSubscribers = (items: NewsletterSubscriber[]) => {
    setSubscribers(items);
    localStorage.setItem('admin_newsletter_subscribers', JSON.stringify(items));
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
      return;
    }

    if (subscribers.some(s => s.email.toLowerCase() === newEmail.toLowerCase())) {
      showToast('Email này đã có trong danh sách đăng ký.', 'error');
      return;
    }

    const newItem: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      subscribedAt: new Date().toISOString(),
      isActive: true
    };

    const updated = [newItem, ...subscribers];
    saveSubscribers(updated);
    setNewEmail('');
    setShowAddModal(false);
    showToast(`Đã thêm email ${newItem.email} vào danh sách nhận tin!`);
  };

  const handleToggleStatus = (id: string) => {
    const updated = subscribers.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive;
        showToast(`Đã ${nextState ? 'kích hoạt' : 'hủy kích hoạt'} nhận tin cho ${s.email}`);
        return { ...s, isActive: nextState };
      }
      return s;
    });
    saveSubscribers(updated);
  };

  const handleDelete = (id: string, email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa subscriber ${email}?`)) return;
    const updated = subscribers.filter(s => s.id !== id);
    saveSubscribers(updated);
    showToast(`Đã xóa ${email} khỏi danh sách.`);
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignData.subject.trim() || !campaignData.content.trim()) {
      showToast('Vui lòng nhập tiêu đề và nội dung chiến dịch.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate blast send
      await new Promise(r => setTimeout(r, 1500));
      const activeCount = subscribers.filter(s => s.isActive).length;
      showToast(`Đã gửi thành công chiến dịch tới ${activeCount} email đang hoạt động!`);
      setShowSendModal(false);
      setCampaignData({ subject: '', previewText: '', content: '' });
    } catch {
      showToast('Lỗi khi gửi chiến dịch email', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Ngay_Dang_Ky,Trang_Thai\n"
      + subscribers.map(s => `"${s.email}","${s.subscribedAt}","${s.isActive ? 'Active' : 'Inactive'}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất danh sách email ra file CSV!');
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quản lý Newsletter & Email Marketing</h1>
              <p className="text-xs text-slate-500">{subscribers.length} người đăng ký nhận tin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded bg-white/10 text-slate-200 text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-1.5"
              title="Xuất CSV"
            >
              <Download className="w-3.5 h-3.5" /> Xuất CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded bg-white/10 text-slate-200 text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Email
            </button>
            <button 
              onClick={() => setShowSendModal(true)}
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Gửi Chiến Dịch Email
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-4 border border-white/10 mb-6 flex items-center justify-between shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo địa chỉ email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md border border-white/10 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#0F172A] border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold">Email người nhận</th>
                <th className="px-6 py-3.5 text-left font-bold">Ngày đăng ký</th>
                <th className="px-6 py-3.5 text-left font-bold">Trạng thái nhận tin</th>
                <th className="px-6 py-3.5 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#0F172A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-900/30 text-[#1F1F1F] flex items-center justify-center font-bold">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(sub.subscribedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      sub.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-white/10 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {sub.isActive ? 'Đang nhận tin' : 'Đã hủy đăng ký'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        className={`p-2 rounded transition-colors ${
                          sub.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={sub.isActive ? 'Tạm ngưng nhận tin' : 'Kích hoạt lại'}
                      >
                        {sub.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa email"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-bold text-slate-200">Không tìm thấy người đăng ký nào</p>
              <p className="text-xs text-slate-500 mt-1">Bấm "Thêm Email" để bổ sung danh sách</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Thêm Email Nhận Tin Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-500 hover:text-slate-500 rounded-sm hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  placeholder="subscriber@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                >
                  Thêm Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Campaign Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg p-6 sm:p-8 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Soạn Chiến Dịch Email Marketing</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gửi thông báo cập nhật, khuyến mãi tới {subscribers.filter(s => s.isActive).length} email
                </p>
              </div>
              <button onClick={() => setShowSendModal(false)} className="p-2 text-slate-500 hover:text-slate-500 rounded-sm hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Tiêu đề Email (Subject)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: [Khuyến Mãi] Giảm 50% Cloud VPS Siêu Tốc Tháng Này!"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Văn bản xem trước (Preview Text)</label>
                <input
                  type="text"
                  placeholder="Tóm tắt ngắn hiển thị trong hộp thư đến..."
                  value={campaignData.previewText}
                  onChange={(e) => setCampaignData({ ...campaignData, previewText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Nội dung Email (HTML / Văn bản)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Nhập nội dung email chiến dịch chi tiết..."
                  value={campaignData.content}
                  onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 py-3 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Đang gửi email...' : 'Gửi Chiến Dịch Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
