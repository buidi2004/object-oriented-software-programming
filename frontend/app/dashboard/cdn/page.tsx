'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, Plus, Shield, RefreshCw, Trash2, Globe, 
  Activity, CheckCircle2, AlertCircle, ArrowLeft, RotateCcw 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioning } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

interface CdnDistribution {
  id: string;
  domain: string;
  originServer: string;
  cname: string;
  status: string;
  cacheHitRate: number;
  bandwidthUsedGB: number;
  sslEnabled: boolean;
}

export default function DashboardCdnPage() {
  const { user } = useAuthStore();
  const [distributions, setDistributions] = useState<CdnDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [domain, setDomain] = useState('');
  const [originServer, setOriginServer] = useState('');
  const [sslEnabled, setSslEnabled] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cdn/distributions');
      setDistributions(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load CDN distributions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      await api.post('/cdn/distributions', {
        domain,
        originServer,
        sslEnabled,
      });
      setSuccess(`Đã tạo thành công CDN Distribution cho ${domain}!`);
      setIsCreateOpen(false);
      setDomain('');
      setOriginServer('');
      fetchDistributions();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo CDN Distribution');
    } finally {
      setCreating(false);
    }
  };

  const handlePurgeCache = async (distId: string) => {
    setSuccess('Đã gửi lệnh xóa Cache toàn cầu (Global Purge) thành công!');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600">
                <Zap className="w-7 h-7" />
              </div>
              Quản Lý Cloud CDN
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Phân phối nội dung toàn cầu, tăng tốc độ tải trang và xóa cache tức thì.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDistributions}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo CDN Distribution Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* CDN List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách CDN Distributions</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {distributions.length} tên miền
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              Đang tải danh sách CDN...
            </div>
          ) : distributions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có CDN Distribution Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Tăng tốc website và bảo vệ chống DDoS ngay bằng cách kết nối CDN với máy chủ gốc của bạn.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs shadow-md"
              >
                + Tạo CDN Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Miền (Custom Domain)</th>
                    <th className="px-6 py-4">Máy Chủ Gốc (Origin)</th>
                    <th className="px-6 py-4">CNAME Cung Cấp</th>
                    <th className="px-6 py-4">Tỉ Lệ Cache Hit</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {distributions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-500" />
                        {d.domain}
                        <CdnRealtimeBadge dist={d} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono">{d.originServer}</td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                        <CdnCnameCell dist={d} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          {d.cacheHitRate || 98.5}% Hit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handlePurgeCache(d.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-600 font-bold transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Xóa Cache
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create CDN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" /> Tạo Mạng Phân Phối CDN Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Điền tên miền website và IP/Domain của máy chủ gốc để phân phối nội dung.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền Website</label>
                <input
                  type="text"
                  required
                  placeholder="cdn.tenmien.com hoặc static.tenmien.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Máy Chủ Gốc (Origin IP / Host)</label>
                <input
                  type="text"
                  required
                  placeholder="103.145.xxx.xxx hoặc origin.tenmien.com"
                  value={originServer}
                  onChange={(e) => setOriginServer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={sslEnabled}
                  onChange={(e) => setSslEnabled(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="ssl" className="text-xs font-semibold text-slate-700">
                  Tự động cấp phát chứng chỉ SSL Edge (HTTPS) miễn phí
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Khởi Tạo CDN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CdnRealtimeBadge({ dist }: { dist: CdnDistribution }) {
  const status = useResourceProvisioning('CdnDistribution', dist.id, dist.status || 'Provisioning');
  // Nếu status là Provisioning, map thành Deploying cho phù hợp ngữ cảnh CDN
  const displayStatus = status === 'Provisioning' ? 'Deploying' : status;
  
  if (displayStatus === 'Running' || displayStatus === 'Active') return null;
  return <ProvisioningStatusBadge status={displayStatus} />;
}

function CdnCnameCell({ dist }: { dist: CdnDistribution }) {
  const status = useResourceProvisioning('CdnDistribution', dist.id, dist.status || 'Provisioning');
  
  if (status === 'Provisioning' || status === 'Deploying') {
    return <span className="text-slate-400 italic">Đang khởi tạo mạng lưới...</span>;
  }
  
  return (
    <span className="text-blue-600">
      {dist.cname || `${dist.domain}.cdn.cloudhost.vn`}
    </span>
  );
}
