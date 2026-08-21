'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, ShieldAlert, Activity, User, Globe, Clock, 
  ChevronLeft, ChevronRight, Download, Trash2, Filter, Eye, CheckCircle2, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const logsPerPage = 12;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialLogs: AuditLog[] = [
    {
      id: 'log-1',
      userId: 'usr-admin-01',
      userEmail: 'admin@cloudhost.vn',
      action: 'UPDATE_SERVICE_PLAN',
      entityName: 'ServicePlan',
      entityId: 'plan-vps-pro-4c',
      ipAddress: '14.225.254.10',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      details: JSON.stringify({ field: 'Price', oldVal: 450000, newVal: 420000, note: 'Admin updated monthly pricing' }, null, 2)
    },
    {
      id: 'log-2',
      userId: 'usr-admin-01',
      userEmail: 'admin@cloudhost.vn',
      action: 'CREATE_PROMOTION',
      entityName: 'Promotion',
      entityId: 'promo-flashsale-sep',
      ipAddress: '14.225.254.10',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      details: JSON.stringify({ discount: '25%', target: 'All VPS Plans', duration: '7 days' }, null, 2)
    },
    {
      id: 'log-3',
      userId: 'usr-cust-99',
      userEmail: 'cto@fintechnext.vn',
      action: 'ORDER_PAYMENT_SUCCESS',
      entityName: 'Order',
      entityId: 'ord-8819',
      ipAddress: '113.161.78.20',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      details: JSON.stringify({ gateway: 'VNPay', amount: 8900000, status: 'PAID' }, null, 2)
    },
    {
      id: 'log-4',
      userId: 'usr-admin-01',
      userEmail: 'admin@cloudhost.vn',
      action: 'LOCK_USER_ACCOUNT',
      entityName: 'User',
      entityId: 'usr-spam-04',
      ipAddress: '14.225.254.10',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      details: JSON.stringify({ reason: 'DDoS traffic origin detected by Cloudflare WAF' }, null, 2)
    },
    {
      id: 'log-5',
      userId: 'usr-editor-02',
      userEmail: 'editor@cloudhost.vn',
      action: 'PUBLISH_ARTICLE',
      entityName: 'NewsArticle',
      entityId: 'art-k8s-tutorial',
      ipAddress: '27.72.105.44',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      details: JSON.stringify({ title: 'Hướng Dẫn Cài Đặt Kubernetes Trên Cloud VPS' }, null, 2)
    }
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin') { 
        router.push('/dashboard'); 
        return; 
      }
      fetchAuditLogs();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/audit-logs').catch(() => null);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setLogs(res.data);
      } else {
        const saved = localStorage.getItem('admin_audit_logs');
        if (saved) {
          try {
            setLogs(JSON.parse(saved));
          } catch {
            setLogs(initialLogs);
          }
        } else {
          setLogs(initialLogs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLogs = (items: AuditLog[]) => {
    setLogs(items);
    localStorage.setItem('admin_audit_logs', JSON.stringify(items));
  };

  const handleClearLogs = () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ nhật ký hệ thống cũ?')) return;
    saveLogs([]);
    showToast('Đã dọn dẹp toàn bộ Audit Logs thành công!');
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Thoi_Gian,Nguoi_Thuc_Hien,Hanh_Dong,Doi_Tuong,Ma_Doi_Tuong,IP_Address\n"
      + filteredLogs.map(l => `"${l.id}","${l.timestamp}","${l.userEmail || 'System'}","${l.action}","${l.entityName}","${l.entityId}","${l.ipAddress}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất toàn bộ nhật ký thao tác ra file CSV!');
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (log.userEmail && log.userEmail.toLowerCase().includes(term)) ||
      log.action.toLowerCase().includes(term) ||
      log.entityName.toLowerCase().includes(term) ||
      log.entityId.toLowerCase().includes(term) ||
      log.ipAddress.toLowerCase().includes(term)
    );

    const matchesEntity = selectedEntity === 'ALL' || log.entityName === selectedEntity;
    const matchesAction = selectedAction === 'ALL' || log.action.includes(selectedAction);

    return matchesSearch && matchesEntity && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const getActionBadgeClass = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('CREATE') || a.includes('ADD') || a.includes('SUCCESS')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (a.includes('UPDATE') || a.includes('EDIT')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (a.includes('DELETE') || a.includes('LOCK') || a.includes('FAIL')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
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
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-slate-700" />
                Nhật Ký Thao Tác Hệ Thống (Audit Logs)
              </h1>
              <p className="text-xs text-slate-500">{logs.length} bản ghi nhật ký kiểm toán</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Xuất CSV
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Dọn Dẹp Logs
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm theo email, hành động, IP hoặc mã thực thể..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={selectedEntity}
              onChange={(e) => { setSelectedEntity(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="ALL">Mọi Thực Thể</option>
              <option value="ServicePlan">ServicePlan</option>
              <option value="User">User</option>
              <option value="Order">Order</option>
              <option value="Promotion">Promotion</option>
              <option value="NewsArticle">NewsArticle</option>
            </select>

            <select
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="ALL">Mọi Hành Động</option>
              <option value="CREATE">CREATE / ADD</option>
              <option value="UPDATE">UPDATE / EDIT</option>
              <option value="DELETE">DELETE / REMOVE</option>
              <option value="LOCK">LOCK / SUSPEND</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold">Người thực hiện</th>
                <th className="px-6 py-3.5 text-left font-bold">Hành động</th>
                <th className="px-6 py-3.5 text-left font-bold">Thực thể &amp; ID</th>
                <th className="px-6 py-3.5 text-left font-bold">Địa chỉ IP</th>
                <th className="px-6 py-3.5 text-left font-bold">Thời gian</th>
                <th className="px-6 py-3.5 text-right font-bold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{log.userEmail || 'Hệ Thống Tự Động'}</p>
                        <p className="text-[10px] text-slate-600 font-mono">{log.userId || 'system'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold text-slate-900">{log.entityName}</span>
                      <span className="block text-[11px] text-slate-600 font-mono">{log.entityId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {log.ipAddress}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết Payload"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-bold text-slate-700">Không tìm thấy bản ghi nhật ký nào</p>
              <p className="text-xs text-slate-600 mt-1">Thử thay đổi bộ lọc tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>Trang {currentPage} / {totalPages} (Tổng cộng {filteredLogs.length} logs)</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payload Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Chi Tiết Payload Nhật Ký</h3>
                <button onClick={() => setSelectedLog(null)} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 text-xs mb-4">
                <p><strong>Hành động:</strong> {selectedLog.action}</p>
                <p><strong>Thực thể:</strong> {selectedLog.entityName} ({selectedLog.entityId})</p>
                <p><strong>Người thực hiện:</strong> {selectedLog.userEmail} (IP: {selectedLog.ipAddress})</p>
                <p><strong>Thời gian:</strong> {new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-white text-slate-900 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-60">
                <pre>{selectedLog.details || '{\n  "status": "No additional payload recorded"\n}'}</pre>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
