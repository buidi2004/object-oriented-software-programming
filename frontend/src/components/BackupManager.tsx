'use client';

import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Archive, Clock, PlayCircle } from 'lucide-react';
import { api } from '../lib/api';

interface Backup {
  id: string;
  orderId: string;
  backupDate: string;
  status: string;
  sizeBytes: number;
  note: string;
}

export default function BackupManager({ orderId }: { orderId: string }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchBackups();
  }, [orderId]);

  const fetchBackups = async () => {
    try {
      const res = await api.get(`/backups/${orderId}`);
      setBackups(res.data);
    } catch (error) {
      console.error('Failed to fetch backups', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!note.trim()) {
      alert('Vui lòng nhập ghi chú cho bản sao lưu (VD: Trước khi update OS)');
      return;
    }
    setIsCreating(true);
    try {
      await api.post('/backups/schedule', {
        orderId,
        note
      });
      alert('Đã lên lịch tạo bản sao lưu thành công!');
      setNote('');
      fetchBackups(); // Reload list
    } catch (error) {
      console.error('Failed to create backup', error);
      alert('Lỗi: Không thể tạo bản sao lưu.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-6">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quản lý Sao lưu (Backups)</h2>
            <p className="text-sm text-slate-500">Tạo và khôi phục bản sao lưu dữ liệu cho máy chủ</p>
          </div>
        </div>
        <button
          onClick={fetchBackups}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú cho bản sao lưu (VD: Backup trước khi cài LAMP)..."
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
        />
        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
        >
          {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Tạo bản sao lưu ngay
        </button>
      </div>

      <div className="p-0">
        {backups.length === 0 && !isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>Chưa có bản sao lưu nào. Hãy tạo bản sao lưu đầu tiên để bảo vệ dữ liệu của bạn!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Archive className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{backup.note || 'Bản sao lưu tự động'}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(backup.backupDate).toLocaleString('vi-VN')}</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{formatSize(backup.sizeBytes)}</span>
                      <span className={`font-bold ${backup.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {backup.status === 'Completed' ? 'Hoàn tất' : 'Đang xử lý'}
                      </span>
                    </div>
                  </div>
                </div>
                {backup.status === 'Completed' && (
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Khôi phục
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
