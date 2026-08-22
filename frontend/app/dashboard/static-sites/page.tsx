'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, Plus, GitBranch, RefreshCw, ExternalLink, 
  Trash2, Play, CheckCircle2, AlertCircle, ArrowLeft, Upload, AlertTriangle 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface StaticSite {
  id: string;
  name: string;
  framework?: string;
  customDomain?: string;
  gitRepoUrl?: string;
  productionUrl?: string;
  port?: number;
  status: string;
  lastDeployedAt?: string;
  createdAt: string;
}

export default function DashboardStaticSitesPage() {
  const { user } = useAuthStore();
  const [sites, setSites] = useState<StaticSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [framework, setFramework] = useState('nextjs');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/static-sites');
      setSites(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load static sites', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const res = await api.post('/static-sites', {
        name: sanitizedName,
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        customDomain,
      });

      const siteId = res.data?.id || `site-${Date.now()}`;
      
      // Auto trigger deploy
      await api.post(`/static-sites/${siteId}/deploy`, {
        gitCommitHash: `initial-commit-${Date.now()}`,
      });

      const newSite: StaticSite = {
        id: siteId,
        name: sanitizedName,
        framework,
        customDomain,
        status: 'Provisioning',
        createdAt: new Date().toISOString(),
      };

      setSites((prev) => [newSite, ...prev]);
      setSuccess(`Dự án "${sanitizedName}" đã được tạo và đang được Docker Nginx biên dịch tự động...`);
      setIsCreateOpen(false);
      setName('');
      setGitRepoUrl('');
      setCustomDomain('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo dự án');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-emerald-100 text-emerald-600">
                <Globe className="w-7 h-7" />
              </div>
              Quản Lý Jamstack &amp; Static Sites
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Triển khai Next.js, Vite, React, Astro siêu tốc trên container Nginx chuyên biệt với tên miền riêng và chứng chỉ SSL tự động.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSites}
              className="p-2.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Dự Án Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Sites List */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Website</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {sites.length} websites
            </span>
          </div>

          {loading && sites.length === 0 ? (
            <div className="p-12 text-center text-slate-600 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              Đang tải danh sách static sites...
            </div>
          ) : sites.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có Dự Án Web Nào</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
                Triển khai website tĩnh của bạn với tốc độ cao chỉ trong tích tắc.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-md bg-emerald-600 text-white font-bold text-xs shadow-md"
              >
                + Deploy Website Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sites.map((s) => (
                <StaticSiteRowItem key={s.id} site={s} onRefresh={fetchSites} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Static Site */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" /> Tạo Dự Án Static Site Mới
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Chọn framework và nhập tên dự án để khởi tạo container web server.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Dự Án (Subdomain)</label>
                <input
                  type="text"
                  required
                  placeholder="my-portfolio / company-landing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Framework Mã Nguồn</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
                >
                  <option value="nextjs">Next.js (SSG/Export)</option>
                  <option value="vite">Vite / React SPA</option>
                  <option value="astro">Astro</option>
                  <option value="html">HTML / CSS / JS Thuần</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền Riêng (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="landing.tenmien.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Deploy Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaticSiteRowItem({ site, onRefresh }: { site: StaticSite; onRefresh: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds, slowWarningText } = useResourceProvisioningDetails(
    'StaticSiteProject',
    site.id,
    site.status
  );

  const [redeploying, setRedeploying] = useState(false);

  const handleRedeploy = async () => {
    setRedeploying(true);
    try {
      await api.post(`/static-sites/${site.id}/deploy`, {
        gitCommitHash: `redeploy-${Date.now()}`,
      });
      alert('Đã kích hoạt Re-deploy bản build mới!');
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi re-deploy');
    } finally {
      setRedeploying(false);
    }
  };

  const liveUrl = site.customDomain 
    ? `http://${site.customDomain}` 
    : (site.port ? `http://localhost:${site.port}` : `http://${site.name}.pages.local`);

  return (
    <div className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{site.name}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700">
                {site.framework || 'HTML/Nginx'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              URL: <a href={liveUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">{liveUrl}</a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
          {status === 'Running' || status === 'Active' || status === 'Ready' ? (
            <button
              onClick={handleRedeploy}
              disabled={redeploying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${redeploying ? 'animate-spin' : ''}`} />
              Re-deploy
            </button>
          ) : null}
        </div>
      </div>

      {/* Slow Warning Banner */}
      {isSlow && (
        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{slowWarningText}</span>
        </div>
      )}

      {/* Failed State Alert */}
      {status === 'Failed' && (
        <ResourceFailureAlert
          resourceName={`Static Site ${site.name}`}
          onRetry={handleRedeploy}
          supportHref="/dashboard/tickets"
        />
      )}
    </div>
  );
}
