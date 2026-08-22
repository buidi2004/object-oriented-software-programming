'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Newspaper, Search, AlertCircle, 
  Eye, Calendar, Upload, CheckCircle2, X, Image as ImageIcon, 
  ExternalLink, Tag, RefreshCw, Check, Globe
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content?: string;
  thumbnailUrl?: string;
  tags?: string;
  viewCount: number;
  status: string; // 'Draft' | 'Published'
  publishedAt?: string;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnailUrl: '',
    tags: '',
    status: 1 // 0: Draft, 1: Published
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      fetchNews();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/news?onlyPublished=false');
      if (Array.isArray(res.data)) {
        setNews(res.data.map((item: any) => ({
          ...item,
          viewCount: item.viewCount || 0,
          status: item.status || 'Draft'
        })));
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      thumbnailUrl: '',
      tags: '',
      status: 1
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: NewsItem) => {
    setEditingId(item.id);
    const isPub = String(item.status).toLowerCase() === 'published' || item.status === '1' || (item as any).status === 1;
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      content: item.content || '',
      thumbnailUrl: item.thumbnailUrl || '',
      tags: item.tags || '',
      status: isPub ? 1 : 0
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setIsUploading(true);
      const res = await api.post('/news/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.imageUrl) {
        setFormData(prev => ({ ...prev, thumbnailUrl: res.data.imageUrl }));
        showToast('Tải ảnh bìa lên thành công!');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      showToast('Vui lòng điền đầy đủ tiêu đề, slug và nội dung.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        // Update
        await api.put(`/news/${editingId}`, {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          thumbnailUrl: formData.thumbnailUrl || null,
          tags: formData.tags || null,
          status: formData.status
        });
        showToast('Cập nhật bài viết thành công!');
      } else {
        // Create
        await api.post('/news', {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          thumbnailUrl: formData.thumbnailUrl || null,
          tags: formData.tags || null,
          status: formData.status
        });
        showToast('Đăng bài viết mới thành công!');
      }

      setShowModal(false);
      fetchNews();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Đã có lỗi xảy ra.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      await api.patch(`/news/${item.id}/publish`, {});
      showToast(`Đã xuất bản bài viết "${item.title}"!`);
      fetchNews();
    } catch (err) {
      console.error(err);
      showToast('Không thể thay đổi trạng thái xuất bản', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;
    try {
      await api.delete(`/news/${id}`);
      setNews(prev => prev.filter(n => n.id !== id));
      showToast(`Đã xóa bài viết "${title}"!`);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xóa bài viết', 'error');
    }
  };

  const isItemPublished = (itemStatus: any) => {
    const s = String(itemStatus || '').toLowerCase();
    return s === 'published' || s === '1';
  };

  const filteredNews = news.filter(n => {
    const matchesSearch = (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.tags && n.tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'published') return matchesSearch && isItemPublished(n.status);
    if (statusFilter === 'draft') return matchesSearch && !isItemPublished(n.status);
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Tin tức & Blog</h1>
              <p className="text-xs text-slate-500">{news.length} bài viết • Quản trị nội dung</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchNews}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleOpenAddModal} 
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Viết bài mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, tags hoặc slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'published', label: 'Đã xuất bản' },
              { id: 'draft', label: 'Bản nháp' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNews.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              {/* Thumbnail */}
              <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                {item.thumbnailUrl ? (
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span className="text-xs">Chưa có ảnh bìa</span>
                  </div>
                )}
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                  isItemPublished(item.status) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isItemPublished(item.status) ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {item.viewCount} lượt xem
                  </span>
                  {item.tags && (
                    <span className="flex items-center gap-1 font-medium text-[#1F1F1F] bg-blue-50 px-2 py-0.5 rounded">
                      <Tag className="w-3 h-3" />
                      {item.tags}
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 hover:text-[#1F1F1F] transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-xs text-slate-500 font-mono mb-4 truncate">
                  /{item.slug}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                  {!isItemPublished(item.status) ? (
                    <button 
                      onClick={() => handleTogglePublish(item)}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" /> Xuất bản
                    </button>
                  ) : (
                    <Link
                      href={`/news/${item.slug}`}
                      target="_blank"
                      className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Xem bài
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => handleOpenEditModal(item)} 
                    className="p-2 text-slate-500 hover:text-[#1F1F1F] hover:bg-blue-50 rounded-xl transition-colors"
                    title="Chỉnh sửa bài viết"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id, item.title)} 
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-semibold text-slate-700">Không tìm thấy bài viết nào</p>
            <p className="text-xs text-slate-600 mt-1">Bấm "Viết bài mới" để tạo bài viết đầu tiên</p>
          </div>
        )}
      </main>

      {/* Add / Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Chỉnh sửa bài viết' : 'Viết bài tin tức mới'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đăng tải nội dung chia sẻ kiến thức, hướng dẫn và cập nhật hệ thống
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tiêu đề bài viết</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hướng dẫn cấu hình VPS Nginx hiệu năng cao..."
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, "");
                    setFormData({ ...formData, title, slug: formData.slug || slug });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Đường dẫn tĩnh (Slug URL)</label>
                <input
                  type="text"
                  required
                  placeholder="vd: huong-dan-cau-hinh-vps-nginx"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Thumbnail Image Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Ảnh bìa bài viết</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://... hoặc tải ảnh từ máy tính"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Đang tải...' : 'Tải ảnh'}
                  </button>
                </div>
                {formData.thumbnailUrl && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={formData.thumbnailUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Tags & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tags (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="VPS, Cloud, Linux, Hướng dẫn..."
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Trạng thái bài viết</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={1}>Xuất bản công khai (Published)</option>
                    <option value={0}>Lưu bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Content Markdown / HTML */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Nội dung bài viết (Markdown / HTML)</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Nhập nội dung bài viết chi tiết tại đây..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu Thay Đổi' : 'Đăng Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
