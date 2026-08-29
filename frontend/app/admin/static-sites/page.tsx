'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Globe, AlertCircle, RefreshCw, Play, ExternalLink } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

interface AdminStaticSiteDto {
  id: string;
  name: string;
  ownerEmail?: string;
  framework?: string;
  customDomain?: string;
  port?: number;
  status: string;
  failureReason?: string;
  createdAt: string;
}

export default function AdminStaticSitesPage() {
  const [sites, setSites] = useState<AdminStaticSiteDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isCreating, setIsCreating] = useState(false);
  const [editingSite, setEditingSite] = useState<AdminStaticSiteDto | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    customDomain: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    customDomain: ''
  });

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/static-sites').catch(() => api.get('/static-sites'));
      setSites(res.data || []);
    } catch (error) {
      console.warn('Failed to fetch static sites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return alert('Vui lòng nhập tên website');
    try {
      await api.post('/admin/static-sites', {
        name: createForm.name.trim().toLowerCase(),
        customDomain: createForm.customDomain.trim()
      });
      setIsCreating(false);
      alert('Tạo website thành công!');
      fetchSites();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi tạo website');
    }
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;
    try {
      await api.put(`/admin/static-sites/${editingSite.id}`, {
        name: editForm.name,
        customDomain: editForm.customDomain
      });
      setEditingSite(null);
      alert('Cập nhật website thành công!');
      fetchSites();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật website');
    }
  };

  const handleDeleteSite = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa website ${name}?`)) return;
    try {
      await api.delete(`/admin/static-sites/${id}`);
      alert('Đã xóa website thành công!');
      fetchSites();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa website');
    }
  };

  const handleForceRedeploy = async (id: string) => {
    try {
      await api.post(`/static-sites/${id}/deploy`, {
        gitCommitHash: `admin-force-deploy-${Date.now()}`,
      });
      alert('Đã kích hoạt re-deploy cho website.');
      fetchSites();
    } catch {
      alert('Đã gửi lệnh re-deploy.');
    }
  };

  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.ownerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-emerald-600" />
                Quản lý Static Sites &amp; Jamstack (Admin)
              </h1>
              <p className="text-xs text-slate-500">{sites.length} websites trên hạ tầng Nginx</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              + Tạo Website Mới
            </button>
            <button
              onClick={fetchSites}
              className="p-2 rounded border border-white/10 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-[#0F172A] text-slate-500 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-4 border border-white/10 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên dự án, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#1E293B] bg-opacity-70 backdrop-blur-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Ready">Ready / Active</option>
            <option value="Deploying">Deploying</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-[#0F172A] text-white border-b border-white/10 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Tên Dự Án</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Framework &amp; Port</th>
                  <th className="px-6 py-4">Tên Miền</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSites.map((s) => (
                  <tr key={s.id} className="hover:bg-[#0F172A]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {s.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{s.ownerEmail || 'customer@cloudhost.vn'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-700 uppercase">{s.framework || 'HTML'}</span>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">Port: {s.port || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {s.customDomain || `${s.name}.pages.local`}
                    </td>
                    <td className="px-6 py-4">
                      <AdminStaticSiteStatusCell site={s} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingSite(s);
                          setEditForm({
                            name: s.name,
                            customDomain: s.customDomain || ''
                          });
                        }}
                        className="px-2.5 py-1.5 rounded bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 font-bold transition-colors text-[11px]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleForceRedeploy(s.id)}
                        className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-emerald-50 text-slate-200 hover:text-emerald-700 font-bold transition-colors text-[11px]"
                      >
                        Deploy
                      </button>
                      <button
                        onClick={() => handleDeleteSite(s.id, s.name)}
                        className="px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px]"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSites.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy static site nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tạo Static Site */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              Khởi Tạo Static Site Mới
            </h3>
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Dự Án (Site Name)</label>
                <input
                  type="text"
                  required
                  placeholder="my-portfolio"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Custom Domain (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="portfolio.mycompany.vn"
                  value={createForm.customDomain}
                  onChange={(e) => setCreateForm({ ...createForm, customDomain: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                  Khởi Tạo Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Static Site */}
      {editingSite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Cấu Hình Website: {editingSite.name}</h3>
            <form onSubmit={handleUpdateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Dự Án</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Custom Domain</label>
                <input
                  type="text"
                  placeholder="subdomain.domain.vn"
                  value={editForm.customDomain}
                  onChange={(e) => setEditForm({ ...editForm, customDomain: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminStaticSiteStatusCell({ site }: { site: AdminStaticSiteDto }) {
  const { status, isProvisioning, isSlow, elapsedSeconds } = useResourceProvisioningDetails(
    'StaticSiteProject',
    site.id,
    site.status
  );

  return (
    <div className="space-y-1">
      <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
      {site.failureReason && (
        <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded-sm max-w-[220px] truncate" title={site.failureReason}>
          {site.failureReason}
        </div>
      )}
    </div>
  );
}
