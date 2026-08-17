'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, RefreshCw, Clock, CheckCircle2, AlertCircle, 
  ArrowLeft, Shield, Server, Activity, Database 
} from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminJobsPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ job: string; message: string; success: boolean } | null>(null);

  const jobs = [
    {
      id: 'auto-renew',
      name: 'Xử Lý Tự Động Gia Hạn Dịch Vụ',
      endpoint: '/jobs/process-renewals',
      description: 'Quét toàn bộ VPS, Hosting và Domain sắp hết hạn trong 3 ngày tới và thực hiện trừ tiền ví tự động.',
      schedule: 'Mỗi ngày lúc 00:00 UTC',
      icon: RefreshCw,
      color: 'blue',
    },
    {
      id: 'cache-purge',
      name: 'Đồng Bộ & Dọn Dẹp Redis Cache',
      endpoint: '/jobs/process-renewals',
      description: 'Xóa các session hết hạn và giải phóng bộ nhớ đệm In-Memory Redis.',
      schedule: 'Mỗi 6 giờ một lần',
      icon: Database,
      color: 'teal',
    },
    {
      id: 'uptime-check',
      name: 'Kiểm Tra Sức Khỏe Uptime Cụm Server',
      endpoint: '/jobs/process-renewals',
      description: 'Gửi gói tin ping kiểm tra trạng thái toàn bộ 10+ cụm máy chủ và ghi nhận độ trễ.',
      schedule: 'Mỗi 1 phút một lần',
      icon: Activity,
      color: 'purple',
    },
  ];

  const handleRunJob = async (job: typeof jobs[0]) => {
    setRunning(job.id);
    setResult(null);

    try {
      const res = await api.post(job.endpoint);
      setResult({
        job: job.name,
        message: res.data?.message || 'Đã thực thi tác vụ nền thành công!',
        success: true,
      });
    } catch (err: any) {
      setResult({
        job: job.name,
        message: err?.response?.data?.message || err.message || 'Lỗi khi thực thi tác vụ',
        success: false,
      });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-indigo-600" /> Quản Lý Tác Vụ Nền (Background Jobs)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kích hoạt thủ công và theo dõi các cron jobs tự động trong hệ thống Backend.
            </p>
          </div>
        </div>

        {result && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
            result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span><strong>[{result.job}]</strong>: {result.message}</span>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0`}>
                  <job.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{job.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {job.schedule}
                    </span>
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      POST {job.endpoint}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRunJob(job)}
                disabled={running !== null}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shrink-0 disabled:opacity-50"
              >
                {running === job.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Chạy Ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
