'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, ShieldAlert, Activity, User, Globe, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') {
          router.push('/dashboard');
          return;
        }
        fetchAuditLogs(token);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchAuditLogs = async (token: string) => {
    try {
      const response = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.userEmail && log.userEmail.toLowerCase().includes(term)) ||
      log.action.toLowerCase().includes(term) ||
      log.entityName.toLowerCase().includes(term) ||
      log.entityId.toLowerCase().includes(term) ||
      log.ipAddress.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('add')) return 'bg-emerald-100 text-emerald-700';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return 'bg-blue-100 text-blue-700';
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return 'bg-red-100 text-red-700';
    if (lowerAction.includes('login') || lowerAction.includes('auth')) return 'bg-purple-100 text-purple-700';
    return 'bg-slate-100 text-slate-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-slate-700" />
                Nhật ký Hệ thống (Audit Logs)
              </h1>
              <p className="text-sm text-slate-500">{logs.length} bản ghi được lưu trữ</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex items-center">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm Email, Action, Entity, IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-700 w-48">Thời gian</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Người thực hiện</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Hành động</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Thực thể (Entity)</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">IP truy cập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {log.userEmail ? (
                          <span className="font-medium text-slate-900">{log.userEmail}</span>
                        ) : (
                          <span className="text-slate-400 italic">Hệ thống / Anonymous</span>
                        )}
                      </div>
                      {log.userId && <div className="text-xs text-slate-400 mt-0.5 ml-6 font-mono">{log.userId}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                        <Activity className="w-3 h-3 mr-1" />
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{log.entityName}</div>
                      {log.entityId && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{log.entityId}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                        <Globe className="w-4 h-4 text-slate-400" />
                        {log.ipAddress}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Không tìm thấy bản ghi nào phù hợp</p>
            </div>
          ) : (
            <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50 text-sm">
              <div className="text-slate-600">
                Hiển thị <span className="font-semibold text-slate-900">{indexOfFirstLog + 1}</span> đến <span className="font-semibold text-slate-900">{Math.min(indexOfLastLog, filteredLogs.length)}</span> trong số <span className="font-semibold text-slate-900">{filteredLogs.length}</span> kết quả
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium px-2">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
