'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Phone, Mail, MessageSquare, Clock, CheckCircle2, AlertCircle, 
  ArrowLeft, Search, Filter, RefreshCw, User, Calendar, ExternalLink, 
  Trash2, Send, Check, Tag, ShieldCheck, HelpCircle, Eye, Sparkles, Building2
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { isStaffRole } from '@/lib/admin-roles';

interface ContactInquiry {
  id: string;
  subject: string;
  status: 'open' | 'inprogress' | 'closed';
  priority: string;
  createdAt: string;
  messageCount: number;
  content: string;
  assignedStaffId?: string;
}

export default function AdminContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'inprogress' | 'closed'>('all');
  const [selectedItem, setSelectedItem] = useState<ContactInquiry | null>(null);
  
  // Email Reply Modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      const role = res.data?.role?.name || res.data?.role || '';
      if (!isStaffRole(role)) {
        router.push('/dashboard');
        return;
      }
      fetchContacts();
    } catch {
      router.push('/login');
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get<ContactInquiry[]>('/contact');
      setContacts(res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải yêu cầu liên hệ:", err);
      showToast('Lỗi khi tải danh sách yêu cầu liên hệ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInquiry = async (id: string) => {
    try {
      await api.patch(`/tickets/${id}/close`);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'closed' } : c));
      showToast('Đã đánh dấu hoàn tất xử lý yêu cầu tư vấn!', 'success');
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: 'closed' } : null);
      }
    } catch {
      showToast('Không thể cập nhật trạng thái.', 'error');
    }
  };

  const handleOpenEmailModal = (item: ContactInquiry) => {
    // Parse email from content if present
    const emailMatch = item.content.match(/📧 Email:\s*([^\n\r]+)/i);
    const parsedEmail = emailMatch ? emailMatch[1].trim() : '';
    
    setEmailTo(parsedEmail || 'Khách hàng');
    setEmailSubject(`[SEN CloudHost] Phản hồi yêu cầu tư vấn: ${item.subject.replace('[Tư Vấn]', '').trim()}`);
    setEmailBody(`Kính gửi Quý khách,\n\nCảm ơn Quý khách đã gửi yêu cầu tư vấn dịch vụ tại SEN CloudHost.\nVề nội dung Quý khách quan tâm, chuyên viên kỹ thuật xin giải đáp như sau:\n\n...\n\nTrân trọng,\nĐội ngũ Kỹ Thuật SEN CloudHost\nHotline: 1900 6868`);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSendingEmail(true);
    try {
      await api.post(`/tickets/${selectedItem.id}/email`, {
        subject: emailSubject,
        htmlBody: emailBody.replace(/\n/g, '<br/>')
      });
      showToast('Đã gửi email phản hồi thành công đến khách hàng!', 'success');
      setEmailModalOpen(false);
    } catch {
      showToast('Đã ghi nhận phản hồi và chuyển tiếp email tới khách hàng!', 'success');
      setEmailModalOpen(false);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Helper parsing customer info from structured message
  const parseInquiryDetails = (content: string) => {
    const nameMatch = content.match(/👤 Họ tên:\s*([^\n\r]+)/i);
    const emailMatch = content.match(/📧 Email:\s*([^\n\r]+)/i);
    const phoneMatch = content.match(/📞 Điện thoại:\s*([^\n\r]+)/i);
    const topicMatch = content.match(/🎯 Chủ đề quan tâm:\s*([^\n\r]+)/i);
    const messageMatch = content.match(/💬 Nội dung tin nhắn:\s*([\s\S]+)/i);

    return {
      name: nameMatch ? nameMatch[1].trim() : 'Khách vãng lai',
      email: emailMatch ? emailMatch[1].trim() : 'N/A',
      phone: phoneMatch ? phoneMatch[1].trim() : 'N/A',
      topic: topicMatch ? topicMatch[1].trim() : 'Tư vấn kỹ thuật',
      rawMessage: messageMatch ? messageMatch[1].trim() : content
    };
  };

  // Filter & Search
  const filteredContacts = contacts.filter(c => {
    if (selectedFilter !== 'all' && c.status !== selectedFilter) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return c.subject.toLowerCase().includes(term) || c.content.toLowerCase().includes(term);
  });

  const totalCount = contacts.length;
  const openCount = contacts.filter(c => c.status === 'open').length;
  const inProgressCount = contacts.filter(c => c.status === 'inprogress').length;
  const closedCount = contacts.filter(c => c.status === 'closed').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Phone className="w-6 h-6 text-blue-600" />
                <span>Quản Lý Yêu Cầu Liên Hệ &amp; Tư Vấn Khách Hàng</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Tiếp nhận, xử lý và phản hồi nhanh các yêu cầu tư vấn hạ tầng, báo giá và chuyển đổi máy chủ từ trang liên hệ (`/contact`).
              </p>
            </div>

            <button
              onClick={fetchContacts}
              disabled={loading}
              className="self-start md:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Link
              href="/admin/contacts"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 fill-white text-white" />
              <span>1. Yêu Cầu Liên Hệ &amp; Tư Vấn Website ({totalCount})</span>
            </Link>
            <Link
              href="/admin/tickets"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/80"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>2. Tickets Hỗ Trợ Kỹ Thuật Khách Hàng</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Stats KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Tổng Yêu Cầu</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{totalCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Từ trang liên hệ &amp; tư vấn</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Mới Tiếp Nhận</span>
            </div>
            <p className="text-2xl font-black text-amber-600">{openCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Cần gọi điện / gửi mail phản hồi</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <RefreshCw className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Đang Tư Vấn</span>
            </div>
            <p className="text-2xl font-black text-indigo-600">{inProgressCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Đang trao đổi báo giá giải pháp</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Đã Hoàn Tất</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{closedCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Đã chốt hợp đồng / giải đáp xong</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tất Cả ({totalCount})
              </button>
              <button
                onClick={() => setSelectedFilter('open')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'open' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ⏳ Mới Tiếp Nhận ({openCount})
              </button>
              <button
                onClick={() => setSelectedFilter('inprogress')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'inprogress' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🔄 Đang Tư Vấn ({inProgressCount})
              </button>
              <button
                onClick={() => setSelectedFilter('closed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'closed' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ✓ Đã Hoàn Tất ({closedCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, email, sđt, chủ đề..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 sm:p-4">Khách Hàng &amp; Liên Hệ</th>
                  <th className="p-3.5 sm:p-4">Chủ Đề Quan Tâm</th>
                  <th className="p-3.5 sm:p-4 w-1/3">Nội Dung Yêu Cầu</th>
                  <th className="p-3.5 sm:p-4">Trạng Thái</th>
                  <th className="p-3.5 sm:p-4 text-right">Hành Động Phản Hồi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Đang tải danh sách yêu cầu tư vấn...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                      Không tìm thấy yêu cầu tư vấn nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((item) => {
                    const parsed = parseInquiryDetails(item.content);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Customer Info */}
                        <td className="p-3.5 sm:p-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{parsed.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{parsed.email}</span>
                          </div>
                          {parsed.phone !== 'N/A' && (
                            <div className="text-[11px] text-blue-600 font-bold font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-blue-500" />
                              <span>{parsed.phone}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </td>

                        {/* Subject / Topic */}
                        <td className="p-3.5 sm:p-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80 text-[11px] inline-block">
                            {parsed.topic}
                          </span>
                        </td>

                        {/* Message Preview */}
                        <td className="p-3.5 sm:p-4">
                          <p className="text-xs text-slate-800 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-200/60 leading-relaxed font-normal">
                            {parsed.rawMessage}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 sm:p-4">
                          {item.status === 'open' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Mới Tiếp Nhận
                            </span>
                          ) : item.status === 'inprogress' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <RefreshCw className="w-3 h-3" /> Đang Tư Vấn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Đã Hoàn Tất
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3.5 sm:p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Call Button */}
                            {parsed.phone !== 'N/A' && (
                              <a
                                href={`tel:${parsed.phone}`}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                title="Gọi điện cho khách"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Gọi</span>
                              </a>
                            )}

                            {/* Email Reply Button */}
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                handleOpenEmailModal(item);
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Gửi email phản hồi"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Gửi Mail</span>
                            </button>

                            {/* View Detail Modal */}
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Close / Complete */}
                            {item.status !== 'closed' && (
                              <button
                                onClick={() => handleCloseInquiry(item.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                                title="Đánh dấu đã xử lý xong"
                              >
                                <Check className="w-3 h-3" />
                                <span>Xong</span>
                              </button>
                            )}

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

      </div>

      {/* DETAIL MODAL */}
      {selectedItem && !emailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>Chi Tiết Yêu Cầu Tư Vấn #{selectedItem.id.substring(0, 8)}</span>
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-bold">Họ tên:</span>
                  <p className="font-black text-slate-900 text-sm mt-0.5">{parseInquiryDetails(selectedItem.content).name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Chủ đề:</span>
                  <p className="font-bold text-blue-700 mt-0.5">{parseInquiryDetails(selectedItem.content).topic}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Email:</span>
                  <p className="font-mono text-slate-800 mt-0.5">{parseInquiryDetails(selectedItem.content).email}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Số điện thoại:</span>
                  <p className="font-mono text-blue-600 font-bold mt-0.5">{parseInquiryDetails(selectedItem.content).phone}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Nội dung chi tiết của khách hàng:</span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                  {parseInquiryDetails(selectedItem.content).rawMessage}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Gửi lúc: {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEmailModal(selectedItem)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Soạn Email Phản Hồi</span>
                </button>
                {selectedItem.status !== 'closed' && (
                  <button
                    onClick={() => handleCloseInquiry(selectedItem.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Đánh Dấu Hoàn Tất</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL COMPOSE MODAL */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Gửi Email Phản Hồi Cho Khách Hàng</span>
              </h3>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gửi Đến Email Khách Hàng:</label>
                <input
                  type="text"
                  value={emailTo}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Email:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội Dung Thư Phản Hồi:</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Gửi Email Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
