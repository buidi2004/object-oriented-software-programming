'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, RefreshCw, Download, ArrowLeft, Search, 
  Plus, CheckCircle2, AlertCircle, HardDrive, Clock, Shield,
  Trash2, RotateCcw, X, AlertTriangle, FileArchive, Server
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
  const [filter, setFilter] = useState<'all' | 'Completed' | 'In Progress' | 'Failed'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<BackupAdminItem | null>(null);

  const [formData, setFormData] = useState({
    instanceName: 'all-production-databases',
    ownerEmail: 'admin@cloudhost.vn',
    storageTarget: 'S3 Object Storage' as const,
    retentionDays: 30,
    sizeGb: 28.5
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialBackups: BackupAdminItem[] = [
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
    const saved = localStorage.getItem('admin_backups_list');
    if (saved) {
      try {
        setBackups(JSON.parse(saved));
      } catch {
        setBackups(initialBackups);
      }
    } else {
      setBackups(initialBackups);
    }
  }, []);

  const saveBackups = (items: BackupAdminItem[]) => {
    setBackups(items);
    localStorage.setItem('admin_backups_list', JSON.stringify(items));
  };

  const handleCreateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriggering(true);
    setShowAddModal(false);

    setTimeout(() => {
      const newBackup: BackupAdminItem = {
        id: `bk-${Date.now()}`,
        orderId: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
        instanceName: formData.instanceName,
        ownerEmail: formData.ownerEmail,
        sizeGb: formData.sizeGb,
        storageTarget: formData.storageTarget,
        createdAt: new Date().toISOString(),
        retentionDays: formData.retentionDays,
        status: 'Completed',
      };
      const updated = [newBackup, ...backups];
      saveBackups(updated);
      setIsTriggering(false);
      showToast(`Đã tạo thành công bản sao lưu ${newBackup.instanceName} (${newBackup.sizeGb} GB)!`);
    }, 1200);
  };

  const handleDownloadBackup = (bk: BackupAdminItem) => {
    // Generate dummy archive download
    const blob = new Blob([`Snapshot Archive for ${bk.instanceName}\nCreated at: ${bk.createdAt}\nSize: ${bk.sizeGb} GB`], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bk.instanceName}_${bk.id}.tar.gz`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đang tải xuống tệp sao lưu: ${bk.instanceName}_${bk.id}.tar.gz`);
  };

  const handleRestore = () => {
    if (!restoringBackup) return;
    showToast(`Bắt đầu khôi phục hệ thống từ bản sao lưu ${restoringBackup.instanceName}... Quá trình sẽ diễn ra ngầm!`);
    setRestoringBackup(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bản sao lưu ${name}?`)) return;
    const updated = backups.filter(b => b.id !== id);
    saveBackups(updated);
    showToast(`Đã xóa bản sao lưu ${name}!`);
  };

  const filtered = backups.filter(b => {
    const matchesSearch = b.instanceName.toLowerCase().includes(search.toLowerCase()) || 
      b.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.storageTarget.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && b.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
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
            <Link href="/admin" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Database className="w-6 h-6 text-teal-600" /> Quản Lý Sao Lưu Toàn Hệ Thống (Backups &amp; Snapshots)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Theo dõi dung lượng snapshot máy chủ khách hàng, vị trí lưu trữ S3, khôi phục và tải về bản sao lưu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm máy chủ / email / storage..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm w-60"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isTriggering}
              className="px-4 py-2.5 rounded bg-teal-600 hover:bg-teal-700 text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isTriggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isTriggering ? 'Đang Sao Lưu...' : 'Tạo Bản Sao Lưu'}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Completed', label: 'Hoàn thành' },
            { id: 'In Progress', label: 'Đang tiến hành' },
            { id: 'Failed', label: 'Thất bại' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Backups Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tên Bản Sao Lưu / VPS</th>
                  <th className="px-6 py-4">Chủ Sở Hữu</th>
                  <th className="px-6 py-4">Dung Lượng</th>
                  <th className="px-6 py-4">Vị Trí Lưu Trữ</th>
                  <th className="px-6 py-4">Thời Gian Tạo</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <span>{bk.instanceName}</span>
                          <span className="block text-[10px] text-slate-600 font-mono">{bk.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{bk.ownerEmail}</td>
                    <td className="px-6 py-4 font-black text-slate-800">
                      {bk.sizeGb} GB
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        <HardDrive className="w-3 h-3 text-slate-600" />
                        {bk.storageTarget}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(bk.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadBackup(bk)}
                          className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-sm transition-colors"
                          title="Tải về tệp .tar.gz"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRestoringBackup(bk)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-sm transition-colors"
                          title="Khôi phục hệ thống"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bk.id, bk.instanceName)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                          title="Xóa bản sao lưu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Backup Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Tạo Bản Sao Lưu Thủ Công</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBackup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mục Tiêu Sao Lưu</label>
                  <input
                    type="text"
                    required
                    value={formData.instanceName}
                    onChange={e => setFormData({ ...formData, instanceName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vị Trí Lưu Trữ</label>
                  <select
                    value={formData.storageTarget}
                    onChange={e => setFormData({ ...formData, storageTarget: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="S3 Object Storage">S3 Object Storage (AWS / Wasabi)</option>
                    <option value="Cold Archive">Cold Archive (Glacier Backup)</option>
                    <option value="Local NVMe">Local NVMe Storage</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Thời Gian Lưu Giữ (Ngày)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={365}
                      value={formData.retentionDays}
                      onChange={e => setFormData({ ...formData, retentionDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dung Lượng Ước Tính (GB)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={formData.sizeGb}
                      onChange={e => setFormData({ ...formData, sizeGb: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded bg-teal-600 hover:bg-teal-700 text-slate-900 text-xs font-bold shadow-md"
                  >
                    Kích Hoạt Sao Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        {restoringBackup && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 text-center mb-1">
                Xác Nhận Khôi Phục Hệ Thống
              </h3>
              <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
                Bạn có chắc chắn muốn khôi phục máy chủ từ bản sao lưu <strong>{restoringBackup.instanceName}</strong> (Tạo lúc {new Date(restoringBackup.createdAt).toLocaleDateString('vi-VN')})? Dữ liệu phát sinh sau thời điểm này có thể bị ghi đè!
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setRestoringBackup(null)}
                  className="flex-1 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleRestore}
                  className="flex-1 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  Bắt Đầu Khôi Phục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
