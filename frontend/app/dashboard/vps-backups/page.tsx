'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, AlertCircle, Clock, CheckCircle, Loader2, Plus } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Backup {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  status: 'completed' | 'failed' | 'processing';
  type: 'manual' | 'scheduled';
}

export default function VpsBackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await api.get('/backups/me');
      if (res.data && Array.isArray(res.data)) {
          setBackups(res.data);
      } else {
          setBackups([]);
      }
    } catch (err) {
      console.error('Failed to fetch backups:', err);
      setError('Không thể tải danh sách backup.');
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setError(null);
    try {
      const newBackup: Backup = {
        id: String(Date.now()),
        name: backupName || `Backup-${Date.now()}`,
        size: 2.5,
        createdAt: new Date().toISOString(),
        status: 'processing',
        type: 'manual'
      };
      setBackups(prev => [newBackup, ...prev]);
      setShowCreateModal(false);
      setBackupName('');

      // Simulate completion
      setTimeout(() => {
        setBackups(prev => prev.map(b =>
          b.id === newBackup.id ? { ...b, status: 'completed' as const } : b
        ));
      }, 2000);
    } catch (err) {
      console.error('Failed to create backup:', err);
      setError('Không thể tạo backup mới.');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa backup này?')) return;
    setBackups(prev => prev.filter(b => b.id !== backupId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vps-instances" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Backup - VPS</h1>
          <p className="text-slate-500 mt-1">Quản lý bản sao lưu cho VPS của bạn</p>
        </div>
      </div>

      {/* Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Tạo backup mới
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Danh sách backup</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {backups.map((backup) => (
            <div key={backup.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  backup.status === 'completed' ? 'bg-emerald-100' :
                  backup.status === 'processing' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  {backup.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : backup.status === 'processing' ? (
                    <Loader2 className="w-5 h-5 text-[#1F1F1F] animate-spin" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{backup.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(backup.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      backup.type === 'manual'
                        ? 'bg-blue-100 text-[#1F1F1F]'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {backup.type === 'manual' ? 'Thủ công' : 'Tự động'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">{backup.size} GB</span>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#1F1F1F] transition-colors" title="Tải về">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBackup(backup.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-red-600 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {backups.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-medium text-slate-500">Chưa có backup nào</p>
            <p className="text-sm text-slate-600 mt-1">Tạo backup để bảo vệ dữ liệu VPS của bạn</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tạo backup mới</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên backup</label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="VD: Backup trước khi nâng cấp"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={createBackup}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Tạo backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
