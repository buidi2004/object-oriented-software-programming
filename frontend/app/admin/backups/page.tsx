'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, RefreshCw, Download, ArrowLeft, Search, 
  Plus, CheckCircle2, AlertCircle, HardDrive, Clock, Shield 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface BackupAdminItem {
  id: string;
  orderId: string;
  instanceName: string;
  ownerEmail: string;
  sizeGb: number;
  storageTarget: 'S3 Object Storage' | 'Cold Archive' | 'Local NVMe';
  createdAt: string;
  retentionDays: number;
  status: 'Completed' | 'In Progress' | 'Failed';
}

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<BackupAdminItem[]>([]);
  const [search, setSearch] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [success, setSuccess] = useState('');

  const mockBackups: BackupAdminItem[] = [
    {
      id: 'bk-1',
      orderId: 'ord-8812',
      instanceName: 'vps-prod-database-master',
      ownerEmail: 'tech.lead@vng.corp',
      sizeGb: 48.5,
      storageTarget: 'S3 Object Storage',
      createdAt: '2026-08-17T02:00:00Z',
      retentionDays: 30,
      status: 'Completed',
    },
    {
      id: 'bk-2',
      orderId: 'ord-8819',
      instanceName: 'vps-ecommerce-frontend-01',
      ownerEmail: 'cto@fintechnext.vn',
      sizeGb: 12.8,
      storageTarget: 'S3 Object Storage',
      createdAt: '2026-08-17T03:30:00Z',
      retentionDays: 14,
      status: 'Completed',
    },
    {
      id: 'bk-3',
      orderId: 'ord-8901',
      instanceName: 'vps-ai-model-training',
      ownerEmail: 'ai.lab@vietai.org',
      sizeGb: 120.0,
      storageTarget: 'Cold Archive',
      createdAt: '2026-08-16T23:00:00Z',
      retentionDays: 60,
      status: 'Completed',
    },
  ];

  useEffect(() => {
    setBackups(mockBackups);
  }, []);

  const handleTriggerBackup = () => {
    setIsTriggering(true);
    setTimeout(() => {
      const newBackup: BackupAdminItem = {
        id: `bk-${Date.now()}`,
        orderId: 'ord-manual-admin',
        instanceName: 'system-all-vps-snapshot',
        ownerEmail: 'admin@cloudhost.vn',
        sizeGb: 35.2,
        storageTarget: 'S3 Object Storage',
        createdAt: new Date().toISOString(),
        retentionDays: 30,
        status: 'Completed',
      };
      setBackups([newBackup, ...backups]);
      setIsTriggering(false);
      setSuccess('Đã kích hoạt tạo bản sao lưu hệ thống toàn diện thành công!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1500);
  };

  const filtered = backups.filter(b => 
    b.instanceName.toLowerCase().includes(search.toLowerCase()) || 
    b.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
    b.storageTarget.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Database className="w-6 h-6 text-teal-600" /> Quản Lý Sao Lưu Toàn Hệ Thống (Backups)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi dung lượng snapshot máy chủ khách hàng, vị trí lưu trữ S3 và chu kỳ lưu giữ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm máy chủ / email / storage..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              />
            </div>
            <button
              onClick={handleTriggerBackup}
              disabled={isTriggering}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTriggering ? 'animate-spin' : ''}`} />
              Backup Toàn Cụm
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* Backups Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Máy Chủ Khách Hàng</th>
                  <th className="px-6 py-4">Chủ Sở Hữu</th>
                  <th className="px-6 py-4">Dung Lượng</th>
                  <th className="px-6 py-4">Vị Trí Lưu Trữ</th>
                  <th className="px-6 py-4">Thời Gian Tạo</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-teal-600 shrink-0" />
                        {b.instanceName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {b.ownerEmail}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-700">
                      {b.sizeGb} GB
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-[11px] text-slate-700">
                        {b.storageTarget}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(b.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-emerald-50 text-emerald-700 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
