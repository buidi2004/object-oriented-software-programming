'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, Phone, Mail, FileText, Download, 
  ExternalLink, CheckCircle2, Clock, AlertCircle, X, Send, 
  Trash2, Eye, Calendar, User, Briefcase, DollarSign, Award, 
  RefreshCw, Check, Sparkles
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface JobApplicationItem {
  id: string;
  applicationCode: string;
  candidateName: string;
  email: string;
  phoneNumber: string;
  jobPosition: string;
  expectedSalary: string;
  experienceLevel: string;
  portfolioUrl: string;
  introduction: string;
  cvFileUrl: string;
  cvFileName: string;
  cvFileSize: number;
  status: number; // 1: Submitted, 2: Reviewing, 3: Interviewing, 4: Accepted, 5: Rejected
  adminNotes: string;
  interviewSchedule: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCareersPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // View Details Modal
  const [selectedApp, setSelectedApp] = useState<JobApplicationItem | null>(null);

  // Status & Email Modal
  const [statusModalApp, setStatusModalApp] = useState<JobApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState<number>(1);
  const [interviewSchedule, setInterviewSchedule] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      const isAllowed = ['Admin', 'Technician', 'Editor', 'Support', 'Staff', 'Accountant'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) {
        router.push('/dashboard');
        return;
      }
      fetchApplications();
    } catch {
      router.push('/login');
    }
  };

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/careers/admin/all');
      if (Array.isArray(res.data)) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusModal = (app: JobApplicationItem) => {
    setStatusModalApp(app);
    setNewStatus(app.status);
    setInterviewSchedule(app.interviewSchedule || '');
    setAdminNotes(app.adminNotes || '');
    setSendEmail(true);
    setCustomSubject(`[SEN CloudHost] Cập nhật tiến trình ứng tuyển vị trí ${app.jobPosition} (${app.applicationCode})`);
    setCustomBody('');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalApp) return;

    try {
      setUpdating(true);
      await api.put(`/careers/admin/${statusModalApp.id}/status`, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
        interviewSchedule: interviewSchedule.trim(),
        sendEmail: sendEmail,
        customEmailSubject: customSubject.trim(),
        customEmailBody: customBody.trim()
      });

      setStatusModalApp(null);
      fetchApplications();
    } catch (err: any) {
      console.error(err);
      alert('Cập nhật trạng thái ứng viên thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ ứng viên: "${name}"?`)) return;
    try {
      await api.delete(`/careers/admin/${id}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Xóa hồ sơ thất bại.');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-900/30 text-blue-300 font-bold text-[11px] border border-blue-200">📥 Bước 1: Mới Tiếp Nhận</span>;
      case 2:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">👁️ Bước 2: Đang Thẩm Định</span>;
      case 3:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">📝 Bước 3: Lên Lịch Phỏng Vấn</span>;
      case 4:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">🎉 Bước 4: Trúng Tuyển (Offer)</span>;
      case 5:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">🤝 Bước 4: Chưa Phù Hợp</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-bold text-[11px]">Đã nhận</span>;
    }
  };

  const filteredApps = applications.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status.toString() === statusFilter;
    const matchSearch = !searchTerm.trim() ||
      a.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phoneNumber.includes(searchTerm) ||
      a.jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicationCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalApps = applications.length;
  const newApps = applications.filter(a => a.status === 1).length;
  const interviewingApps = applications.filter(a => a.status === 3).length;
  const acceptedApps = applications.filter(a => a.status === 4).length;

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="p-2.5 rounded-xl border border-white/10 hover:bg-[#0F172A] text-slate-500 hover:text-white transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Quản Lý Tuyển Dụng &amp; Ứng Viên (Careers CRM)</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-900/50 text-blue-800 rounded-full">Pipeline 4 Bước</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Tiếp nhận CV, thẩm định hồ sơ, lên lịch phỏng vấn và gửi email thông báo kết quả</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchApplications}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-[#0F172A] text-slate-200 font-bold text-xs transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Làm Mới</span>
            </button>

            <Link
              href="/careers"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 font-bold text-xs transition-all shadow-2xs flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem Trang Tuyển Dụng</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{totalApps}</div>
              <div className="text-xs text-slate-500 font-medium">Tổng Hồ Sơ Ứng Tuyển</div>
            </div>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{newApps}</div>
              <div className="text-xs text-slate-500 font-medium">Mới Nộp (Chờ Thẩm Định)</div>
            </div>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600">{interviewingApps}</div>
              <div className="text-xs text-slate-500 font-medium">Đang Phỏng Vấn (Bước 3)</div>
            </div>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{acceptedApps}</div>
              <div className="text-xs text-slate-500 font-medium">Đã Tuyển Dụng Thành Công</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: `Tất Cả (${applications.length})` },
              { id: '1', label: 'Bước 1: Mới Nộp' },
              { id: '2', label: 'Bước 2: Thẩm Định' },
              { id: '3', label: 'Bước 3: Phỏng Vấn' },
              { id: '4', label: 'Bước 4: Trúng Tuyển' },
              { id: '5', label: 'Chưa Phù Hợp' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, vị trí, mã APP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Applications Table */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải danh sách hồ sơ ứng viên...</span>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p>Chưa có hồ sơ ứng tuyển nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-[#0F172A] border-b border-white/10 text-slate-200 font-black uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ứng Viên</th>
                    <th className="py-3.5 px-4">Vị Trí &amp; Mức Lương</th>
                    <th className="py-3.5 px-4">Kinh Nghiệm &amp; CV</th>
                    <th className="py-3.5 px-4 text-center">Tiến Trình 4 Bước</th>
                    <th className="py-3.5 px-4 text-center">Ngày Nộp</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#0F172A]/80 transition-colors">
                      
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{app.candidateName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{app.email}</div>
                        <div className="text-[11px] text-blue-400 font-bold mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${app.phoneNumber}`} className="hover:underline">{app.phoneNumber || 'N/A'}</a>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{app.jobPosition}</div>
                        <div className="text-[11px] font-mono text-emerald-600 font-bold mt-0.5">
                          {app.expectedSalary || 'Lương thỏa thuận'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Mã: {app.applicationCode}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-slate-200 font-medium">{app.experienceLevel || 'Chưa rõ'}</div>
                        {app.cvFileUrl ? (
                          <a 
                            href={`/api/careers/download-cv/${app.id}`} 
                            target="_blank" 
                            download 
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:underline mt-1 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200/60"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{app.cvFileName || 'Xem File CV'}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Không đính kèm file</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(app.status)}
                        {app.interviewSchedule && (
                          <div className="text-[10px] text-purple-700 font-medium mt-1 truncate max-w-[140px] mx-auto">
                            📅 {app.interviewSchedule}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center text-[11px] font-mono text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* 1-Click Call */}
                          {app.phoneNumber && (
                            <a
                              href={`tel:${app.phoneNumber}`}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Gọi điện cho ứng viên"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết hồ sơ & thư ngỏ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Update Pipeline Status & Send Email */}
                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="px-2.5 py-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-200 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Chuyển bước Pipeline & gửi email"
                          >
                            <Send className="w-3 h-3" />
                            <span>Cập Nhật</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(app.id, app.candidateName)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: VIEW DETAILS */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-900/30 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {selectedApp.applicationCode}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{selectedApp.candidateName}</h3>
                <p className="text-xs text-slate-500 font-bold">Ứng tuyển: {selectedApp.jobPosition}</p>
              </div>

              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#0F172A] rounded-2xl space-y-1">
                <span className="text-slate-500">Email:</span>
                <div className="font-bold text-white">{selectedApp.email}</div>
              </div>

              <div className="p-3.5 bg-[#0F172A] rounded-2xl space-y-1">
                <span className="text-slate-500">Số điện thoại:</span>
                <div className="font-bold text-white">{selectedApp.phoneNumber || 'N/A'}</div>
              </div>

              <div className="p-3.5 bg-[#0F172A] rounded-2xl space-y-1">
                <span className="text-slate-500">Mức lương mong muốn:</span>
                <div className="font-bold text-emerald-600">{selectedApp.expectedSalary || 'Thỏa thuận'}</div>
              </div>

              <div className="p-3.5 bg-[#0F172A] rounded-2xl space-y-1">
                <span className="text-slate-500">Kinh nghiệm:</span>
                <div className="font-bold text-white">{selectedApp.experienceLevel || 'Chưa rõ'}</div>
              </div>
            </div>

            {selectedApp.portfolioUrl && (
              <div className="p-3.5 bg-blue-900/30 rounded-2xl text-xs space-y-1">
                <span className="text-blue-300 font-bold">Portfolio / GitHub / LinkedIn:</span>
                <div>
                  <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 font-mono">
                    <span>{selectedApp.portfolioUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {selectedApp.introduction && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-200">Thư ngỏ / Giới thiệu bản thân:</span>
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/10 text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.introduction}
                </div>
              </div>
            )}

            {selectedApp.cvFileUrl && (
              <div className="flex items-center justify-between p-4 bg-[#0F172A] rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-bold text-white">{selectedApp.cvFileName || 'Hồ_sơ_CV.pdf'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{(selectedApp.cvFileSize / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                </div>

                <a
                  href={`/api/careers/download-cv/${selectedApp.id}`}
                  target="_blank"
                  download
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File CV</span>
                </a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const app = selectedApp;
                  setSelectedApp(null);
                  handleOpenStatusModal(app);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Cập Nhật Trạng Thái &amp; Gửi Email
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE PIPELINE STATUS & DISPATCH EMAIL */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Cập Nhật Tiến Trình Tuyển Dụng</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ứng viên: <strong>{statusModalApp.candidateName}</strong> &bull; Vị trí: <strong>{statusModalApp.jobPosition}</strong>
                </p>
              </div>

              <button 
                onClick={() => setStatusModalApp(null)}
                className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Trạng Thái Pipeline Tuyển Dụng (4 Bước) *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">📥 Bước 1: Đã Tiếp Nhận Hồ Sơ</option>
                  <option value="2">👁️ Bước 2: Đang Thẩm Định &amp; Xem Xét CV</option>
                  <option value="3">📝 Bước 3: Lên Lịch Phỏng Vấn &amp; Test Kỹ Thuật</option>
                  <option value="4">🎉 Bước 4: Trúng Tuyển / Gửi Thư Mời Nhận Việc (Offer)</option>
                  <option value="5">🤝 Bước 4 (Phương án 2): Chưa Phù Hợp Đợt Này</option>
                </select>
              </div>

              {newStatus === 3 && (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Lịch Hẹn Phỏng Vấn (Thời gian &amp; Địa điểm / Link Google Meet)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 14:00 Thứ 5 ngày 28/08/2026 tại Văn phòng SEN CloudHost hoặc Google Meet: meet.google.com/xyz"
                    value={interviewSchedule}
                    onChange={(e) => setInterviewSchedule(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Ghi Chú / Nhận Xét Từ Ban Tuyển Dụng</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú đánh giá chuyên môn, lưu ý hoặc thông điệp cho ứng viên..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Email Options */}
              <div className="p-4 bg-blue-900/30/60 rounded-2xl border border-blue-200/60 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-400 rounded focus:ring-blue-500 border-white/20"
                  />
                  <span className="text-xs font-bold text-blue-900">
                    Tự động gửi email thông báo cập nhật tới {statusModalApp.email}
                  </span>
                </label>

                {sendEmail && (
                  <div className="space-y-2 pt-2 border-t border-blue-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-200 mb-0.5">Tiêu đề email:</label>
                      <input
                        type="text"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-200 mb-0.5">Nội dung thư tùy biến (Tùy chọn):</label>
                      <textarea
                        rows={3}
                        placeholder="Để trống nếu muốn sử dụng mẫu email chuẩn tự động..."
                        value={customBody}
                        onChange={(e) => setCustomBody(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-white/10 transition-colors"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Lưu &amp; Gửi Thông Báo</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
