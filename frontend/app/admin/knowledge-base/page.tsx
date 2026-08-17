'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Search, AlertCircle, Eye, CheckCircle2, X } from 'lucide-react';
import { api } from '@/src/lib/api';

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  categoryTag: string;
  content: string;
  viewCount: number;
  isPublished: boolean;
  authorId?: string;
}

export default function AdminKnowledgeBasePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryTag, setCategoryTag] = useState('VPS');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin' && response.data?.role !== 'Editor') {
        router.push('/dashboard');
        return;
      }
      fetchArticles();
    } catch {
      router.push('/login');
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/knowledge-base');
      setArticles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setCategoryTag('VPS');
    setContent('');
    setIsPublished(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (art: KBArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setCategoryTag(art.categoryTag || 'VPS');
    setContent(art.content || '');
    setIsPublished(art.isPublished);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      alert('Vui lòng điền đầy đủ tiêu đề, slug và nội dung.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingArticle) {
        // Update
        await api.put(`/knowledge-base/${editingArticle.id}`, {
          id: editingArticle.id,
          title,
          slug,
          categoryTag,
          content,
          isPublished
        });
      } else {
        // Create
        await api.post('/knowledge-base', {
          title,
          slug,
          categoryTag,
          content,
          isPublished
        });
      }
      setShowModal(false);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu bài viết. Vui lòng kiểm tra lại slug hoặc thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết hướng dẫn này?')) return;
    try {
      await api.delete(`/knowledge-base/${id}`);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Xóa bài viết thất bại.');
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.categoryTag && a.categoryTag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Knowledge Base</h1>
              <p className="text-sm text-slate-500">{articles.length} bài viết hướng dẫn</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm bài viết
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết theo tiêu đề, slug, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tiêu đề & Đường dẫn</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Lượt xem</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{article.title}</p>
                          <p className="text-xs text-slate-500 font-mono">/knowledge-base/{article.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {article.categoryTag || 'Chung'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Eye className="w-4 h-4 text-slate-400" />
                        {(article.viewCount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${article.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {article.isPublished ? 'Công khai' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(article)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Chưa có bài viết hướng dẫn nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Thêm/Sửa Bài Viết */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingArticle ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tiêu đề bài viết</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hướng dẫn cấu hình SSL Let's Encrypt cho Nginx"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingArticle) {
                      setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    placeholder="huong-dan-ssl-nginx"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chuyên mục Tag</label>
                  <select
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="VPS">Cloud VPS</option>
                    <option value="Dedicated">Dedicated Server</option>
                    <option value="Hosting">Web Hosting / NVMe</option>
                    <option value="Domain">Tên miền & DNS</option>
                    <option value="SSL">Chứng chỉ SSL</option>
                    <option value="Security">Bảo mật & Tường lửa</option>
                    <option value="General">Kiến thức chung</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nội dung chi tiết (Markdown)</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Nhập hướng dẫn chi tiết từng bước..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Xuất bản công khai ngay cho khách hàng xem
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
