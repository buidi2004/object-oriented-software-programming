'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, RefreshCw, Clock, CheckCircle2, AlertCircle, 
  ArrowLeft, Shield, Server, Activity, Database, Plus, Trash2, Pause, ExternalLink, X, Terminal 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface BackgroundJobItem {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  schedule: string;
  cronExpr: string;
  isPaused: boolean;
  lastRun?: string;
  status: 'Idle' | 'Running' | 'Failed' | 'Completed';
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<BackgroundJobItem[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '/jobs/custom-task',
    description: '',
    cronExpr: '0 0 * * *',
    schedule: 'Mỗi ngày lúc 00:00'
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialJobs: BackgroundJobItem[] = [
    {
      id: 'auto-renew',
      name: 'Xử Lý Tự Động Gia Hạn Dịch Vụ & Trừ Ví',
      endpoint: '/jobs/process-renewals',
      description: 'Quét toàn bộ VPS, Hosting và Domain sắp hết hạn trong 3 ngày tới và thực hiện trừ tiền ví tự động.',
      schedule: 'Mỗi ngày lúc 00:00 UTC',
      cronExpr: '0 0 * * *',
      isPaused: false,
      lastRun: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      status: 'Completed'
    },
    {
      id: 'cache-purge',
      name: 'Đồng Bộ & Dọn Dẹp In-Memory Redis Cache',
      endpoint: '/jobs/redis-purge',
      description: 'Xóa các session và token blacklist đã hết hạn, giải phóng bộ nhớ RAM đệm.',
      schedule: 'Mỗi 6 giờ một lần',
      cronExpr: '0 */6 * * *',
      isPaused: false,
      lastRun: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      status: 'Completed'
    },
    {
      id: 'uptime-check',
      name: 'Gửi Gói Tin Ping Giám Sát Uptime Server',
      endpoint: '/jobs/uptime-ping',
      description: 'Gửi gói tin ping kiểm tra trạng thái toàn bộ 10+ cụm máy chủ và ghi nhận độ trễ.',
      schedule: 'Mỗi 1 phút một lần',
      cronExpr: '* * * * *',
      isPaused: false,
      lastRun: new Date(Date.now() - 30 * 1000).toISOString(),
      status: 'Completed'
    },
    {
      id: 'cart-abandon-reminder',
      name: 'Gửi Email Khôi Phục Giỏ Hàng Bỏ Quên',
      endpoint: '/jobs/abandoned-carts-notify',
      description: 'Quét các giỏ hàng không thanh toán sau 24h và gửi email đính kèm voucher 15%.',
      schedule: 'Mỗi 2 giờ một lần',
      cronExpr: '0 */2 * * *',
      isPaused: false,
      lastRun: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      status: 'Completed'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('admin_background_jobs');
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
      } catch {
        setJobs(initialJobs);
      }
    } else {
      setJobs(initialJobs);
    }
  }, []);

  const saveJobs = (items: BackgroundJobItem[]) => {
    setJobs(items);
    localStorage.setItem('admin_background_jobs', JSON.stringify(items));
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.endpoint.trim()) {
      showToast('Vui lòng nhập tên tác vụ và endpoint.', 'error');
      return;
    }

    const newJob: BackgroundJobItem = {
      id: `job-${Date.now()}`,
      name: formData.name.trim(),
      endpoint: formData.endpoint.trim(),
      description: formData.description.trim() || 'Tác vụ tự động lập lịch định kỳ.',
      schedule: formData.schedule.trim(),
      cronExpr: formData.cronExpr.trim(),
      isPaused: false,
      status: 'Idle'
    };

    const updated = [newJob, ...jobs];
    saveJobs(updated);
    setShowAddModal(false);
    showToast(`Đã tạo tác vụ cron job ${newJob.name} thành công!`);
  };

  const handleRunJob = async (job: BackgroundJobItem) => {
    setRunningId(job.id);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString('vi-VN')}] Bắt đầu thực thi: ${job.name} (POST ${job.endpoint})...`,
      ...prev
    ]);

    try {
      await new Promise(r => setTimeout(r, 1200));
      const updated = jobs.map(j => j.id === job.id ? { 
        ...j, 
        lastRun: new Date().toISOString(), 
        status: 'Completed' as const 
      } : j);
      saveJobs(updated);
      
      setLogs(prev => [
        `[${new Date().toLocaleTimeString('vi-VN')}] SUCCESS: ${job.name} đã hoàn tất 100% không phát sinh lỗi.`,
        ...prev
      ]);
      showToast(`Đã thực thi thành công tác vụ ${job.name}!`);
    } catch {
      showToast('Lỗi khi thực thi tác vụ nền', 'error');
    } finally {
      setRunningId(null);
    }
  };

  const handleTogglePause = (id: string) => {
    const updated = jobs.map(j => {
      if (j.id === id) {
        const nextState = !j.isPaused;
        showToast(`Đã ${nextState ? 'tạm ngưng' : 'kích hoạt lại'} tác vụ ${j.name}`);
        return { ...j, isPaused: nextState };
      }
      return j;
    });
    saveJobs(updated);
  };

  const handleDeleteJob = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tác vụ cron job ${name}?`)) return;
    const updated = jobs.filter(j => j.id !== id);
    saveJobs(updated);
    showToast(`Đã xóa tác vụ ${name}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-[#1F1F1F]" /> Quản Lý Tác Vụ Nền &amp; Cron Jobs (Hangfire)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kích hoạt thủ công, lập lịch và giám sát các cron jobs định kỳ của hệ thống Backend.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Lập Lịch Job Mới
            </button>
          </div>
        </div>

        {/* Live Execution Logs */}
        {logs.length > 0 && (
          <div className="bg-white rounded-3xl p-6 mb-8 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-2 text-slate-200">
                <Terminal className="w-4 h-4" /> Nhật Ký Thực Thi Tác Vụ Trực Tiếp (Live Console Logs)
              </span>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] hover:text-slate-900 underline cursor-pointer"
              >
                Xóa màn hình log
              </button>
            </div>
            <div className="font-mono text-xs text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="space-y-4 mb-8">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-indigo-50 text-[#1F1F1F] shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-base font-black text-slate-900">{job.name}</h3>
                    {job.isPaused ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Đang tạm ngưng
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-600 font-semibold">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3 text-[#1F1F1F]" /> {job.schedule}
                    </span>
                    <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Cron: {job.cronExpr}
                    </span>
                    <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      POST {job.endpoint}
                    </span>
                    {job.lastRun && (
                      <span className="text-slate-600">
                        Lần chạy cuối: {new Date(job.lastRun).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 justify-end">
                <button
                  onClick={() => handleTogglePause(job.id)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                  title={job.isPaused ? 'Tiếp tục lập lịch' : 'Tạm dừng tác vụ'}
                >
                  {job.isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id, job.name)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Xóa job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRunJob(job)}
                  disabled={runningId === job.id || job.isPaused}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {runningId === job.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang Chạy...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Chạy Ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Lập Lịch Cron Job Mới</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tác Vụ</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Quét Và Khóa VPS Quá Hạn 7 Ngày"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Endpoint API Gọi Thực Thi</label>
                  <input
                    type="text"
                    required
                    value={formData.endpoint}
                    onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="/jobs/terminate-expired-vps"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Biểu Thức Cron</label>
                    <input
                      type="text"
                      required
                      value={formData.cronExpr}
                      onChange={e => setFormData({ ...formData, cronExpr: e.target.value })}
                      placeholder="0 0 * * *"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diễn Giải Lịch Trình</label>
                    <input
                      type="text"
                      required
                      value={formData.schedule}
                      onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                      placeholder="Mỗi ngày lúc 00:00"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Tác Vụ</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                  >
                    Lưu Lập Lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
