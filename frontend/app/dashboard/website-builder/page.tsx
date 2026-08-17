'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layout, Plus, Sparkles, RefreshCw, ExternalLink, 
  Trash2, Edit3, CheckCircle2, AlertCircle, ArrowLeft, Eye 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

interface WebsiteProject {
  id: string;
  name: string;
  template: string;
  domain: string;
  status: string;
  pagesCount: number;
  lastEditedAt: string;
}

export default function DashboardWebsiteBuilderPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('ecommerce');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website-builder/projects');
      setProjects(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load website builder projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      await api.post('/website-builder/projects', {
        name,
        template,
        domain: domain || `${name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.site.cloudhost.vn`,
      });
      setSuccess(`Đã tạo thành công dự án Website "${name}"!`);
      setIsCreateOpen(false);
      setName('');
      setDomain('');
      fetchProjects();
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
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600">
                <Layout className="w-7 h-7" />
              </div>
              Quản Lý Dự Án AI Website Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Chỉnh sửa kéo thả trực quan, xuất bản trang web và theo dõi lưu lượng truy cập.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProjects}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Website Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Dự Án Website</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {projects.length} website
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-pink-600" />
              Đang tải danh sách website...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto mb-4">
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có Dự Án Website Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Chọn mẫu giao diện và để trợ lý AI thiết kế website hoàn chỉnh cho bạn.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-pink-600 text-white font-bold text-xs shadow-md"
              >
                + Bắt Đầu Tạo Website
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Website</th>
                    <th className="px-6 py-4">Mẫu Thiết Kế</th>
                    <th className="px-6 py-4">Tên Miền</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-pink-500" />
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold uppercase">
                        {p.template}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-mono text-[11px]">
                        <a href={`https://${p.domain}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          {p.domain}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => alert(`Mở trình soạn thảo AI Website Builder cho dự án "${p.name}"`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 font-bold transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Mở Trình Soạn Thảo
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

      {/* Modal Create Website Project */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" /> Tạo Dự Án Website AI Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Chọn phong cách thiết kế và thiết lập tên thương hiệu của bạn.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Dự Án / Website</label>
                <input
                  type="text"
                  required
                  placeholder="Fashion Store / Tech Startup Landing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mẫu Thiết Kế Sẵn</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-pink-500 bg-white font-bold"
                >
                  <option value="ecommerce">Shop Bán Hàng E-commerce</option>
                  <option value="landing">Landing Page Giới Thiệu Sản Phẩm</option>
                  <option value="company">Website Doanh Nghiệp &amp; Dịch Vụ</option>
                  <option value="portfolio">Portfolio Cá Nhân / Nhiếp Ảnh</option>
                  <option value="restaurant">Nhà Hàng &amp; Quán Cà Phê</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền Riêng (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="tenmien.vn"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-pink-500"
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
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Khởi Tạo Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
