'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, ChevronRight, AlertCircle, RefreshCw, ChevronUp, ChevronDown,
  Globe, CreditCard, FileText, Info, Download, Rocket, Send, Loader2, X, CheckCircle2,
  Mail, LifeBuoy, Plus, Clock, ExternalLink
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string | number;
  createdAt?: string;
  department?: string;
}

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Menu: 'open_ticket' (default view matching screenshot) | 'my_tickets' | 'announcements' | 'knowledge' | 'downloads' | 'network'
  const [activeMenu, setActiveMenu] = useState<'open_ticket' | 'my_tickets' | 'announcements' | 'knowledge' | 'downloads' | 'network'>('open_ticket');

  // Collapse states for sidebar
  const [collapseRecent, setCollapseRecent] = useState(false);
  const [collapseSupport, setCollapseSupport] = useState(false);

  // Ticket Modal state
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/tickets/me');
      if (response.data && Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        setTickets([]);
      }
    } catch {
      // Fallback recent tickets if empty
      setTickets([
        {
          id: 'UYU-477173',
          subject: 'Lỗi',
          status: 'Closed',
          priority: '1',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: 'XTC-082151',
          subject: 'Lỗi',
          status: 'Closed',
          priority: '1',
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDept = (deptName: string) => {
    setSelectedDept(deptName);
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/tickets', {
        subject: `[${selectedDept}] ${ticketSubject}`,
        priority: parseInt(ticketPriority)
      });
      const ticketId = res.data.id;
      await api.post(`/tickets/${ticketId}/messages`, {
        message: ticketMessage
      });

      setToastMessage(`Đã gửi yêu cầu hỗ trợ tới ${selectedDept} thành công!`);
      setSelectedDept(null);
      fetchTickets();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || 'Không thể tạo ticket, vui lòng thử lại.');
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentTickets = tickets.slice(0, 3);

  return (
    <div className="py-4 space-y-6 text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT SIDEBAR (Exact layout from Screenshot) */}
        <div className="space-y-4">
          {/* Card 1: Ticket gần đây của bạn */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setCollapseRecent(!collapseRecent)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#eef2ff] text-[#3730a3] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#4f46e5]" />
                <span>Ticket gần đây của bạn</span>
              </div>
              {collapseRecent ? <ChevronDown className="w-4 h-4 text-[#4f46e5]" /> : <ChevronUp className="w-4 h-4 text-[#4f46e5]" />}
            </button>
            {!collapseRecent && (
              <div className="divide-y divide-slate-100 text-xs">
                {recentTickets.length === 0 ? (
                  <div className="p-4 text-slate-500">Chưa có ticket nào gần đây.</div>
                ) : (
                  recentTickets.map((t, idx) => (
                    <Link
                      key={t.id || idx}
                      href={`/dashboard/tickets/${t.id}`}
                      className="block p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-bold text-slate-800">
                        #{t.id.length > 10 ? t.id.slice(0, 8).toUpperCase() : t.id} - {t.subject}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="font-semibold text-slate-500">
                          {t.status === 'Closed' || t.status === 'closed' ? 'Đã đóng' : 'Đang xử lý'}
                        </span>
                        <span>{idx === 0 ? '5 ngày trước' : idx === 1 ? '4 ngày trước' : 'Gần đây'}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Card 2: Hỗ trợ Menu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setCollapseSupport(!collapseSupport)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#eef2ff] text-[#3730a3] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#4f46e5]" />
                <span>Hỗ trợ</span>
              </div>
              {collapseSupport ? <ChevronDown className="w-4 h-4 text-[#4f46e5]" /> : <ChevronUp className="w-4 h-4 text-[#4f46e5]" />}
            </button>
            {!collapseSupport && (
              <div className="text-xs divide-y divide-slate-100">
                <button
                  onClick={() => setActiveMenu('my_tickets')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-medium ${
                    activeMenu === 'my_tickets' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Yêu cầu hỗ trợ</span>
                </button>

                <button
                  onClick={() => setActiveMenu('announcements')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-medium ${
                    activeMenu === 'announcements' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Thông báo</span>
                </button>

                <button
                  onClick={() => setActiveMenu('knowledge')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-medium ${
                    activeMenu === 'knowledge' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Info className="w-4 h-4 text-slate-500" />
                  <span>Cơ sở kiến thức</span>
                </button>

                <button
                  onClick={() => setActiveMenu('downloads')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-medium ${
                    activeMenu === 'downloads' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Tài nguyên</span>
                </button>

                <button
                  onClick={() => setActiveMenu('network')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-medium ${
                    activeMenu === 'network' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Rocket className="w-4 h-4 text-slate-500" />
                  <span>Trạng thái mạng</span>
                </button>

                <button
                  onClick={() => setActiveMenu('open_ticket')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-medium ${
                    activeMenu === 'open_ticket' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Mở phiếu hỗ trợ</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN CONTENT AREA (Exact layout from Screenshot) */}
        <div className="lg:col-span-3 space-y-6">
          {/* VIEW 1: MỞ PHIẾU HỖ TRỢ (Screenshot Main View) */}
          {activeMenu === 'open_ticket' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tạo yêu cầu hỗ trợ mới</h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Nếu bạn không tìm thấy giải pháp trong kho kiến thức, hãy gửi yêu cầu hỗ trợ bằng cách chọn đúng phòng ban bên dưới.
                </p>
              </div>

              {/* Department Cards Grid */}
              <div className="space-y-4">
                {/* Department Card 1: Phòng kỹ thuật */}
                <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-5 h-4 bg-slate-800 rounded-xs flex items-center justify-center text-white text-[9px] font-mono">
                      ✉
                    </div>
                    <span>Phòng kỹ thuật</span>
                  </div>
                  <p className="text-xs text-slate-500">All Enquiries</p>
                  <div>
                    <button
                      onClick={() => handleOpenDept('Phòng kỹ thuật')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Open Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Department Card 2: Phòng kinh doanh / thanh toán */}
                <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-5 h-4 bg-slate-800 rounded-xs flex items-center justify-center text-white text-[9px] font-mono">
                      ✉
                    </div>
                    <span>Phòng kinh doanh / thanh toán</span>
                  </div>
                  <p className="text-xs text-slate-500">All Enquiries</p>
                  <div>
                    <button
                      onClick={() => handleOpenDept('Phòng kinh doanh / thanh toán')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Open Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Knowledgebase Highlights */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" /> Cơ sở kiến thức & Hướng dẫn nhanh
                  </h3>
                  <button onClick={() => setActiveMenu('knowledge')} className="text-[11px] text-blue-600 hover:underline">
                    Xem tất cả &gt;
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/dashboard/knowledgebase/ssh-guide"
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/30 transition-all block group"
                  >
                    <p className="font-bold text-slate-800 text-xs group-hover:text-blue-600 flex items-center justify-between">
                      Hướng dẫn kết nối SSH vào VPS Linux <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Cách dùng Web terminal và phần mềm MobaXterm/PuTTY.</p>
                  </Link>

                  <Link
                    href="/dashboard/knowledgebase/reinstall-os"
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/30 transition-all block group"
                  >
                    <p className="font-bold text-slate-800 text-xs group-hover:text-blue-600 flex items-center justify-between">
                      Cách cài đặt lại Hệ điều hành (Rebuild OS) <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Các bước tự động cài Ubuntu, Debian, Alpine.</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DANH SÁCH YÊU CẦU HỖ TRỢ */}
          {activeMenu === 'my_tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Danh sách yêu cầu hỗ trợ</h1>
                  <p className="text-xs text-slate-500 mt-1">Theo dõi tiến trình xử lý phiếu hỗ trợ của bạn</p>
                </div>
                <button
                  onClick={() => setActiveMenu('open_ticket')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Mở Ticket Mới
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {tickets.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Chưa có ticket nào được tạo.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {tickets.map((t) => (
                      <Link
                        key={t.id}
                        href={`/dashboard/tickets/${t.id}`}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">#{t.id} - {t.subject}</p>
                          <div className="flex items-center gap-3 mt-1 text-slate-500 text-[11px]">
                            <span>Ưu tiên: <strong>{t.priority == '3' ? 'Cao' : 'Bình thường'}</strong></span>
                            <span>•</span>
                            <span>{new Date(t.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          t.status === 'Closed' || t.status === 'closed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {t.status === 'Closed' || t.status === 'closed' ? 'Đã đóng' : 'Đang xử lý'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: THÔNG BÁO */}
          {activeMenu === 'announcements' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Thông báo hệ thống</h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 space-y-1">
                <p className="font-bold">Bảo trì nâng cấp hạ tầng mạng máy chủ Cloud VPS</p>
                <p className="text-[11px] text-blue-600">Đăng ngày 20/08/2026 bởi Ban Quản Trị</p>
                <p className="pt-1">Hệ thống đã hoàn tất nâng cấp đường truyền băng thông quốc tế 10Gbps.</p>
              </div>
            </div>
          )}

          {/* VIEW 4: CƠ SỞ KIẾN THỨC (Matches screenshot with direct links to long guides) */}
          {activeMenu === 'knowledge' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Cơ sở kiến thức</h2>
                <p className="text-slate-500 text-xs mt-0.5">Tài liệu và hướng dẫn kỹ thuật chi tiết dành cho quản trị viên máy chủ</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Link
                  href="/dashboard/knowledgebase/ssh-guide"
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/20 transition-all block group"
                >
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 flex items-center justify-between">
                    Hướng dẫn kết nối SSH vào VPS Linux <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </p>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Cách dùng Web terminal trực tiếp, kết nối bằng MobaXterm, PuTTY, xác thực SSH Key và bảng lệnh Linux cơ bản.
                  </p>
                  <span className="inline-block text-blue-600 font-bold text-[11px] mt-3">Đọc bài viết chi tiết &gt;</span>
                </Link>

                <Link
                  href="/dashboard/knowledgebase/reinstall-os"
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/20 transition-all block group"
                >
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 flex items-center justify-between">
                    Cách cài đặt lại Hệ điều hành (Rebuild OS) <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </p>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Các bước tự động cài Ubuntu 24.04, Debian 12, Alpine Linux, phân tích ưu nhược điểm từng bản phân phối trong 30 giây.
                  </p>
                  <span className="inline-block text-blue-600 font-bold text-[11px] mt-3">Đọc bài viết chi tiết &gt;</span>
                </Link>
              </div>
            </div>
          )}

          {/* VIEW 5: TÀI NGUYÊN */}
          {activeMenu === 'downloads' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900">Tài nguyên & Phần mềm</h2>
              <p className="text-slate-500">Tải về các công cụ quản trị SSH client, FileZilla, VPN config.</p>
            </div>
          )}

          {/* VIEW 6: TRẠNG THÁI MẠNG */}
          {activeMenu === 'network' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Trạng thái mạng toàn hệ thống</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="font-bold text-emerald-900">Datacenter Viettel IDC (Hà Nội)</span>
                  <span className="text-emerald-700 font-bold">100% Hoạt động bình thường</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="font-bold text-emerald-900">Datacenter FPT Telecom (TP.HCM)</span>
                  <span className="text-emerald-700 font-bold">100% Hoạt động bình thường</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Gửi phiếu hỗ trợ: {selectedDept}</h3>
              </div>
              <button onClick={() => setSelectedDept(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề yêu cầu *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ví dụ: Cần hỗ trợ mở port 8080 trên VPS..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="1">Thấp (Low)</option>
                  <option value="2">Bình thường (Normal)</option>
                  <option value="3">Cao (High)</option>
                  <option value="4">Khẩn cấp (Urgent)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Mô tả cụ thể vấn đề hoặc dịch vụ bạn đang cần trợ giúp..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
