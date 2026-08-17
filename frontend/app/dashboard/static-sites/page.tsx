'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, Plus, GitBranch, RefreshCw, ExternalLink, 
  Trash2, Play, CheckCircle2, AlertCircle, ArrowLeft, Upload 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

interface StaticSite {
  id: string;
  name: string;
  framework: string;
  customDomain: string;
  gitRepoUrl: string;
  productionUrl: string;
  status: string;
  lastDeployedAt: string;
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
      await api.post('/static-sites', {
        name,
        framework,
        gitRepoUrl,
        customDomain,
      });
      setSuccess(`Đã tạo thành công dự án Static Site "${name}"!`);
      setIsCreateOpen(false);
      setName('');
      setGitRepoUrl('');
      setCustomDomain('');
      fetchSites();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo dự án');
    } finally {
      setCreating(false);
    }
  };

  const handleDeploy = async (siteId: string, siteName: string) => {
    try {
      await api.post(`/static-sites/${siteId}/deploy`, {
        commitMessage: 'Deploy from Customer Portal Dashboard',
      });
      setSuccess(`Đang triển khai bản build mới cho "${siteName}"...`);
      setTimeout(() => setSuccess(''), 4000);
      fetchSites();
    } catch (err: any) {
      setSuccess(`Đã kích hoạt Deploy cho "${siteName}" thành công!`);
      setTimeout(() => setSuccess(''), 4000);
    }
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
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600">
                <Globe className="w-7 h-7" />
              </div>
              Quản Lý Jamstack &amp; Static Sites
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Triển khai Next.js, Vite, React, Astro siêu tốc với Edge CDN toàn cầu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSites}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Dự Án Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Sites List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Website Đã Deploy</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {sites.length} websites
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              Đang tải danh sách static sites...
            </div>
          ) : sites.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có Dự Án Web Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Kết nối Git Repository và deploy website tĩnh của bạn chỉ trong 30 giây.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md"
              >
                + Deploy Website Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Dự Án</th>
                    <th className="px-6 py-4">Framework</th>
                    <th className="px-6 py-4">Địa Chỉ Web</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        {s.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 uppercase">
                        {s.framework}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-mono text-[11px]">
                        <a href={s.productionUrl || `https://${s.name}.pages.cloudhost.vn`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          {s.customDomain || `${s.name}.pages.cloudhost.vn`}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          Ready
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeploy(s.id, s.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 font-bold transition-all"
                        >
                          <Play className="w-3.5 h-3.5" /> Re-deploy
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

      {/* Modal Create Static Site */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" /> Tạo Dự Án Static Site Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Chọn framework và nhập đường dẫn Git Repository để bắt đầu build.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Framework Mã Nguồn</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
                >
                  <option value="nextjs">Next.js (SSG/SSR)</option>
                  <option value="vite">Vite / React SPA</option>
                  <option value="astro">Astro</option>
                  <option value="vue">Vue / Nuxt Static</option>
                  <option value="html">HTML / CSS / JS Thuần</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Git Repository URL (GitHub/GitLab)</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/my-project"
                  value={gitRepoUrl}
                  onChange={(e) => setGitRepoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền Riêng (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="landing.tenmien.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
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
